'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import {
  createUser,
  deleteUser,
  fetchUsers,
  selectUsers,
  selectUsersError,
  selectUsersLoading,
  updateUser,
} from "../../../store/slices/userSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import layout from "../../../styles/workspace.module.css";
import styles from "./page.module.css";

function pickValue(user, keys) {
  for (const key of keys) {
    const value = user?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return "";
}

export default function UserPage() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [filters, setFilters] = useState({ no: "", email: "", username: "" });

  const rows = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setEmail("");
    setUsername("");
    setPassword("");
    setModalOpen(true);
  };

  const openEdit = (user) => {
    const id = pickValue(user, ["id", "user_id", "userId"]);
    setEditingId(id);
    setEmail(pickValue(user, ["email", "user_email", "userEmail"]));
    setUsername(pickValue(user, ["username", "user_name", "userName", "name"]));
    setPassword("");
    setModalOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const payload = {
      email,
      username,
      ...(password ? { password } : null),
    };

    if (editingId) {
      await dispatch(updateUser({ id: editingId, payload }));
    } else {
      await dispatch(createUser(payload));
    }
    setModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteUser(deleteTarget));
    setDeleteTarget(null);
  };

  const tableRows = useMemo(() => {
    return rows.map((user, index) => {
      const rawId = pickValue(user, ["id", "user_id", "userId"]);
      return {
        no: index + 1,
        id: rawId || index + 1,
        email: pickValue(user, ["email", "user_email", "userEmail"]) || "-",
        username: pickValue(user, ["username", "user_name", "userName", "name"]) || "-",
        _raw: user,
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const emailQuery = normalize(filters.email);
    const usernameQuery = normalize(filters.username);

    if (!noQuery && !emailQuery && !usernameQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery) : true;
      const emailMatches = emailQuery ? normalize(row.email).includes(emailQuery) : true;
      const usernameMatches = usernameQuery ? normalize(row.username).includes(usernameQuery) : true;
      return noMatches && emailMatches && usernameMatches;
    });
  }, [filters.email, filters.no, filters.username, tableRows]);


  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "email", header: "Email", filterable: true, filterPlaceholder: "Search Email" },
    { key: "username", header: "Username", filterable: true, filterPlaceholder: "Search Username" },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            icon="edit"
            iconOnly
            onClick={() => openEdit(row._raw)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="delete"
            iconOnly
            onClick={() => handleDelete(row.id)}
          >
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
          {/* <h1 className={layout.pageTitle}>System Users</h1> */}
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>System Users</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button variant="secondary" icon="refresh" iconOnly onClick={() => dispatch(fetchUsers())} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Create User
                </Button>
              </div>
            </div>

            {error ? <div className={styles.error}>{String(error)}</div> : null}

            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No users found"}
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
          window.location.href = "/login";
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={modalOpen}
        title={editingId ? "Update User" : "Create User"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="user-modal-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <form id="user-modal-form" className={styles.form} onSubmit={submitForm}>
          <div className={styles.formRow}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingId}
              placeholder={editingId ? "Leave blank to keep unchanged" : ""}
              autoComplete="new-password"
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete User"
        message="Delete this user? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

