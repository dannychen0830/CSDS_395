import Node from "./Node";
import Connection from "./Connection";
import { Paper } from "@mui/material";
import { useState, useCallback, useReducer, useRef } from "react";
import ContextMenu from "./ContextMenu";
import { useSelector, useDispatch } from "react-redux";
import {
  addNode as addNodeRedux,
  addConnection as addConnectionRedux,
  toggleInfect as toggleInfectRedux,
  deleteNode as deleteNodeRedux,
} from "../../store/reducers/network";

const width = 800;
const height = 600;

const createNode = (nodes) => {
  let newNode = {
    name: nodes.length,
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

const nodeReducer = (state, action) => {
  let newState;
  console.log(action);
  switch (action.type) {
    case "addNode":
      const newNode = createNode(state.nodes);
      action.dispatchRedux(addNodeRedux({ name: newNode.name }));
      newState = { ...state, nodes: [...state.nodes, newNode] };
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
      newState = {
        ...state,
        nodes: deleteNode(state.nodes, action.index),
      };
      break;
    default:
      newState = state;
  }
  console.log(newState);
  return newState;
};

const initialState = {
  nodes: [],
  focusedIndex: null,
  contextMenuIndex: null,
  creatingConnectionIndex: null,
  mouseCursorLocation: null,
};

function Canvas() {
  const canvas = useRef(null);
  const dispatchRedux = useDispatch();
  const [state, dispatch] = useReducer(nodeReducer, initialState);
  // const nodes = useSelector((state) => {
  //   state.network.nodes;
  // });
  return (
    <div>
      <button
        onClick={(event) => {
          console.log("clicked");
          dispatch({ type: "addNode", dispatchRedux: dispatchRedux });
        }}
      >
        Add node
      </button>
      <button>Simulate</button>
      <Paper
        ref={canvas}
        style={{
          background: "lightblue",
          height: height + "px",
          width: width + "px",
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
      </Paper>
    </div>
  );
}

export default Canvas;
