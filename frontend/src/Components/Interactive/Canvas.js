import Node from "./Node";
import Connection from "./Connection";
import { Button, ButtonGroup, Card, Paper } from "@mui/material";
import { useState, useCallback, useReducer, useRef } from "react";
import ContextMenu from "./ContextMenu";
import { useSelector, useDispatch } from "react-redux";
import {
  addNode as addNodeRedux,
  addConnection as addConnectionRedux,
  toggleInfect as toggleInfectRedux,
  deleteNode as deleteNodeRedux,
  setNodesNetwork as setNodesNetworkRedux,
} from "../../store/reducers/network";
import { setResult as setResultRedux } from "../../store/reducers/apiCall";
import { useNavigate } from "react-router-dom";
import axios from "axios"

const convertNodesToInputFormat = (nodes) => {
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

async function fetchSimulationCall({ nodes, connections, infected }) {
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
async function apiCall({nodes, connections, infected}) {

  let body = {"nodes": nodes, "connections": connections, "infected": infected};
  let promise = axios({
    method: 'post',
    url: 'http://localhost:5000/',
    data: body
  }).then((response) => response.data);

  return promise;
}


const createNode = (nextName, width, height) => {
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

const toggleInfectNode = (nodes, index) => {
  nodes = nodes.map((node, id) => {
    if (index === id) {
      return { ...node, infected: !node.infected };
    } else return node;
  });
  return nodes;
};

const deleteNode = (nodes, deleteIndex) => {
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

const moveNode = (nodes, index, event, canvas) => {
  const { left, top } = getRelativePosition(event, canvas);
  nodes[index] = { ...nodes[index], left: left, top: top };
  return nodes;
};

const createConnection = (nodes, indexA, indexB) => {
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

const getRelativePosition = (event, canvas) => {
  const left = event.pageX - canvas.offsetLeft;
  const top = event.pageY - canvas.offsetTop;
  return { left: left, top: top };
};

const getNextName = (nodes) => {
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

const nodeReducer = (state, action) => {
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
    default:
      newState = state;
  }
  console.log(newState);
  return newState;
};

function Canvas() {
  const canvas = useRef(null);
  const dispatchRedux = useDispatch();
  const nodesNetwork = useSelector(
    (stateRedux) => stateRedux.network.nodesNetwork
  );
  const initialState = {
    nodes: [...nodesNetwork],
    focusedIndex: null,
    contextMenuIndex: null,
    creatingConnectionIndex: null,
    mouseCursorLocation: null,
    nextName: 0,
  };
  const [state, dispatch] = useReducer(nodeReducer, initialState);
  const navigate = useNavigate();
  return (
    <>
      <ButtonGroup>
        <Button
          onClick={(event) => {
            console.log("clicked");
            dispatch({
              type: "addNode",
              width: canvas.current.clientWidth,
              height: canvas.current.clientHeight,
            });
          }}
        >
          Add node
        </Button>
        <Button
          onClick={async function ano() {
            let inputFormated = convertNodesToInputFormat(state.nodes);
            let result = await apiCall(inputFormated);
            dispatchRedux(setNodesNetworkRedux(state.nodes));
            dispatchRedux(setResultRedux(result));
            navigate("/result/0");
          }}
        >
          Simulate
        </Button>
      </ButtonGroup>

      <Card
        ref={canvas}
        style={{
          marginLeft: "20px",
          background: "#b2f7e9",
          height: "90%",
          width: "95%",
          position: "relative",
        }}
        onClick={(event) => {
          dispatch({ type: "closeContextMenu" });
          dispatch({ type: "cancelConnectionDrag" });
        }}
        onMouseUp={(event) => {
          if (event.button == 0) dispatch({ type: "unfocusNode" });
        }}
        onMouseMove={(event) => {
          if (state.focusedIndex != null && event != undefined) {
            dispatch({
              type: "moveNode",
              index: state.focusedIndex,
              event: event,
              canvas: canvas.current,
            });
          }
          if (state.creatingConnectionIndex !== null && event != undefined) {
            dispatch({
              type: "dragConnection",
              event: event,
              canvas: canvas.current,
            });
          }
        }}
      >
        <ContextMenu
          left={
            state.contextMenuIndex !== null
              ? state.nodes[state.contextMenuIndex].left
              : 0
          }
          top={
            state.contextMenuIndex !== null
              ? state.nodes[state.contextMenuIndex].top
              : 0
          }
          show={state.contextMenuIndex !== null}
          toggleInfect={() =>
            dispatch({ type: "toggleInfect", index: state.contextMenuIndex })
          }
          createConnection={() =>
            dispatch({
              type: "createConnectionDrag",
              index: state.contextMenuIndex,
            })
          }
          deleteNode={() => {
            dispatch({
              type: "deleteNode",
              index: state.contextMenuIndex,
            });
          }}
          closeContextMenu={() => {
            dispatch({ type: "closeContextMenu" });
          }}
        ></ContextMenu>
        {state.nodes.map((node, index) => {
          return (
            <Node
              key={node.name}
              {...node}
              focusNode={() => {
                dispatch({ type: "focusNode", index: index });
              }}
              openContextMenu={() =>
                dispatch({ type: "openContextMenu", index: index })
              }
              createConnection={(event) => {
                if (
                  state.creatingConnectionIndex !== null &&
                  state.creatingConnectionIndex !== index
                ) {
                  event.stopPropagation();
                  dispatch({ type: "createConnection", index: index });
                }
              }}
            ></Node>
          );
        })}
        {state.nodes.map((node, index) => {
          return node.connections.map((connection) => {
            return (
              <Connection
                key={connection}
                leftA={node.left}
                topA={node.top}
                leftB={state.nodes[connection].left}
                topB={state.nodes[connection].top}
              ></Connection>
            );
          });
        })}
        {state.creatingConnectionIndex !== null ? (
          <Connection
            leftA={state.nodes[state.creatingConnectionIndex].left}
            topA={state.nodes[state.creatingConnectionIndex].top}
            leftB={state.mouseCursorLocation.left}
            topB={state.mouseCursorLocation.top}
          ></Connection>
        ) : null}
      </Card>
    </>
  );
}

export default Canvas;

export { nodeReducer };
