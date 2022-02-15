import "./ContextMenu.css";

const offset = 15;
function ContextMenu({
  left,
  top,
  show,
  toggleInfect,
  deleteNode,
  createConnection,
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
    >
      <ul>
        <li onClick={toggleInfect}>
          <p>Toggle Infection</p>
        </li>
        <li>
          <p>Delete Node</p>
        </li>
        <li>
          <p>Create Connection</p>
        </li>
      </ul>
    </div>
  );
}

export default ContextMenu;
