'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");

  const rows = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setStatus("Active");
    setFormOpen(true);
  };

  const openEdit = (user) => {
    const id = pickValue(user, ["id", "user_id", "userId"]);
    setEditingId(id);
    setName(pickValue(user, ["name", "user_name", "username", "userName"]));
    setRole(pickValue(user, ["role", "role_name", "roleName"]));
    setStatus(pickValue(user, ["status", "is_active"]) || "Active");
    setFormOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const payload = { name, role, status };

    if (editingId) {
      await dispatch(updateUser({ id: editingId, payload }));
    } else {
      await dispatch(createUser(payload));
    }
    setFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    await dispatch(deleteUser(id));
  };

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
          <h1 className={layout.pageTitle}>System Users</h1>
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

            {formOpen ? (
              <form className={styles.form} onSubmit={submitForm}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>
                    Name
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                  <label className={styles.formLabel}>
                    Role
                    <input value={role} onChange={(e) => setRole(e.target.value)} />
                  </label>
                  <label className={styles.formLabel}>
                    Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cta} type="submit" disabled={loading}>
                    {editingId ? "Update" : "Create"}
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div>No.</div>
                <div>User Name</div>
                <div>Role</div>
                <div>Status</div>
                <div>Action</div>
              </div>

              <div className={styles.filterRow}>
                <input type="text" placeholder="Search No." />
                <input type="text" placeholder="Search User Name" />
                <input type="text" placeholder="Search Role" />
                <input type="text" placeholder="Search Status" />
                <div />
              </div>

              <div className={styles.body}>
                {rows.map((user, index) => {
                  const id = pickValue(user, ["id", "user_id", "userId"]) || index + 1;
                  const displayName =
                    pickValue(user, ["name", "user_name", "username", "userName"]) || "-";
                  const displayRole = pickValue(user, ["role", "role_name", "roleName"]) || "-";
                  const displayStatus = pickValue(user, ["status", "is_active"]) || "-";
                  const isActive =
                    String(displayStatus).toLowerCase() === "active" ||
                    displayStatus === 1 ||
                    displayStatus === true;

                  return (
                    <div key={String(id)} className={styles.dataRow}>
                      <div>{id}</div>
                      <div>{displayName}</div>
                      <div>{displayRole}</div>
                      <div>
                        <span
                          className={`${styles.status} ${
                            isActive ? styles.statusActive : styles.statusInactive
                          }`}
                        >
                          {String(displayStatus)}
                        </span>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} type="button" onClick={() => openEdit(user)}>
                          Edit
                        </button>
                        <button className={styles.iconBtn} type="button" onClick={() => handleDelete(id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
