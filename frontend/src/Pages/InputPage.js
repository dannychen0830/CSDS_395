import { Grid, Item, Paper } from "@mui/material";
import { blue } from "@mui/material/colors";
import InteractiveInput from "../Components/Interactive/InteractiveInput";
import ResultDisplay from "../Components/Result/ResultDisplay";
import TextInput from "../Components/TextInput/TextInput";

const InputPage = (props) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
      }}
    >
      <div style={{ width: "55vw", height: "100vh" }}>
        <InteractiveInput></InteractiveInput>
      </div>
      <div style={{ width: "45vw", height: "100vh" }}>
        <TextInput></TextInput>
      </div>
    </div>
  );
};

const outerStyle = {};

export default InputPage;
