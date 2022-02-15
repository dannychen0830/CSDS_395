// TODO: Move this to a separate env file
const size = 40;

function Node({ top, left, focusNode, openContextMenu, name, infected }) {
  return (
    <div
      onMouseDown={(event) => {
        if (event.button == 0) focusNode();
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        openContextMenu();
      }}
      style={{
        zIndex: 3,
        background: infected ? "salmon" : "white",
        color: "black",
        width: size + "px",
        height: size + "px",
        borderRadius: "100%",
        border: "2px solid black",
        position: "absolute",
        left: left - size / 2 + "px",
        top: top - size / 2 + "px",
      }}
    >
      <p
        style={{
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}
      >
        {name}
      </p>
    </div>
  );
}

export default Node;
