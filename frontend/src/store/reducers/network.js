import { createSlice } from "@reduxjs/toolkit";

export const networkSlice = createSlice({
  name: "network",
  initialState: {
    nodes: [],
    connections: [],
    infected: [],
  },
  reducers: {
    setNodes: (state, action) => {
      return {
        ...state,
        nodes: action.nodes,
      };
    },
    setConnections: (state, action) => {
      return {
        ...state,
        connections: action.connections,
      };
    },
    setInfected: (state, action) => {
      return {
        ...state,
        infected: action.infected,
      };
    },
    addNode: (state, action) => {
      return {
        ...state,
        nodes: [...state.nodes, action.name],
      };
    },
  },
});

export const { setNodes, setConnections, setInfected, addNode } =
  networkSlice.actions;

export default networkSlice.reducer;
