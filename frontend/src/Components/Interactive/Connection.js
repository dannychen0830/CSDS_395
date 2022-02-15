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

function Connection({ leftA, topA, leftB, topB }) {
  const length = useMemo(() => {
    return calculateLength(leftA, topA, leftB, topB);
  }, [leftA, leftB, topA, topB]);

  const angle = useMemo(() => {
    return calculateAngle(leftA, topA, leftB, topB);
  }, [leftA, leftB, topA, topB]);
  return (
    <div
      style={{
        height: width + "px",
        width: length,
        position: "absolute",
        left: (leftA + leftB) / 2 - length / 2,
        top: (topA + topB) / 2,
        background: "black",
        zIndex: 1,
        transform: "rotate(" + angle.toFixed(3) + "rad)",
      }}
    ></div>
  );
}

export default Connection;
