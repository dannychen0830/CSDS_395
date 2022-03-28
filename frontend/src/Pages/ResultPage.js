import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import ResultCanvas from "../Components/Result/ResultCanvas";

const ResultPage = (props) => {
  let { index } = useParams();
  const nodesNetworkRedux = useSelector((state) => state.network.nodesNetwork);
  const resultRedux = useSelector((state) => state.apiCall.result);
  const navigate = useNavigate();
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Button
        onClick={() => {
          navigate(-1);
        }}
      >
        Go back
      </Button>
      <ResultCanvas
        result={{
          ...resultRedux[index],
          sequence: resultRedux[index].sequence
            .split(",")
            .map((node) => parseInt(node)),
        }}
      ></ResultCanvas>
    </div>
  );
};

export default ResultPage;
