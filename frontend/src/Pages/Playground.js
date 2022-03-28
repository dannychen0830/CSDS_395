import Connection from "../Components/Interactive/Connection";
import { Card, Button } from "@mui/material";
import { useState } from "react";
const width = 800;
const height = 650;

const Playground = (props) => {
  const [infected, setInfected] = useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setInfected(!infected);
          console.log(infected);
        }}
      >
        Transition
      </Button>
      <Card
        style={{
          marginLeft: "20px",
          background: "#b2f7e9",
          height: height + "px",
          width: width + "px",
          position: "relative",
        }}
      >
        <Connection
          leftA={100}
          topA={100}
          leftB={400}
          topB={300}
          infected={infected}
        ></Connection>
      </Card>
    </div>
  );
};

export default Playground;
