import logo from "./logo.svg";
import "./App.css";
import Demo from "./Pages/Demo";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Playground from "./Pages/Playground";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Demo />}></Route>
          <Route path="/pg" element={<Playground></Playground>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
