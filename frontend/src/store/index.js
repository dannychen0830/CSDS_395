import { configureStore } from "@reduxjs/toolkit";
import networkReducer from "./reducers/network";
import apiCallReducer from "./reducers/apiCall";

export default configureStore({
  reducer: {
    network: networkReducer,
    apiCall: apiCallReducer,
  },
});
