import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/userSlice";
import adminRolesReducer from "./slices/adminRoleSlice";
import metalRatesReducer from "./slices/metalRateSlice";
import diamondMasterReducer from "./slices/diamondMasterSlice";
import cutMasterReducer from "./slices/cutMasterSlice";
import categoryMasterReducer from "./slices/categoryMasterSlice";
import styleMasterReducer from "./slices/styleMasterSlice";
import designReducer from "./slices/designSlice";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    users: usersReducer,
    adminRoles: adminRolesReducer,
    metalRates: metalRatesReducer,
    diamondMaster: diamondMasterReducer,
    cutMaster: cutMasterReducer,
    categoryMaster: categoryMasterReducer,
    styleMaster: styleMasterReducer,
    designs: designReducer,
  },
});
