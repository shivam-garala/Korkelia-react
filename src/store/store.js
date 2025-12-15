import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/userSlice";
import adminRolesReducer from "./slices/adminRoleSlice";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    users: usersReducer,
    adminRoles: adminRolesReducer,
  },
});
