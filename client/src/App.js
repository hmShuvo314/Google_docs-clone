import { io } from "socket.io-client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Redirect,
  useParams,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import CanvasEditor from "./Components/CanvasEditor";
import TextEditor from "./Components/TextEditor";
import { useEffect, useState } from "react";
function App() {
  const [context, setContext] = useState();

  const [socket, setSocket] = useState();
  const [isTextEditor, setIsTextEditor] = useState(false);
  const [pageX, setPageX] = useState();
  const [pageY, setPageY] = useState();
  const [friends, setFriends] = useState([]);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("send-toggle_editor", isTextEditor);
  }, [isTextEditor]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("collaborate-users", id);
  }, [id, socket]);

  useEffect(() => {
    const s = io("http://localhost:8080");
    setSocket(s);
    const handleMove = (e) => {
      setPageX(e.pageX);
      setPageY(e.pageY);
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("get-cursor-movement", ([newPageX, newPageY]) => {
      const coordinateX = newPageX * window.innerWidth;
      const coordinateY = newPageY * window.innerHeight;

      setFriends([...friends, [coordinateX, coordinateY]]);
    });
    socket.on("receive-toggle_editor", (toggleEditor) =>
      setIsTextEditor(toggleEditor)
    );
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const coordinateX = pageX / window.innerWidth;
    const coordinateY = pageY / window.innerHeight;
    socket.emit("cursor-move", [coordinateX, coordinateY]);
  }, [pageY, pageY]);
  return (
    <>
      <button className="toggle" onClick={() => setIsTextEditor(!isTextEditor)}>
        Toggle Editor: {isTextEditor ? "TextEditor" : "Canvas"}
      </button>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={`documents/${uuidV4()}`} />} />
          <Route
            path="/documents/:id"
            element={
              isTextEditor ? (
                <TextEditor socket={socket} setId={setId} />
              ) : (
                <CanvasEditor
                  socket={socket}
                  context={context}
                  setContext={setContext}
                  setId={setId}
                />
              )
            }
          />
        </Routes>
      </Router>

      {friends.map(([x, y], i) => {
        return (
          <div
            key={i}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            className="cursor"
          ></div>
        );
      })}
    </>
  );
}

export default App;
//
