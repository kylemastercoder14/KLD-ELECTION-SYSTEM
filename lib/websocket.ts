import { Server as SocketIOServer } from "socket.io"
import type { Server as NetServer } from "http"
import type { NextApiResponse } from "next"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const initSocket = (res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...")

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    })

    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-election", (electionId) => {
        socket.join(`election-${electionId}`)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }
}
