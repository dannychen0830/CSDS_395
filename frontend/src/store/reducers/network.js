import { createSlice } from "@reduxjs/toolkit";

const toggleInfectHelper = (infected, name) => {
  let index = infected.find(name);
  if (index !== undefined) {
    return infected.filter((item, item_index) => item_index !== index);
  } else {
    return [...infected, name];
  }
};

const deleteNodeHelper = (state, name) => {
  const infected = state.infected.filter((item) => item !== name);
  const connections = state.connections.filter(
    (item) => item[0] !== name && item[1] !== name
  );
  const nodes = state.nodes.filter((item) => item !== name);
  return {
    ...state,
    connections: connections,
    nodes: nodes,
    infected: infected,
  };
};

export const networkSlice = createSlice({
  name: "network",
  initialState: {
    nodes: [],
    connections: [],
    infected: [],
    nodesNetwork: [],
  },
  reducers: {
    setNodesNetwork: (state, action) => {
      return {
        ...state,
        nodesNetwork: action.payload,
      };
    },
    setNodes: (state, action) => {
      return {
        ...state,
        nodes: action.payload.nodes,
      };
    },
    setConnections: (state, action) => {
      return {
        ...state,
        connections: action.payload.connections,
      };
    },
    setInfected: (state, action) => {
      return {
        ...state,
        infected: action.payload.infected,
      };
    },
    addNode: (state, action) => {
      console.log("addnoderedux");
      console.log([...state.nodes, action.payload.name]);
      return {
        ...state,
        nodes: [...state.nodes, action.payload.name],
      };
    },
    addConnection: (state, action) => {
      return {
        ...state,
        connetions: [...state.connections, action.payload.name],
      };
    },
    toggleInfect: (state, action) => {
      return {
        ...state,
        infected: toggleInfectHelper(state.infected, action.payload.name),
      };
    },
    deleteNode: (state, action) => {
      return deleteNodeHelper(state, action.payload.name);
    },
  },
});

export const {
  setNodes,
  setConnections,
  setInfected,
  addNode,
  addConnection,
  toggleInfect,
  deleteNode,
  setNodesNetwork,
} = networkSlice.actions;

export default networkSlice.reducer;
