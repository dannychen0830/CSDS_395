import logo from "./logo.svg";
import "./App.css";
import Demo from "./Pages/Demo";
import { Routes, Route, BrowserRouter } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Demo />}>
            <Route path="demo" element={<Demo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
