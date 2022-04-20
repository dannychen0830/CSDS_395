import axios from "axios";

export const convertNodesToInputFormat = (nodes) => {
  let nodesOnly = [];
  let infected = [];
  let connections = [];

  nodes.forEach((node) => {
    nodesOnly.push(node.name);
    if (node.infected) {
      infected.push(node.name);
    }
    node.connections.forEach((target) => connections.push([node.name, target]));
  });
  return { nodes: nodesOnly, infected: infected, connections: connections };
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export async function fetchSimulationCall({ nodes, connections, infected }) {
  // TODO: Actually fetch the api when the api is up
  // Fake data look like [3,1,2]: 0.46, [2,1,3]: 0.3, [1,2,3]: 0.23 }
  let hmap = new Map();
  let permu = infected;
  for (let i = 0; i < 100; i++) {
    permu = shuffle(infected);

    if (hmap[permu] != undefined) {
      hmap[permu] = hmap[permu] + 1;
    } else {
      hmap[permu] = 1;
    }
  }
  let result = [];
  for (const [k, v] of Object.entries(hmap)) {
    result.push({ sequence: k, probability: v / 100 });
  }
  return result.sort((a, b) => b.probability - a.probability);
}

// API call
export async function apiCall({ nodes, connections, infected }) {
  let body = { nodes: nodes, connections: connections, infected: infected };
  let promise = axios({
    method: "post",
    url: "http://localhost:5000/",
    data: body,
  }).then((response) => response.data);

  return promise;
}

export function parseTextParams(numSample, lag, p, burnIn) {
  let parsedNumSample = parseInt(numSample);
  let parsedLag = parseFloat(lag);
  let parsedP = parseFloat(p);
  let parsedBurnIn = parseFloat(burnIn);
  return {
    numSample: parsedNumSample,
    lag: parsedLag,
    p: parsedP,
    burnIn: parsedBurnIn,
  };
}

export const createNode = (nextName, width, height) => {
  let newNode = {
    name: nextName,
    infected: false,
    connections: [],
    top: Math.floor(Math.random() * height),
    left: Math.floor(Math.random() * width),
    focused: false,
  };
  return newNode;
};

export const toggleInfectNode = (nodes, index) => {
  nodes = nodes.map((node, id) => {
    if (index === id) {
      return { ...node, infected: !node.infected };
    } else return node;
  });
  return nodes;
};

export const deleteNode = (nodes, deleteIndex) => {
  nodes = nodes.filter((node, index) => {
    return index !== deleteIndex;
  });
  return nodes.map((node, index) => {
    return {
      ...node,
      connections: node.connections.filter((c, cIndex) => c !== deleteIndex),
    };
  });
};

export const moveNode = (nodes, index, event, canvas) => {
  const { left, top } = getRelativePosition(event, canvas);
  nodes[index] = { ...nodes[index], left: left, top: top };
  return nodes;
};

export const createConnection = (nodes, indexA, indexB) => {
  if (
    nodes[indexA].connections.find((item) => item === indexB) !== undefined ||
    nodes[indexB].connections.find((item) => item === indexA) !== undefined
  ) {
    return nodes;
  }
  return nodes.map((node, index) => {
    if (index === indexA) {
      return { ...node, connections: [...node.connections, indexB] };
    } else {
      return node;
    }
  });
};

export const getRelativePosition = (event, canvas) => {
  const left = event.pageX - canvas.offsetLeft;
  const top = event.pageY - canvas.offsetTop;
  return { left: left, top: top };
};

export const getNextName = (nodes) => {
  let name = 0;
  while (name < nodes.length) {
    let flag = false;
    nodes.forEach((node) => {
      if (name == node.name) {
        flag = true;
      }
    });
    if (flag) {
      name += 1;
    } else {
      break;
    }
  }
  return name;
};

export const nodeReducer = (state, action) => {
  let newState;
  console.log(action);
  switch (action.type) {
    case "addNode":
      const newNode = createNode(state.nextName, action.width, action.height);
      let nextNodes = [...state.nodes, newNode];
      newState = {
        ...state,
        nodes: nextNodes,
        nextName: getNextName(nextNodes),
      };
      break;
    case "focusNode":
      newState = { ...state, focusedIndex: action.index };
      break;
    case "unfocusNode":
      newState = {
        ...state,
        focusedIndex: null,
      };
      break;
    case "moveNode":
      newState = {
        ...state,
        nodes: moveNode(state.nodes, action.index, action.event, action.canvas),
      };
      break;
    case "openContextMenu":
      newState = {
        ...state,
        contextMenuIndex: action.index,
      };
      break;
    case "closeContextMenu":
      newState = {
        ...state,
        contextMenuIndex: null,
      };
      break;
    case "toggleInfect":
      newState = {
        ...state,
        nodes: toggleInfectNode(state.nodes, action.index),
      };
      break;
    case "createConnectionDrag":
      newState = {
        ...state,
        creatingConnectionIndex: action.index,
        mouseCursorLocation: {
          left: state.nodes[action.index].left,
          top: state.nodes[action.index].top,
        },
      };
      break;
    case "dragConnection":
      newState = {
        ...state,
        mouseCursorLocation: getRelativePosition(action.event, action.canvas),
      };
      break;
    case "createConnection":
      if (state.creatingConnectionIndex !== null) {
        newState = {
          ...state,
          nodes: createConnection(
            state.nodes,
            state.creatingConnectionIndex,
            action.index
          ),
        };
      }
      break;
    case "cancelConnectionDrag":
      newState = {
        ...state,
        creatingConnectionIndex: null,
        mouseCursorLocation: null,
      };
      break;
    case "deleteNode":
      let newNodes = deleteNode(state.nodes, action.index);
      newState = {
        ...state,
        nodes: newNodes,
        nextName: getNextName(newNodes),
      };
      break;
    case "toggleNoise":
      newState = {
        ...state,
        isNoisy: !state.isNoisy,
      };
      break;
    case "updateNumSample":
      newState = {
        ...state,
        numSample: action.numSample,
      };
      break;
    case "updateLag":
      newState = {
        ...state,
        lag: action.lag,
      };
      break;
    case "updateP":
      newState = {
        ...state,
        p: action.p,
      };
      break;
    case "updateBurnIn":
      newState = {
        ...state,
        burnIn: action.burnIn,
      };
      break;
    case "openModal":
      newState = {
        ...state,
        modalOpen: true,
      };
      break;
    case "closeModal":
      newState = {
        ...state,
        modalOpen: false,
      };
      break;
    default:
      newState = state;
  }
  console.log(newState);
  return newState;
};
