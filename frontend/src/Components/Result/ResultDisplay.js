import { useSelector, useDispatch } from "react-redux";
const ResultDisplay = (props) => {
  const resultRedux = useSelector((state) => state.apiCall.result);
  return resultRedux ? (
    <div>
      <p>Highest probability sequences: {resultRedux[0].sequence}</p>
      <p>Probability: {resultRedux[0].probability * 100}%</p>
      <p>Runner ups:</p>
      {resultRedux.slice(1, 10).map((item) => {
        let text = `Sequence: ${item.sequence}, probability: ${
          item.probability * 100
        } %`;
        return <p>{text}</p>;
      })}
    </div>
  ) : (
    <div>Click simulate for resul</div>
  );
};

export default ResultDisplay;
