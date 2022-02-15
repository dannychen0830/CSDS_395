import Node from "./Node";
import Connection from "./Connection";

import { useState, useCallback, useReducer, useRef } from "react";
import ContextMenu from "./ContextMenu";

const width = 1000;
const height = 600;
const createRandomConnection = (nodes) => {
  if (nodes.length === 0) {
    return [];
  }
  return [Math.floor(Math.random() * nodes.length)];
};

const createNode = (nodes) => {
  let newNode = {
    name: nodes.length,
    infected: false,
    connections: createRandomConnection(nodes),
    top: Math.floor(Math.random() * height),
    left: Math.floor(Math.random() * width),
    focused: false,
  };
  console.log(newNode);
  return newNode;
};

const toggleInfectNode = (nodes, index) => {
  nodes = nodes.map((node, id) => {
    if (index === id) {
      return { ...node, infected: !node.infected };
    } else return node;
  });
  console.log(nodes[index]);
  console.log(nodes);
  // nodes[index] = { ...nodes[index], infected: !nodes[index].infected };
  return nodes;
};

const moveNode = (nodes, index, event, canvas) => {
  const left = event.pageX - canvas.offsetLeft;
  const top = event.pageY - canvas.offsetTop;
  nodes[index] = { ...nodes[index], left: left, top: top };
  console.log(nodes[index]);
  console.log(nodes);
  return nodes;
};

const nodeReducer = (state, action) => {
  let newState;
  console.log(action);
  switch (action.type) {
    case "addNode":
      newState = { ...state, nodes: [...state.nodes, createNode(state.nodes)] };
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
};

function Canvas() {
  const canvas = useRef(null);
  const [state, dispatch] = useReducer(nodeReducer, initialState);

  return (
    <div>
      <button
        onClick={(event) => {
          dispatch({ type: "addNode" });
        }}
      >
        Add node
      </button>
      <div
        ref={canvas}
        style={{
          background: "lightblue",
          height: height + "px",
          width: width + "px",
          position: "relative",
        }}
        onClick={(event) => {
          dispatch({ type: "closeContextMenu" });
        }}
        onMouseUp={(event) => {
          if (event.button == 0) dispatch({ type: "unfocusNode" });
        }}
        onMouseMove={(event) => {
          if (
            state.focusedIndex != null &&
            event != undefined &&
            event.button == 0
          ) {
            dispatch({
              type: "moveNode",
              index: state.focusedIndex,
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
      </div>
    </div>
  );
}

export default Canvas;
