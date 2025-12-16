import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/userSlice";
import adminRolesReducer from "./slices/adminRoleSlice";
import metalRatesReducer from "./slices/metalRateSlice";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    users: usersReducer,
    adminRoles: adminRolesReducer,
    metalRates: metalRatesReducer,
  },
});
