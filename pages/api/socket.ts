import { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";
import { Server as SocketIOServer } from "socket.io";
import { initSocket } from "@/lib/socket";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

interface SocketWithServer extends NetSocket {
  server: NetServer & {
    io?: SocketIOServer;
  };
}

interface ResponseWithSocket extends NextApiResponse {
  socket: SocketWithServer;
}

const socketHandler = (req: NextApiRequest, res: ResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  }
  res.end();
};

export default socketHandler;
