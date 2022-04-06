import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import ResultCanvas from "../Components/Result/ResultCanvas";
import ResultDisplay from "../Components/Result/ResultDisplay";
import { useMemo } from "react";

const ResultPage = (props) => {
  let { index } = useParams();
  const nodesNetworkRedux = useSelector((state) => state.network.nodesNetwork);
  const resultRedux = useSelector((state) => state.apiCall.result);
  const navigate = useNavigate();
  console.log(resultRedux);
  console.log(index);
  const interactiveResult = useMemo(() => {
    return {
      ...resultRedux[index],
      sequence: resultRedux[index].sequence
        .split(",")
        .map((node) => parseInt(node)),
    };
  }, [index, resultRedux]);
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
      }}
    >
      <div style={{ width: "50vw", height: "100vh" }}>
        <Button onClick={() => navigate(-1)}>Go back</Button>
        <ResultDisplay />
      </div>
      <div style={{ width: "50vw", height: "100vh" }}>
        <ResultCanvas key={index} result={interactiveResult}></ResultCanvas>
      </div>
    </div>
  );
};

export default ResultPage;
