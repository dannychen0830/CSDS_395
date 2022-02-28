import logo from "./logo.svg";
import "./App.css";
import InteractiveInput from "./Components/Interactive/InteractiveInput";
import TextEditorPanel from "./Components/TextEditors/TextEditPanel";
import ResultDisplay from "./Components/Result/ResultDisplay";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <div className="App" style={{ display: "flex" }}>
      <InteractiveInput></InteractiveInput>
      <ResultDisplay />
    </div>
  );
}

export default App;
