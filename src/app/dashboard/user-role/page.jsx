'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import {
  createAdminRole,
  fetchAdminRoles,
  selectAdminRoles,
  selectAdminRolesError,
  selectAdminRolesLoading,
  updateAdminRole,
} from "../../../store/slices/adminRoleSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import layout from "../../../styles/workspace.module.css";
import styles from "./page.module.css";

function pickValue(role, keys) {
  for (const key of keys) {
    const value = role?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return "";
}

export default function UserRolePage() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectAdminRoles);
  const loading = useAppSelector(selectAdminRolesLoading);
  const error = useAppSelector(selectAdminRolesError);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");

  const rows = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  useEffect(() => {
    dispatch(fetchAdminRoles());
  }, [dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setFormOpen(true);
  };

  const openEdit = (role) => {
    const id = pickValue(role, ["id", "role_id", "roleId"]);
    setEditingId(id);
    setName(pickValue(role, ["name", "role_name", "roleName"]) || "");
    setFormOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const payload = { name };
    if (editingId) {
      await dispatch(updateAdminRole({ id: editingId, payload }));
    } else {
      await dispatch(createAdminRole(payload));
    }
    setFormOpen(false);
    setEditingId(null);
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
          <h1 className={layout.pageTitle}>User Roles</h1>
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>User Roles</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => dispatch(fetchAdminRoles())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className={styles.cta} type="button" onClick={openCreate}>
                  Create User Role
                </button>
              </div>
            </div>

            {error ? <div className={styles.error}>{String(error)}</div> : null}

            {formOpen ? (
              <form className={styles.form} onSubmit={submitForm}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>
                    Role name
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
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

            <div className={styles.searchBar}>
              <input type="text" placeholder="Search (UI only)" disabled />
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div>No.</div>
                <div>User Name</div>
                <div>Action</div>
              </div>
              <div className={styles.body}>
                {rows.map((role, index) => {
                  const id = pickValue(role, ["id", "role_id", "roleId"]) || index + 1;
                  const displayName =
                    pickValue(role, ["name", "role_name", "roleName"]) || "-";
                  return (
                    <div key={String(id)} className={styles.dataRow}>
                      <div>{id}</div>
                      <div>{displayName}</div>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} type="button" onClick={() => openEdit(role)}>
                          Edit
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

