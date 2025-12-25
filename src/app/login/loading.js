import Skeleton from "../components/ui/Skeleton.jsx";

export default function Loading() {
  return (
    <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
      <Skeleton height={40} width={160} />
      <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <Skeleton height={14} width="50%" />
          <Skeleton height={40} />
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          <Skeleton height={14} width="50%" />
          <Skeleton height={40} />
        </div>
        <Skeleton height={42} />
      </div>
    </div>
  );
}
