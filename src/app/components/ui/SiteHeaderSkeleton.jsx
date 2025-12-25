import Skeleton from "./Skeleton.jsx";

export default function SiteHeaderSkeleton() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-line)",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          padding: "14px 16px 10px",
          display: "grid",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <Skeleton width={90} height={26} />
            <Skeleton width={70} height={26} />
          </div>
          <div style={{ display: "flex", gap: "14px" }}>
            <Skeleton width={70} height={18} />
            <Skeleton width={120} height={18} />
            <Skeleton width={150} height={18} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Skeleton width={24} height={18} />
          <Skeleton width={180} height={44} />
          <Skeleton width={24} height={18} />
        </div>
      </div>
    </div>
  );
}
