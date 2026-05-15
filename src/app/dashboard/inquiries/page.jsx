'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTableSuspense.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import {
  fetchInquiries,
  deleteInquiry,
  selectInquiries,
  selectInquiryLoading,
} from "../../../store/slices/inquirySlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import styles from "../../../styles/crudPage.module.css";

export default function InquiriesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectInquiries);
  const loading = useAppSelector(selectInquiryLoading);
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({
    no: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date: "",
    appointment_type: "",
    time_slot: "",
    display_time_slot: "",
  });

  useEffect(() => {
    dispatch(fetchInquiries());
  }, [dispatch]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => ({
      no: index + 1,
      id: item.id,
      first_name: item.first_name ?? "-",
      last_name: item.last_name ?? "-",
      email: item.email ?? "-",
      phone_number: item.phone_number ?? "-",
      country: item.country ?? "-",
      date: item.date ?? "-",
      time_slot: item.time_slot ? (
  <>
    {item.time_slot}{" "}
    <small style={{ color: "#888", fontSize: "0.78em" }}>
      <br />
      (EET, UTC + 2:00)
    </small>
  </>
) : "-",
      display_time_slot: item.display_time_slot ?? "-",
      display_timezone: item.display_timezone ?? "",
      appointment_type: item.appointment_type ?? "-",
      description: item.description ?? "-",
    }));
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const firstNameQuery = normalize(filters.first_name);
    const lastNameQuery = normalize(filters.last_name);
    const emailQuery = normalize(filters.email);
    const phoneQuery = normalize(filters.phone_number);
    const dateQuery = normalize(filters.date);
    const timeSlotQuery = normalize(filters.time_slot);
    const displayTimeSlotQuery = normalize(filters.display_time_slot);
    const appointmentTypeQuery = normalize(filters.appointment_type);

    if (!noQuery && !firstNameQuery && !lastNameQuery && !emailQuery && !phoneQuery && !dateQuery && !timeSlotQuery && !displayTimeSlotQuery && !appointmentTypeQuery) {
      return tableRows;
    }

    return tableRows.filter((row) => {
      const noMatches = noQuery ? normalize(row.no).includes(noQuery) : true;
      const firstNameMatches = firstNameQuery ? normalize(row.first_name).includes(firstNameQuery) : true;
      const lastNameMatches = lastNameQuery ? normalize(row.last_name).includes(lastNameQuery) : true;
      const emailMatches = emailQuery ? normalize(row.email).includes(emailQuery) : true;
      const phoneMatches = phoneQuery ? normalize(row.phone_number).includes(phoneQuery) : true;
      const dateMatches = dateQuery ? normalize(row.date).includes(dateQuery) : true;
      const timeSlotMatches = timeSlotQuery ? normalize(row.time_slot).includes(timeSlotQuery) : true;
      const displayTimeSlotMatches = displayTimeSlotQuery ? normalize(row.display_time_slot).includes(displayTimeSlotQuery) : true;
      const appointmentTypeMatches = appointmentTypeQuery ? normalize(row.appointment_type).includes(appointmentTypeQuery) : true;
      return noMatches && firstNameMatches && lastNameMatches && emailMatches && phoneMatches && dateMatches && timeSlotMatches && displayTimeSlotMatches && appointmentTypeMatches;
    });
  }, [filters, tableRows]);

  const handleDelete = (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteInquiry(deleteTarget));
    dispatch(fetchInquiries());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: false },
    { key: "first_name", header: "First Name", filterable: true, filterPlaceholder: "Search First Name" },
    { key: "last_name", header: "Last Name", filterable: true, filterPlaceholder: "Search Last Name" },
    { key: "email", header: "Email", filterable: true, filterPlaceholder: "Search Email" },
    { key: "phone_number", header: "Phone", filterable: true, filterPlaceholder: "Search Phone" },
    { key: "date", header: "Date", filterable: true, filterPlaceholder: "Search Date" },
    { key: "time_slot", header: "Time Slot (Helsinki)", filterable: false, filterPlaceholder: "Search Time Slot" },
    {
      key: "display_time_slot",
      header: "Time Slot By Client (Selected Timezone)",
      filterable: false,
      filterPlaceholder: "Search Local Time Slot",
      render: (row) => {
        const time = row.display_time_slot;
        const tz = row.display_timezone;
        if (!time || time === "-") return "-";
        return (
          <span>
            {time}
            {tz && (
              <>
                <br />
                <small style={{ color: "#888", fontSize: "0.78em" }}>({tz})</small>
              </>
            )}
          </span>
        );
      },
    },
    { key: "appointment_type", header: "Appointment Type", filterable: true, filterPlaceholder: "Search Appointment Type" },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
          <Button variant="danger" size="sm" icon="delete" iconOnly onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Inquiries</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh"
                  iconOnly
                  onClick={() => dispatch(fetchInquiries())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No inquiries found"}
            />
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
        open={deleteTarget !== null}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}