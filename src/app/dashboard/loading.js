import Skeleton from "../components/ui/Skeleton.jsx";
import layout from "../../styles/workspace.module.css";

export default function Loading() {
  return (
    <div className={layout.page}>
      <div
        style={{
          width: 240,
          borderRight: "1px solid var(--color-line)",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <Skeleton height={28} width="70%" />
        <Skeleton height={20} width="55%" />
        <Skeleton height={20} width="60%" />
        <Skeleton height={20} width="50%" />
        <Skeleton height={20} width="65%" />
        <Skeleton height={20} width="45%" />
      </div>
      <div className={layout.main}>
        <div className={layout.headerBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Skeleton width={40} height={40} />
            <Skeleton width={140} height={28} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Skeleton width={36} height={36} />
            <Skeleton width={36} height={36} />
            <Skeleton width={40} height={40} />
          </div>
        </div>
        <main className={layout.content}>
          <Skeleton height={28} width={220} />
          <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
            <Skeleton height={44} />
            <Skeleton height={44} />
            <Skeleton height={44} />
            <Skeleton height={44} />
            <Skeleton height={44} />
          </div>
        </main>
      </div>
    </div>
  );
}
