import { useSelector, useDispatch } from "react-redux";
import { useState, useCallback, useReducer, useRef } from "react";
import Node from "../Interactive/Node";
import Connection from "../Interactive/Connection";
import { Button, ButtonGroup, Card, Paper } from "@mui/material";
const ResultCanvas = ({ result }) => {
  const canvas = useRef(null);
  const nodesNetwork = useSelector(
    (stateRedux) => stateRedux.network.nodesNetwork
  );

  const createNode = (nodes, width, height) => {
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

  const increaseTime = (state) => {
    return {
      ...state,
      nodes: state.nodes.map((node, index) =>
        node.name == state.sequence[state.currentIndex + 1]
          ? { ...node, infected: true }
          : node
      ),
      currentIndex: state.currentIndex + 1,
    };
  };

  const decreaseTime = (state) => {
    return {
      ...state,
      nodes: state.nodes.map((node, index) =>
        node.name == state.sequence[state.currentIndex]
          ? { ...node, infected: false }
          : node
      ),
      currentIndex: state.currentIndex - 1,
    };
  };

  const initialState = {
    nodes: nodesNetwork.map((node, id) => {
      return { ...node, infected: id == result.sequence[0] ? true : false };
    }),
    focusedIndex: null,
    contextMenuIndex: null,
    creatingConnectionIndex: null,
    mouseCursorLocation: null,
    sequence: result.sequence,
    currentIndex: 0, //TODO: Refactor for continuous
    isPlaying: false,
  };
  const nodeReducer = (state, action) => {
    let newState;
    console.log(action);
    switch (action.type) {
      case "addNode":
        const newNode = createNode(state.nodes, action.width, action.height);
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
          nodes: moveNode(
            state.nodes,
            action.index,
            action.event,
            action.canvas
          ),
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
      case "increaseTime":
        newState = increaseTime(state);
        break;
      case "decreaseTime":
        newState = decreaseTime(state);
        break;
      case "playOn":
        newState = {
          ...state,
          isPlaying: true,
        };
        break;
      case "playOff":
        newState = {
          ...state,
          isPlaying: false,
        };
        break;
      default:
        newState = state;
    }
    console.log(newState);
    return newState;
  };

  const [state, dispatch] = useReducer(nodeReducer, initialState);

  const recursivelyPlay = (currentIndex, maxIndex) => {
    if (currentIndex < maxIndex - 1) {
      setTimeout(() => {
        dispatch({ type: "increaseTime" });
        recursivelyPlay(currentIndex + 1, maxIndex);
      }, 500);
    } else {
      dispatch({ type: "playOff" });
    }
  };

  const playSimulation = (state) => {
    dispatch({ type: "playOn" });
    let currentIndex = state.currentIndex;
    const maxIndex = state.sequence.length;
    recursivelyPlay(currentIndex, maxIndex);
  };

  return (
    <>
      <Card
        ref={canvas}
        style={{
          marginTop: "20px",
          marginRight: "30px",
          marginLeft: "20px",
          background: "#b2f7e9",
          height: "90%",
          width: "100%",
          position: "relative",
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
        {state.nodes.map((node, index) => {
          return (
            <Node
              key={node.name}
              {...node}
              focusNode={() => {
                dispatch({ type: "focusNode", index: index });
              }}
              openContextMenu={() => {}}
              createConnection={() => {}}
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
                infected={node.infected && state.nodes[connection].infected}
              ></Connection>
            );
          });
        })}
      </Card>
      <ButtonGroup>
        <Button
          onClick={() => dispatch({ type: "decreaseTime" })}
          disabled={state.isPlaying}
        >
          {"<"}
        </Button>
        <Button
          onClick={() => {
            playSimulation(state);
          }}
        >
          Play
        </Button>
        <Button
          onClick={() => dispatch({ type: "increaseTime" })}
          disabled={state.isPlaying}
        >
          {">"}
        </Button>
      </ButtonGroup>
    </>
  );
};

export default ResultCanvas;
