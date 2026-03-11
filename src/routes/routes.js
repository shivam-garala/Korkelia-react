// Referenced from the kohira-pos-react route map: keep a small Next.js-friendly manifest.
export const publicRoutes = [
  { id: "LR1", name: "login", path: "/login", access: "public" },
  { id: "PR1", name: "product", path: "/product", access: "public" },
];

export const protectedRoutes = [
  { id: "AR1", name: "admin", path: "/admin", access: "protected" },
  { id: "DR1", name: "dashboard", path: "/dashboard", access: "protected" },
  { id: "DR2", name: "dashboard-orders", path: "/dashboard/orders", access: "protected" },
  { id: "DR3", name: "dashboard-appointment", path: "/dashboard/appointment", access: "protected" },
  { id: "DR4", name: "metal-rate", path: "/dashboard/gold-rate", access: "protected" },
  { id: "DR5", name: "karat-master", path: "/dashboard/karat-master", access: "protected" },
  { id: "DR6", name: "metal-master", path: "/dashboard/metal-master", access: "protected" },
  { id: "DR7", name: "diamond-type", path: "/dashboard/diamond-type", access: "protected" },
  { id: "DR8", name: "diamond-clarity", path: "/dashboard/diamond-clarity", access: "protected" },
  { id: "DR9", name: "dashboard-user", path: "/dashboard/user", access: "protected" },
  { id: "DR10", name: "dashboard-user-role", path: "/dashboard/user-role", access: "protected" },
  { id: "DR11", name: "dashboard-product", path: "/dashboard/product", access: "protected" },
  { id: "DR12", name: "diamond-master", path: "/dashboard/diamond-master", access: "protected" },
  { id: "DR13", name: "cut-master", path: "/dashboard/cut-master", access: "protected" },
  { id: "DR14", name: "category-master", path: "/dashboard/category-master", access: "protected" },
  { id: "DR15", name: "sub-category-master", path: "/dashboard/sub-category-master", access: "protected" },
  { id: "DR16", name: "style-master", path: "/dashboard/style-master", access: "protected" },
  { id: "DR17", name: "design", path: "/dashboard/design", access: "protected" },
  { id: "DR18", name: "diamond-rate", path: "/dashboard/diamond-rate", access: "protected" },
  { id: "DR19", name: "design-variant", path: "/dashboard/design-variant", access: "protected" },
  { id: "DR20", name: "gold-color", path: "/dashboard/gold-color", access: "protected" },
  { id: "DR21", name: "currency-rate", path: "/dashboard/currency-rate", access: "protected" },
];

export const allRoutes = [...publicRoutes, ...protectedRoutes];

export const isProtectedPath = (pathname) =>
  protectedRoutes.some((route) => pathname.startsWith(route.path));

export const isPublicPath = (pathname) =>
  publicRoutes.some((route) => pathname.startsWith(route.path));
