import Node from "./Node";
import Connection from "./Connection";
import {
  Button,
  ButtonGroup,
  Card,
  Box,
  Typography,
  Modal,
  Input,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from "@mui/material";
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

import {
  nodeReducer,
  convertNodesToInputFormat,
  apiCall,
  parseTextParams,
} from "./CanvasController";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
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
    isNoisy: false,
    numSample: "300",
    lag: "3",
    p: "0.13",
    burnIn: "0.1",
    paramModalOpen: false,
    helpModalOpen: false,
  };
  const [state, dispatch] = useReducer(nodeReducer, initialState);
  const navigate = useNavigate();
  return (
    <>
      <Modal
        open={state.paramModalOpen}
        onClose={() => dispatch({ type: "closeModal" })}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Additional Parameters for Simulation
          </Typography>
          <FormControl variant="standard">
            <InputLabel htmlFor="component-simple">
              Number of Samples
            </InputLabel>
            <Input
              id="component-simple"
              value={state.numSample}
              onChange={(event) =>
                dispatch({
                  type: "updateNumSample",
                  numSample: event.target.value,
                })
              }
            />
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={state.isNoisy}
                onChange={() => dispatch({ type: "toggleNoise" })}
              />
            }
            label="Is Noisy"
          />
          <FormControl variant="standard">
            <InputLabel htmlFor="component-simple">Lag</InputLabel>
            <Input
              id="component-simple"
              value={state.lag}
              onChange={(event) =>
                dispatch({
                  type: "updateLag",
                  lag: event.target.value,
                })
              }
            />
          </FormControl>
          <FormControl variant="standard">
            <InputLabel htmlFor="component-simple">p Value</InputLabel>
            <Input
              id="component-simple"
              value={state.p}
              onChange={(event) =>
                dispatch({
                  type: "updateP",
                  p: event.target.value,
                })
              }
            />
          </FormControl>
          <FormControl variant="standard">
            <InputLabel htmlFor="component-simple">Burn In</InputLabel>
            <Input
              id="component-simple"
              value={state.burnIn}
              onChange={(event) =>
                dispatch({
                  type: "updateBurnIn",
                  burnIn: event.target.value,
                })
              }
            />
          </FormControl>
        </Box>
      </Modal>
      <Modal
        open={state.helpModalOpen}
        onClose={() => dispatch({ type: "closeModal" })}
        aria-labelledby="helpModal-modal-title"
        aria-describedby="helpModal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="helpModal-modal-title" variant="h5" component="h2">
            Help
          </Typography>
          <Typography variant="p">
            &nbsp;
          </Typography>
          <Typography variant="p">
            Click the 'ADD NODE' button to add a node to the canvas. Each node can be moved by clicking and dragging. <br></br>
          </Typography>
          <Typography variant="p">
            &nbsp;
          </Typography>
          <Typography variant="p">
            Right click each node for options to toggle whether or not the selected node is infected, to delete the selected node,
            or to create a connection to another node.
          </Typography>
          <Typography variant="p">
            &nbsp;
          </Typography>
          <Typography variant="p">
            When creating a connection, drag the newly created line from the first node to a second node that you want to connect to.
            To cancel a connection, click anywhere outside of a node.
          </Typography>
          <Typography variant="p">
            &nbsp;
          </Typography>
          <Typography variant="p">
            Click the 'ADDITIONAL PARAMETERS' button to modify extra attributes, such as sample size, the appearance of noise, and lag.
          </Typography>
          <Typography variant="p">
            &nbsp;
          </Typography>
          <Typography variant="p">
            When ready, click the 'SIMULATE' button to begin running the simulation on the nodes.
          </Typography>
        </Box>
      </Modal>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <ButtonGroup style={{ margin: "5px" }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => dispatch({ type: "openParamModal" })}
          >
            Additional Parameters
          </Button>
          <Button
            variant="contained"
            onClick={(event) => {
              console.log("clicked");
              dispatch({
                type: "addNode",
                width: canvas.current.clientWidth,
                height: canvas.current.clientHeight,
              });
            }}
          >
            Add Node
          </Button>
          <Button
            variant="contained"
            onClick={() => dispatch({ type: "openHelpModal" })}
          >
            Help
          </Button>
        </ButtonGroup>
        <Button
          style={{ margin: "5px" }}
          variant="contained"
          onClick={async function ano() {
            let inputFormated = convertNodesToInputFormat(state.nodes);
            const { numSample, lag, p, burnIn } = parseTextParams(
              state.numSample,
              state.lag,
              state.p,
              state.burnIn
            );
            inputFormated = {
              ...inputFormated,
              numSample: numSample,
              lag: lag,
              p: p,
              burnIn: burnIn,
            };
            let result = await apiCall(inputFormated);
            dispatchRedux(setNodesNetworkRedux(state.nodes));
            dispatchRedux(setResultRedux(result));
            navigate("/result/0");
          }}
        >
          Simulate
        </Button>
      </div>

      <Card
        ref={canvas}
        style={{
          margin: "0 10px",
          background: "#b2f7e9",
          height: "90%",
          width: "98%",
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
