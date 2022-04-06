import logo from "./logo.svg";
import "./App.css";
import Demo from "./Pages/Demo";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Playground from "./Pages/Playground";
import ResultPage from "./Pages/ResultPage";
import InputPage from "./Pages/InputPage";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/input" element={<InputPage />} />
          <Route path="/pg" element={<Playground></Playground>} />
          <Route path="/result/:index" element={<ResultPage />} />
          <Route path="/" element={<InputPage />}>
            <Route path="demo" element={<Demo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
