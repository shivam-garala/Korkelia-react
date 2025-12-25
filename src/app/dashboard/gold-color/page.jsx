'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../../components/AdminHeader/AdminHeader.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import DataTable from "../../../components/ui/DataTableSuspense.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import AdminSelectField from "../../../components/ui/AdminSelectField.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import {
  createGoldColor,
  deleteGoldColor,
  fetchGoldColors,
  selectGoldColorError,
  selectGoldColorLoading,
  selectGoldColors,
  updateGoldColor,
} from "../../../store/slices/goldColorSlice.js";
import {
  fetchMetalMasters,
  selectMetalMasters,
} from "../../../store/slices/metalMasterSlice.js";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../../store/authSlice.js";
import layout from "../../../styles/workspace.module.css";
import styles from "../../../styles/crudPage.module.css";

function pickValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export default function GoldColorPage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectGoldColors);
  const metalMasters = useAppSelector(selectMetalMasters);
  const loading = useAppSelector(selectGoldColorLoading);
  const error = useAppSelector(selectGoldColorError);
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

  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [metalTypeId, setMetalTypeId] = useState("");
  const [filters, setFilters] = useState({
    no: "",
    color: "",
    colour_code: "",
    metal_type: "",
  });

  useEffect(() => {
    dispatch(fetchGoldColors());
    dispatch(fetchMetalMasters());
  }, [dispatch]);

  const metalOptions = useMemo(() => {
    const list = Array.isArray(metalMasters) ? metalMasters : [];
    return list
      .map((item) => {
        const id = pickValue(item, ["id", "metal_id", "metalId"]);
        const label = pickValue(item, ["metal_name", "metalName", "name", "label"]);
        if (id === null || id === undefined || label === null || label === undefined) return null;
        return { id: String(id), label: String(label) };
      })
      .filter(Boolean);
  }, [metalMasters]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    return rows.map((item, index) => {
      const id = pickValue(item, ["id", "gold_color_id", "goldColorId"]) ?? index + 1;
      const rawMetalId = pickValue(item, ["metal_type_id", "metalTypeId", "metal_id", "metalId"]);
      const metalLabel =
        item?.metal?.metal_name ??
        item?.metal?.metalName ??
        item?.metal?.name ??
        metalOptions.find((opt) => String(opt.id) === String(rawMetalId))?.label ??
        (rawMetalId !== null && rawMetalId !== undefined ? String(rawMetalId) : "-");
      return {
        no: index + 1,
        id,
        color: pickValue(item, ["color", "color_name", "colour", "colour_name"]) ?? "-",
        colour_code: pickValue(item, ["colour_code", "color_code", "code"]) ?? "-",
        metal_type: metalLabel ?? "-",
        _raw: item,
      };
    });
  }, [items, metalOptions]);

  const filteredRows = useMemo(() => {
    const normalize = (value) => String(value ?? "").trim().toLowerCase();
    const noQuery = normalize(filters.no);
    const colorQuery = normalize(filters.color);
    const codeQuery = normalize(filters.colour_code);
    const metalQuery = normalize(filters.metal_type);
    if (!noQuery && !colorQuery && !codeQuery && !metalQuery) return tableRows;

    return tableRows.filter((row) => {
      const noMatches = noQuery
        ? normalize(row.no).includes(noQuery) || normalize(row.id).includes(noQuery)
        : true;
      const colorMatches = colorQuery ? normalize(row.color).includes(colorQuery) : true;
      const codeMatches = codeQuery ? normalize(row.colour_code).includes(codeQuery) : true;
      const metalMatches = metalQuery ? normalize(row.metal_type).includes(metalQuery) : true;
      return noMatches && colorMatches && codeMatches && metalMatches;
    });
  }, [filters.color, filters.colour_code, filters.metal_type, filters.no, tableRows]);

  const openCreate = () => {
    setEditingId(null);
    setColorName("");
    setColorCode("");
    setMetalTypeId("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const rawId = pickValue(row, ["id", "gold_color_id", "goldColorId"]);
    const rawMetalId = pickValue(row, ["metal_type_id", "metalTypeId", "metal_id", "metalId"]);
    setEditingId(rawId ?? null);
    setColorName(String(pickValue(row, ["color", "color_name", "colour", "colour_name"]) ?? ""));
    setColorCode(String(pickValue(row, ["colour_code", "color_code", "code"]) ?? ""));
    setMetalTypeId(rawMetalId !== null && rawMetalId !== undefined ? String(rawMetalId) : "");
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { color: colorName, colour_code: colorCode };
    if (!editingId && metalTypeId) {
      payload.metal_type_id = Number(metalTypeId);
    }

    const action = editingId
      ? updateGoldColor({ id: editingId, payload })
      : createGoldColor(payload);

    const result = await dispatch(action);
    if (!result?.error) {
      setModalOpen(false);
      setEditingId(null);
      dispatch(fetchGoldColors());
    }
  };

  const handleDelete = (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteGoldColor(deleteTarget));
    dispatch(fetchGoldColors());
    setDeleteTarget(null);
  };

  const columns = [
    { key: "no", header: "No.", filterable: true, filterPlaceholder: "Search No." },
    { key: "color", header: "Color", filterable: true, filterPlaceholder: "Search Color" },
    { key: "colour_code", header: "Colour Code", filterable: true, filterPlaceholder: "Search Code" },
    { key: "metal_type", header: "Metal Type", filterable: true, filterPlaceholder: "Search Metal" },
    {
      key: "actions",
      header: "Action",
      filterable: false,
      render: (row) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" icon="edit" iconOnly onClick={() => openEdit(row._raw)}>
            Edit
          </Button>
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
              <h2 className={styles.title}>Gold Color</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button
                  variant="secondary"
                  icon="refresh"
                  iconOnly
                  onClick={() => dispatch(fetchGoldColors())}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primarySoft" onClick={openCreate}>
                  Add Gold Color
                </Button>
              </div>
            </div>


            <DataTable
              columns={columns}
              rows={filteredRows}
              getRowKey={(row) => row.id}
              filters={filters}
              onFiltersChange={setFilters}
              emptyMessage={loading ? "Loading..." : "No records found"}
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

      <Modal
        open={modalOpen}
        title={editingId ? "Update Gold Color" : "Add Gold Color"}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className={styles.formActions}>
            <Button variant="primarySoft" type="submit" form="gold-color-form" disabled={loading}>
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
        <form id="gold-color-form" className={styles.form} onSubmit={submit}>
          <div className={styles.formRow3}>
            <TextField
              label="Color"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              required
            />
            <TextField
              label="Colour Code"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              required
            />
            <AdminSelectField
              label="Metal Type"
              value={metalTypeId}
              onChange={(e) => setMetalTypeId(e.target.value)}
              required={!editingId}
              disabled={editingId || !metalOptions.length}
              placeholder={metalOptions.length ? "Select metal" : "Loading metals..."}
              options={metalOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
            />
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Gold Color"
        message="Delete this gold color? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
