import { configureStore } from "@reduxjs/toolkit";
import networkReducer from "./reducers/network";

export default configureStore({
  reducer: {
    network: networkReducer,
  },
});
