import logo from "./logo.svg";
import "./App.css";
import Demo from "./Pages/Demo";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Playground from "./Pages/Playground";
import ResultPage from "./Pages/ResultPage";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/pg" element={<Playground></Playground>} />
          <Route path="/result/:index" element={<ResultPage />}></Route>
          <Route path="/" element={<Demo />}>
            <Route path="demo" element={<Demo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
