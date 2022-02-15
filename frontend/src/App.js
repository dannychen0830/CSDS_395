import logo from "./logo.svg";
import "./App.css";
import InteractiveInput from "./Components/Interactive/InteractiveInput";
import ContextMenu from "./Components/Interactive/ContextMenu";

function App() {
  return (
    <div className="App">
      <InteractiveInput></InteractiveInput>
      <ContextMenu></ContextMenu>
    </div>
  );
}

export default App;
