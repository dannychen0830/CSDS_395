import { Input } from "@mui/material";

const TextInput = (props) => {
  return (
    <div>
      <Input placeholder="Connections"></Input>
      <Input placeholder="Nodes"></Input>
      <Input placeholder="Infected"></Input>
    </div>
  );
};

export default TextInput;
