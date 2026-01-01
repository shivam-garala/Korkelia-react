import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/userSlice";
import adminRolesReducer from "./slices/adminRoleSlice";
import metalRatesReducer from "./slices/metalRateSlice";
import metalMasterReducer from "./slices/metalMasterSlice";
import karatMasterReducer from "./slices/karatMasterSlice";
import diamondMasterReducer from "./slices/diamondMasterSlice";
import diamondTypeReducer from "./slices/diamondTypeSlice";
import diamondClarityReducer from "./slices/diamondClaritySlice";
import diamondRateReducer from "./slices/diamondRateSlice";
import cutMasterReducer from "./slices/cutMasterSlice";
import categoryMasterReducer from "./slices/categoryMasterSlice";
import subCategoryReducer from "./slices/subCategorySlice";
import styleMasterReducer from "./slices/styleMasterSlice";
import designReducer from "./slices/designSlice";
import designVariantReducer from "./slices/designVariantSlice";
import productReducer from "./slices/productSlice";
import goldColorReducer from "./slices/goldColorSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    users: usersReducer,
    adminRoles: adminRolesReducer,
    metalRates: metalRatesReducer,
    metalMaster: metalMasterReducer,
    karatMaster: karatMasterReducer,
    diamondMaster: diamondMasterReducer,
    diamondType: diamondTypeReducer,
    diamondClarity: diamondClarityReducer,
    diamondRate: diamondRateReducer,
    cutMaster: cutMasterReducer,
    categoryMaster: categoryMasterReducer,
    subCategory: subCategoryReducer,
    styleMaster: styleMasterReducer,
    designs: designReducer,
    designVariant: designVariantReducer,
    product: productReducer,
    goldColor: goldColorReducer,
    ui: uiReducer,
  },
});
