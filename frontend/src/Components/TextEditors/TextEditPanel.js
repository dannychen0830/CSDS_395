import { useSelector, useDispatch } from "react-redux";
import TextEditor from "./TextEditor";

const TextEditorPanel = (props) => {
  const nodesRedux = useSelector((state) => state.network.nodes);
  console.log(nodesRedux);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TextEditor content={nodesRedux}></TextEditor>
      <TextEditor></TextEditor>
      <TextEditor></TextEditor>
    </div>
  );
};

export default TextEditorPanel;
