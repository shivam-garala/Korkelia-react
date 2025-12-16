// Referenced from the kohira-pos-react route map: keep a small Next.js-friendly manifest.
export const publicRoutes = [
  { id: "LR1", name: "login", path: "/login", access: "public" },
  { id: "PR1", name: "product", path: "/product", access: "public" },
];

export const protectedRoutes = [
  { id: "DR1", name: "dashboard", path: "/dashboard", access: "protected" },
  { id: "DR2", name: "dashboard-orders", path: "/dashboard/orders", access: "protected" },
  { id: "DR3", name: "admin", path: "/admin", access: "protected" },
  { id: "DR4", name: "metal-rate", path: "/dashboard/gold-rate", access: "protected" },
  { id: "DR5", name: "dashboard-user", path: "/dashboard/user", access: "protected" },
  { id: "DR6", name: "dashboard-user-role", path: "/dashboard/user-role", access: "protected" },
  { id: "DR7", name: "dashboard-product", path: "/dashboard/product", access: "protected" },
  { id: "DR8", name: "diamond-master", path: "/dashboard/diamond-master", access: "protected" },
  { id: "DR9", name: "cut-master", path: "/dashboard/cut-master", access: "protected" },
  { id: "DR10", name: "category-master", path: "/dashboard/category-master", access: "protected" },
  { id: "DR11", name: "style-master", path: "/dashboard/style-master", access: "protected" },
];

export const allRoutes = [...publicRoutes, ...protectedRoutes];

export const isProtectedPath = (pathname) =>
  protectedRoutes.some((route) => pathname.startsWith(route.path));

export const isPublicPath = (pathname) =>
  publicRoutes.some((route) => pathname.startsWith(route.path));
