export default function Skeleton({ width = "100%", height = "1rem", className = "" }) {
  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width: resolvedWidth, height: resolvedHeight }}
      aria-hidden="true"
    />
  );
}
