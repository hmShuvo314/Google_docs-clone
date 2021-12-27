import React from "react";

const CanvasOptions = ({ setStrokeColor }) => {
  return (
    <div>
      <input type="color" onChange={(e) => setStrokeColor(e.target.value)} />
      <button onClick={() => setStrokeColor("grey")}>Erase</button>
    </div>
  );
};

export default CanvasOptions;
