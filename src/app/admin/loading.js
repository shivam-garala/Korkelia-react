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
          <Skeleton height={30} width={180} />
          <div style={{ marginTop: "12px" }}>
            <Skeleton height={16} width="60%" />
          </div>
          <div style={{ marginTop: "18px" }}>
            <Skeleton height={180} />
          </div>
        </main>
      </div>
    </div>
  );
}
