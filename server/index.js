const io = require("socket.io")(8080, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

const documents = {};
const coordinates = {};
const rooms = {};
io.on("connection", (socket) => {
  // socket.on("disconnecting", (any, another) =>
  //   console.log(socket.rooms, any, another)
  // );
  socket.on("collaborate-users", (id) => {
    socket.on("disconnect", async (any) => {});
    socket.join(id);
    rooms[id] = rooms[id] + 1 || 1;

    socket.on("draw", async ([lastX, lastY, color]) => {
      socket.broadcast.to(id).emit("redraw", [lastX, lastY, color]);
      if (id in coordinates) coordinates[id].push([lastX, lastY, color]);
      else coordinates[id] = [[lastX, lastY, color]];
      const sockets = await io.in(id).fetchSockets();
      console.log("-----------");
      console.log(socket.rooms);
    });

    socket.on("get-coordinates", () => {
      console.log("object");
      if (id in coordinates)
        socket.broadcast.to(id).emit("load-coordinates", coordinates[id]);
      else socket.broadcast.to(id).emit("load-coordinates", []);
    });

    socket.on("cursor-move", ([pageX, pageY]) => {
      socket.broadcast.to(id).emit("get-cursor-movement", [pageX, pageY]);
    });

    socket.on("send-toggle_editor", (isTextEditor) => {
      socket.broadcast.to(id).emit("receive-toggle_editor", isTextEditor);
    });

    socket.on("get-document", () => {
      let currentDocument = "";
      if (id in documents) currentDocument = documents[id];
      else documents[id] = currentDocument;

      socket.broadcast.to(id).emit("load-document", currentDocument);
    });

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(id).emit("receive-changes", delta);
    });

    socket.on("save-document", (data) => (documents[id] = data));
  });
});
