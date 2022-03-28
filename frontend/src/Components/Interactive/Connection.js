import { Card } from "@mui/material";
import { useMemo } from "react";
const width = 4;

// props: leftA, topA, leftB, topB

const calculateLength = (leftA, topA, leftB, topB) => {
  return Math.ceil(((leftA - leftB) ** 2 + (topA - topB) ** 2) ** (1 / 2));
};

const calculateAngle = (leftA, topA, leftB, topB) => {
  const angle = Math.atan((topB - topA) / (leftB - leftA));
  return angle;
};

function Connection({ leftA, topA, leftB, topB, infected }) {
  const length = useMemo(() => {
    return calculateLength(leftA, topA, leftB, topB);
  }, [leftA, leftB, topA, topB]);

  const angle = useMemo(() => {
    return calculateAngle(leftA, topA, leftB, topB);
  }, [leftA, leftB, topA, topB]);

  const style = useMemo(() => {
    let tmp = {
      height: width + "px",
      width: length,
      position: "absolute",
      left: (leftA + leftB) / 2 - length / 2,
      top: (topA + topB) / 2,
      background: "black",
      zIndex: 1,
      transform: "rotate(" + angle.toFixed(3) + "rad)",
      background: "linear-gradient(to left, black 50%, salmon 50%)",
      backgroundSize: "200%",
      backgroundPosition: infected ? "left" : "right",
      transition: ".5s ease-out",
    };
    return tmp;
  }, [infected]);
  return <Card style={style}></Card>;
}

export default Connection;
