'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import TextField from "../../../components/ui/TextField.jsx";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    await dispatch(deleteUser(id));
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
          <button className={styles.iconBtn} type="button" onClick={() => openEdit(row._raw)}>
            Edit
          </button>
          <button className={styles.iconBtn} type="button" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={layout.page}>
      <SidebarNav activePath={pathname} />
      <div className={layout.main}>
        <header className={layout.headerBar}>
          <div className={layout.team} />
          <div className={layout.actionsRow}>
            <button className={layout.chip} onClick={() => setSearchOpen(true)}>
              Search
            </button>
            <LanguageDropdown />
            <button className={layout.ghostIcon}>?</button>
            <button className={layout.ghostIcon}>...</button>
            <button
              className={layout.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={layout.avatarRingInner}>JF</span>
            </button>
          </div>
        </header>

        <main className={layout.content}>
          {/* <h1 className={layout.pageTitle}>System Users</h1> */}
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>System Users</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchUsers())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Create User
                </button>
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

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
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
            <button className={styles.cta} type="submit" form="user-modal-form" disabled={loading}>
              {editingId ? "Update" : "Create"}
            </button>
            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
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
    </div>
  );
}
