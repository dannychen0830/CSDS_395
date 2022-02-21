import "./ContextMenu.css";

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
    <div
      id="contextMenu"
      className="context-menu"
      style={{
        display: show ? "block" : "none",
        left: left + offset,
        top: top + offset,
      }}
      onClick={(event) => {
        event.stopPropagation();
        closeContextMenu();
      }}
    >
      <ul>
        <li onClick={toggleInfect}>
          <p>Toggle Infection</p>
        </li>
        <li onClick={deleteNode}>
          <p>Delete Node</p>
        </li>
        <li onClick={createConnection}>
          <p>Create Connection</p>
        </li>
      </ul>
    </div>
  );
}

export default ContextMenu;
