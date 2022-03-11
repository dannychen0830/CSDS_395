import { Card, List, ListItem, ListItemButton } from "@mui/material";
const offset = 15;
function ContextMenu({
  left,
  top,
  show,
  toggleInfect,
  deleteNode,
  createConnection,
  closeContextMenu,
}) {
  return (
    <Card
      id="contextMenu"
      className="context-menu"
      style={{
        position: "absolute",
        display: show ? "block" : "none",
        left: left + offset,
        top: top + offset,
        zIndex: 4,
      }}
      onClick={(event) => {
        event.stopPropagation();
        closeContextMenu();
      }}
    >
      <List>
        <ListItem style={{ padding: 0 }}>
          <ListItemButton onClick={toggleInfect}>
            Toggle Infection
          </ListItemButton>
        </ListItem>
        <ListItem style={{ padding: 0 }}>
          <ListItemButton onClick={deleteNode}>Delete Node</ListItemButton>
        </ListItem>
        <ListItem style={{ padding: 0 }}>
          <ListItemButton onClick={createConnection}>
            Create Connection
          </ListItemButton>
        </ListItem>
      </List>
    </Card>
  );
  // return (
  //   <div
  //     id="contextMenu"
  //     className="context-menu"
  //     style={{
  //       display: show ? "block" : "none",
  //       left: left + offset,
  //       top: top + offset,
  //     }}
  //     onClick={(event) => {
  //       event.stopPropagation();
  //       closeContextMenu();
  //     }}
  //   >
  //     <ul>
  //       <li onClick={toggleInfect}>
  //         <p>Toggle Infection</p>
  //       </li>
  //       <li onClick={deleteNode}>
  //         <p>Delete Node</p>
  //       </li>
  //       <li onClick={createConnection}>
  //         <p>Create Connection</p>
  //       </li>
  //     </ul>
  //   </div>
  // );
}

export default ContextMenu;
