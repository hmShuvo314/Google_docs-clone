import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CanvasOptions from "./CanvasOptions";

const CanvasEditor = ({ socket, context, setContext, setId }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [source, setSource] = useState();
  const [strokeColor, setStrokeColor] = useState("black");
  const canvasRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    setSource("user");
    setId(id);
  }, []);

  useEffect(() => {
    if (!socket || !canvasRef.current || !context) return;
    const canvas = canvasRef.current;
    socket.once("load-coordinates", handleCoordinates);
    function handleCoordinates(coordinates) {
      for (const [x, y, color] of coordinates) {
        draw(x * canvas.width, y * canvas.height, color, "remote");
      }
    }
    socket.emit("get-coordinates");
    return () => {
      socket.off("load-coordinates", handleCoordinates);
    };
  }, [socket, context]);

  useEffect(() => {
    if (!socket) return;
    const canvas = canvasRef.current;
    socket.on("redraw", hanldeRemoteDrawing);

    function hanldeRemoteDrawing([newX, newY, color]) {
      // if (!canvas) return;
      setSource("remote");
      const coordinateX = newX * canvas.width;
      const coordinateY = newY * canvas.height;
      draw(coordinateX, coordinateY, color, "remote");
    }

    return () => {
      socket.off("load-coordinates", hanldeRemoteDrawing);
    };
  }, [socket, context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!socket || source === "remote" || !isDrawing) return;
    const coordinateX = lastX / canvas.width;
    const coordinateY = lastY / canvas.height;
    socket.emit("draw", [coordinateX, coordinateY, strokeColor]);
  }, [lastX, lastY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setContext(ctx);

    canvas.height = window.innerHeight * 0.8;
    canvas.width = window.innerWidth * 0.8;
    // context.strokeStyle = strokeColor;
    ctx.lineWidth = 10;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }, []);

  function draw(newX, newY, color, type) {
    if (!isDrawing && type === "user") return;

    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(newX, newY);
    context.lineTo(newX, newY);
    context.stroke();

    setLastX(newX);
    setLastY(newY);
  }
  return (
    <div className="container">
      <CanvasOptions setStrokeColor={setStrokeColor} />
      <canvas
        onMouseMove={(e) => {
          setSource("user");
          draw(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
            strokeColor,
            "user"
          );
        }}
        onMouseOut={() => setIsDrawing(false)}
        onMouseDown={(e) => {
          setLastX(e.nativeEvent.offsetX);
          setLastY(e.nativeEvent.offsetY);
          setIsDrawing(true);
        }}
        onMouseUp={() => setIsDrawing(false)}
        ref={canvasRef}
      ></canvas>
    </div>
  );
};

export default CanvasEditor;
