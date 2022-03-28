import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "./resultStylesheet.css";
import {
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";

const TopCard = ({ sequence, probability }) => {
  return (
    <Card style={{ margin: "20px" }} sx={{ width: "100%" }}>
      <CardContent>
        <Typography variant="h4" component="div">
          Highest probability sequences: {sequence}
        </Typography>
        <Typography variant="h5" component="div">
          {probability * 100}%
        </Typography>
      </CardContent>
    </Card>
  );
};

const RunnerUpList = ({ results, cardClick }) => {
  return (
    <Card style={{ margin: "20px" }} sx={{ width: "100%" }}>
      <List>
        {results.map((item, index) => (
          <ListItem>
            <ListItemButton onClick={() => cardClick(index)}>
              {`Sequence: ${item.sequence}, probability: ${
                item.probability * 100
              } %`}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

const ResultDisplay = (props) => {
  const navigate = useNavigate();
  const resultRedux = useSelector((state) => state.apiCall.result);

  function cardClick(index) {
    navigate("/result/" + index);
  }

  return resultRedux ? (
    <Grid container spacing={2}>
      <TopCard
        sequence={resultRedux[0].sequence}
        probability={resultRedux[0].probability}
      ></TopCard>
      <RunnerUpList
        results={resultRedux.slice(1, 10)}
        cardClick={cardClick}
      ></RunnerUpList>
    </Grid>
  ) : (
    <Card>
      Results will be posted here after nodes are added and Simulate is clicked
    </Card>
  );
  // return resultRedux ? (
  //   <div>
  //     <button type="button" disabled>
  //       Highest probability sequences: {resultRedux[0].sequence}
  //     </button>
  //     <p class="resultBox">Probability: {resultRedux[0].probability * 100}%</p>
  //     <p class="resultBox">Runner ups:</p>
  //     {resultRedux.slice(1, 10).map((item) => {
  //       let text = `Sequence: ${item.sequence}, probability: ${
  //         item.probability * 100
  //       } %`;
  //       return <p class="resultBox">{text}</p>;
  //     })}
  //   </div>
  // ) : (
  //   <button type="button" disabled>
  //     Results will be posted here after nodes are added and Simulate is clicked
  //   </button>
  // );
};

export default ResultDisplay;
