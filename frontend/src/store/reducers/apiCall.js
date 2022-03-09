import { createSlice } from "@reduxjs/toolkit";

export const apiCallSlice = createSlice({
  name: "apiCall",
  initialState: {
    result: null,
  },
  reducers: {
    setResult: (state, action) => {
      return {
        ...state,
        result: action.payload,
      };
    },
  },
});

export const { setResult } = apiCallSlice.actions;

export default apiCallSlice.reducer;
