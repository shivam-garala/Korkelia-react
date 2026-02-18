'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import AdminSelectField from "../../../components/ui/AdminSelectField.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import { toast } from "react-toastify";
import axiosClient from "../../../lib/axiosClient.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import crudStyles from "../../../styles/crudPage.module.css";
import styles from "./page.module.css";

const normalizeSlotSelection = (value, options) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const validValues = options.map((opt) => String(opt.value));
  return selected.filter((slot) => validValues.includes(String(slot)));
};

const normalizeSlotLabel = (value) => String(value ?? "").trim();

const toFlagValue = (value) =>
  value === true || value === 1 || value === "1" || value === "true" ? 1 : 0;

const pickValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

const normalizeId = (value) => {
  if (value === null || value === undefined) return "";
  const normalized = String(value).trim();
  return normalized;
};

const resolveDateId = (item) => {
  const value = pickValue(item, [
    "date_id",
    "appointment_date_id",
    "appointmentDateId",
    "dateId",
    "disabled_date_id",
    "disabledDateId",
    "appointment_date_time_id",
    "appointmentDateTimeId",
    "id",
  ]);
  return normalizeId(value);
};

const resolveTimeSlotId = (slot, fallback) => {
  const value = pickValue(slot, [
    "time_slot_id",
    "timeSlotId",
    "time_slotId",
    "slot_id",
    "slotId",
    "appointment_time_slot_id",
    "appointmentTimeSlotId",
    "disabled_time_slot_id",
    "disabledTimeSlotId",
    "id",
  ]);
  return normalizeId(value) || normalizeId(fallback);
};

const createRow = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  date: "",
  slots: [],
});

export default function AppointmentManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const userEmail = useAppSelector(selectEmail) ?? "";
  const avatarInitials = useMemo(() => {
    const normalizedName = (userName ?? "").trim();
    if (normalizedName.length) {
      return normalizedName
        .split(" ")
        .map((part) => part.trim()?.[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    const normalizedEmail = (userEmail ?? "").trim();
    if (normalizedEmail.length) {
      const firstChar = normalizedEmail[0];
      const domainChar = normalizedEmail.split("@")[1]?.[0];
      return [firstChar, domainChar].filter(Boolean).join("").slice(0, 2).toUpperCase() || "U";
    }
    return "U";
  }, [userEmail, userName]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [rows, setRows] = useState([createRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [slotOptions, setSlotOptions] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [disabledSlotMap, setDisabledSlotMap] = useState({});
  const [disabledLoading, setDisabledLoading] = useState(false);
  const [disabledSlotRows, setDisabledSlotRows] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const minDateValue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const loadSlots = useCallback(async () => {
    setSlotLoading(true);
    try {
      const { data } = await axiosClient.get("/api/appointment/timeslots/dashboard");
      const slots = data?.data ?? data ?? [];
      if (!Array.isArray(slots) || !slots.length) {
        setSlotOptions([]);
        setRows((prev) => prev.map((row) => ({ ...row, slots: [] })));
        return;
      }
      const normalized = slots
        .map((slot) => {
          if (slot && typeof slot === "object") {
            return (
              slot.time_slot ??
              slot.slot ??
              slot.label ??
              slot.value ??
              slot.name ??
              ""
            );
          }
          return slot;
        })
        .map((slot) => String(slot).trim())
        .filter(Boolean)
        .map((slot) => ({ value: slot, label: slot }));
      setSlotOptions(normalized);
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          slots: normalizeSlotSelection(row.slots, normalized),
        }))
      );
    } catch (error) {
      setSlotOptions([]);
      setRows((prev) => prev.map((row) => ({ ...row, slots: [] })));
      toast.error("Failed to load time slots.");
      console.error("Appointment time slots load error", error);
    } finally {
      setSlotLoading(false);
    }
  }, []);

  const loadDisabledSlots = useCallback(async () => {
    setDisabledLoading(true);
    try {
      const { data } = await axiosClient.get(
        "/api/appointment/get-disabled-date-and-time-slots/dashboard"
      );
      const items = data?.data ?? [];
      if (!Array.isArray(items)) {
        setDisabledSlotMap({});
        return;
      }
      const map = items.reduce((acc, item) => {
        const dateKey = String(item?.date ?? item?.appointment_date ?? "").trim();
        if (!dateKey) return acc;
        const disabledList = Array.isArray(item?.disabled_timeSlots)
          ? item.disabled_timeSlots
          : Array.isArray(item?.disabled_time_slots)
          ? item.disabled_time_slots
          : [];
        const slotFlags = disabledList.reduce((slotAcc, slot) => {
          const slotLabel = normalizeSlotLabel(
            slot?.time_slot ?? slot?.slot ?? slot?.label ?? slot?.value ?? ""
          );
          if (!slotLabel) return slotAcc;
          slotAcc[slotLabel] = toFlagValue(slot?.flag ?? slot?.is_selected ?? slot?.selected);
          return slotAcc;
        }, {});
        acc[dateKey] = slotFlags;
        return acc;
      }, {});
      setDisabledSlotMap(map);
      const mappedRows = items.map((item, index) => {
        const dateValue = normalizeSlotLabel(item?.date ?? item?.appointment_date);
        const dateId = resolveDateId(item);
        return {
          id: `${dateId || dateValue || "row"}-${index}`,
          date: dateValue || dateId,
          dateId,
          disabled_timeSlots: Array.isArray(item?.disabled_timeSlots)
            ? item.disabled_timeSlots
            : Array.isArray(item?.disabled_time_slots)
            ? item.disabled_time_slots
            : [],
        };
      });
      setDisabledSlotRows(mappedRows.filter((row) => Boolean(row.dateId)));
    } catch (error) {
      setDisabledSlotMap({});
      setDisabledSlotRows([]);
      toast.error("Failed to load disabled time slots.");
      console.error("Disabled time slots load error", error);
    } finally {
      setDisabledLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadDisabledSlots();
  }, [loadDisabledSlots]);

  const handleSlotsChange = (rowId) => (event) => {
    const nextValue = event?.target?.value ?? [];
    const nextSlots = Array.isArray(nextValue)
      ? nextValue
      : nextValue
      ? [nextValue]
      : [];
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, slots: nextSlots } : row))
    );
  };

  const handleDateChange = (rowId) => (event) => {
    const nextDate = event?.target?.value ?? "";
    const disabledFlags = disabledSlotMap[nextDate] ?? {};
    const disabledSlots = Object.keys(disabledFlags).filter(
      (slot) => disabledFlags[slot] === 0
    );
    const normalized = slotOptions.length
      ? normalizeSlotSelection(disabledSlots, slotOptions)
      : disabledSlots;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, date: nextDate, slots: normalized }
          : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const requestDeleteDate = (row) => {
    const dateId = normalizeId(row?.dateId);
    if (!dateId) {
      toast.error("Missing date id for delete.");
      return;
    }
    setDeleteTarget({
      type: "date",
      dateId,
      dateLabel: row?.date || "",
    });
  };

  const requestDeleteSlot = (row, slot) => {
    const dateId = normalizeId(row?.dateId);
    const timeSlotId = normalizeId(slot?.timeSlotId || slot?.label);
    if (!dateId) {
      toast.error("Missing date id for delete.");
      return;
    }
    if (!timeSlotId) {
      toast.error("Missing time slot id for delete.");
      return;
    }
    setDeleteTarget({
      type: "slot",
      dateId,
      timeSlotId,
      dateLabel: row?.date || "",
      slotLabel: slot?.label || "",
    });
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteSubmitting) return;
    const dateId = normalizeId(deleteTarget.dateId);
    if (!dateId) {
      toast.error("Missing date id for delete.");
      setDeleteTarget(null);
      return;
    }
    let timeSlotId = normalizeId(deleteTarget.timeSlotId);
    if (deleteTarget.type === "date") {
      timeSlotId = timeSlotId || "0";
    }
    if (!timeSlotId) {
      toast.error("Missing time slot id for delete.");
      return;
    }
    setDeleteSubmitting(true);
    try {
      const response = await axiosClient.delete(
        `/api/appointment/delete-disabled-date-and-time-slots/${encodeURIComponent(
          dateId
        )}/${encodeURIComponent(timeSlotId)}`
      );
      await loadDisabledSlots();
      if (!response?.data?.message) {
        toast.success(
          deleteTarget.type === "date"
            ? "Disabled date deleted."
            : "Disabled time slot deleted."
        );
      }
    } catch (error) {
      toast.error(
        deleteTarget.type === "date"
          ? "Unable to delete disabled date."
          : "Unable to delete disabled time slot."
      );
      console.error("Disabled slot delete error", error);
    } finally {
      setDeleteSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const disabledTableRows = useMemo(() => {
    return disabledSlotRows.map((row) => {
      const slots = Array.isArray(row?.disabled_timeSlots)
        ? row.disabled_timeSlots
        : [];
      const normalizedSlots = slots
        .map((slot) => {
          const label = normalizeSlotLabel(
            slot?.time_slot ?? slot?.slot ?? slot?.label ?? slot?.value ?? ""
          );
          if (!label) return null;
          const flag = toFlagValue(slot?.flag ?? slot?.is_selected ?? slot?.selected);
          return {
            label,
            flag,
            timeSlotId: resolveTimeSlotId(slot, label),
          };
        })
        .filter(Boolean)
        .filter((slot) => slot.flag !== 1); // hide booked appointments
      return {
        id: row.id,
        date: row.date,
        dateId: row.dateId,
        slots: normalizedSlots.length ? normalizedSlots : [],
      };
    });
  }, [disabledSlotRows]);

  const getRowOptions = (rowDate) => {
    const flags = disabledSlotMap[rowDate] ?? {};
    const baseOptions = slotOptions.map((opt) => {
      const flag = flags[String(opt.value)];
      const isBooked = flag === 1;
      return {
        ...opt,
        label: isBooked ? `${opt.label} (Appointment Booked)` : opt.label,
        isDisabled: isBooked,
      };
    });

    const baseValues = new Set(baseOptions.map((opt) => String(opt.value)));
    const extraOptions = Object.keys(flags)
      .filter((slot) => !baseValues.has(String(slot)))
      .map((slot) => ({
        value: slot,
        label: flags[slot] === 1 ? `${slot} (Appointment Booked)` : slot,
        isDisabled: flags[slot] === 1,
      }));

    return [...baseOptions, ...extraOptions];
  };

  useEffect(() => {
    if (!rows.length) return;
    if (!Object.keys(disabledSlotMap).length && !slotOptions.length) return;
    setRows((prev) =>
      prev.map((row) => {
        if (!row.date) return row;
        const flags = disabledSlotMap[row.date] ?? {};
        const filtered = normalizeSlotSelection(row.slots, slotOptions).filter(
          (slot) => (flags[String(slot)] ?? 0) !== 1
        );
        if (row.slots.length === 0) {
          const disabledSlots = Object.keys(flags).filter((slot) => flags[slot] === 0);
          const normalized = slotOptions.length
            ? normalizeSlotSelection(disabledSlots, slotOptions)
            : disabledSlots;
          if (normalized.length) {
            return { ...row, slots: normalized };
          }
        }
        return filtered.length === row.slots.length ? row : { ...row, slots: filtered };
      })
    );
  }, [disabledSlotMap, slotOptions, rows.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const missingDateIndex = rows.findIndex((row) => !row.date);
    if (missingDateIndex !== -1) {
      toast.error("Please select a date for every row.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = rows.map((row) => ({
        date: row.date,
        disabled_timeSlots: Array.from(new Set(row.slots.map((slot) => String(slot)))).map(
          (slot) => ({ time_slot: slot, flag: 0 })
        ),
      }));
      await axiosClient.post("/api/appointment/disable-date-and-time-slots", payload);
      await loadDisabledSlots();
      toast.success("Appointment availability saved.");
    } catch (error) {
      toast.error("Unable to save appointment availability.");
      console.error("Appointment management submit error", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layout.page}>
      <SidebarNav activePath={pathname} />

      <div className={layout.main}>
        <AdminHeader
          onSearch={() => setSearchOpen(true)}
          onProfile={() => setProfileOpen(true)}
          avatarText={avatarInitials}
        />

        <main className={layout.content}>
          <div className={crudStyles.panel}>
            <div className={crudStyles.headerRow}>
              <h2 className={crudStyles.title}>Appointment Management</h2>
            </div>
            <form className={crudStyles.form} onSubmit={handleSubmit}>
              <div className={styles.rows}>
                {rows.map((row, index) => (
                  <div className={styles.inlineRow} key={row.id}>
                    <TextField
                      label={`Appointment Date${rows.length > 1 ? ` #${index + 1}` : ""}`}
                      type="date"
                      value={row.date}
                      min={minDateValue}
                      onChange={handleDateChange(row.id)}
                      required
                    />
                    <AdminSelectField
                      label="Time Slots (Optional)"
                      placeholder={
                        slotLoading
                          ? "Loading time slots..."
                          : slotOptions.length
                          ? "Select time slots"
                          : "No time slots available"
                      }
                      value={row.slots}
                      onChange={handleSlotsChange(row.id)}
                      options={getRowOptions(row.date)}
                      multiple
                      disabled={slotLoading || disabledLoading || !slotOptions.length}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.actionsRow}>
                <Button variant="primarySoft" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Submit"}
                </Button>
                <Button variant="secondary" icon="plus" iconOnly onClick={addRow}>
                  Add row
                </Button>
              </div>
            </form>
            <div className={styles.tableSection}>
              <h3 className={styles.tableTitle}>Disabled Dates & Time Slots</h3>
              <div className={styles.simpleTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Time Slot</th>
                      <th className={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disabledLoading ? (
                      <tr>
                        <td className={styles.td} colSpan={3}>
                          Loading...
                        </td>
                      </tr>
                    ) : disabledTableRows.length ? (
                      disabledTableRows.map((row) => {
                        const hasSlots = row.slots.length > 0;
                        const slots = hasSlots
                          ? row.slots
                          : [{ label: "No disabled slots", flag: 0, isPlaceholder: true }];
                        return slots.map((slot, index) => (
                          <tr key={`${row.id}-${slot.label}-${index}`}>
                            {index === 0 ? (
                              <td className={styles.td} rowSpan={slots.length}>
                                {row.date || "-"}
                              </td>
                            ) : null}
                            <td className={styles.td}>
                              <span
                                className={`${styles.slotItem} ${
                                  slot.flag === 1 ? styles.slotBooked : ""
                                }`}
                              >
                                {slot.label}
                                {slot.flag === 1 ? " (Appointment Booked)" : ""}
                              </span>
                            </td>
                            <td className={`${styles.td} ${styles.actionsCell}`}>
                              {hasSlots && slot.flag !== 1 ? (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon="delete"
                                  iconOnly
                                  onClick={() => requestDeleteSlot(row, slot)}
                                  disabled={
                                    deleteSubmitting ||
                                    slot.flag === 1 ||
                                    !row.dateId ||
                                    !(slot.timeSlotId || slot.label)
                                  }
                                  title={
                                    slot.flag === 1
                                      ? "Booked slots cannot be deleted."
                                      : "Delete disabled time slot"
                                  }
                                >
                                  Delete
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon="delete"
                                  iconOnly
                                  onClick={() => requestDeleteDate(row)}
                                  disabled={deleteSubmitting || !row.dateId}
                                >
                                  Delete
                                </Button>
                                // <Button
                                //   variant="danger"
                                //   size="sm"
                                //   icon="delete"
                                //   onClick={() => requestDeleteDate(row)}
                                //   disabled={deleteSubmitting || !row.dateId}
                                // >
                                //   Delete Date
                                // </Button>
                              )}
                            </td>
                          </tr>
                        ));
                      })
                    ) : (
                      <tr>
                        <td className={styles.td} colSpan={3}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={userName}
        email={userEmail}
        onLogout={async () => {
          try {
            await fetch("/api/admin/logout", { method: "POST" });
          } catch (error) {
            console.error("Logout error", error);
          }
          dispatch(clearCredentials());
          router.push("/login");
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === "date"
            ? "Delete Disabled Date"
            : "Delete Disabled Time Slot"
        }
        message={
          deleteTarget?.type === "date"
            ? `Delete the disabled date ${deleteTarget?.dateLabel || ""}? This will make it available again.`
            : `Delete the disabled time slot ${deleteTarget?.slotLabel || ""} on ${deleteTarget?.dateLabel || "this date"}?`
        }
        confirmLabel={deleteSubmitting ? "Deleting..." : "Delete"}
        onConfirm={confirmDelete}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}
