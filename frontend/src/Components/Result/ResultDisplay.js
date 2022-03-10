import { useSelector, useDispatch } from "react-redux";
import "./resultStylesheet.css";

const ResultDisplay = (props) => {
  const resultRedux = useSelector((state) => state.apiCall.result);
  return resultRedux ? (
    <div>
      <button type="button" disabled>Highest probability sequences: {resultRedux[0].sequence}</button>
      <p class = "resultBox">Probability: {resultRedux[0].probability * 100}%</p>
      <p class = "resultBox">Runner ups:</p>
      {resultRedux.slice(1, 10).map((item) => {
        let text = `Sequence: ${item.sequence}, probability: ${
          item.probability * 100
        } %`;
        return <p class = "resultBox">{text}</p>;
      })}
    </div>
  ) : (
    <button type="button" disabled>Results will be posted here after nodes are added and Simulate is clicked</button>
  );
};

export default ResultDisplay;
