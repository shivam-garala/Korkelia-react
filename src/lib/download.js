export const downloadUrl = (url, options = {}) => {
  if (typeof window === "undefined") return false;
  const href = typeof url === "string" ? url.trim() : "";
  if (!href) return false;

  const { filename, target } = options || {};
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener";
  if (target) {
    link.target = target;
  }
  if (filename) {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
};
