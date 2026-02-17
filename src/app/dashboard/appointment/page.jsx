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
      setDisabledSlotRows(
        items.map((item, index) => ({
          id: `${item?.date ?? item?.appointment_date ?? "row"}-${index}`,
          date: String(item?.date ?? item?.appointment_date ?? "").trim(),
          disabled_timeSlots: Array.isArray(item?.disabled_timeSlots)
            ? item.disabled_timeSlots
            : Array.isArray(item?.disabled_time_slots)
            ? item.disabled_time_slots
            : [],
        }))
      );
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
          return { label, flag };
        })
        .filter(Boolean);
      return {
        id: row.id,
        date: row.date,
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
                    </tr>
                  </thead>
                  <tbody>
                    {disabledLoading ? (
                      <tr>
                        <td className={styles.td} colSpan={2}>
                          Loading...
                        </td>
                      </tr>
                    ) : disabledTableRows.length ? (
                      disabledTableRows.map((row) => {
                        const slots = row.slots.length
                          ? row.slots
                          : [{ label: "No disabled slots", flag: 0 }];
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
                          </tr>
                        ));
                      })
                    ) : (
                      <tr>
                        <td className={styles.td} colSpan={2}>
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
    </div>
  );
}
