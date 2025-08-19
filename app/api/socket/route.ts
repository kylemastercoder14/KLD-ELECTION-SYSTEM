import type { NextRequest } from "next/server"
import { type NextApiResponseServerIO, initSocket } from "@/lib/websocket"

export async function GET(req: NextRequest) {
  const res = new Response() as any as NextApiResponseServerIO
  initSocket(res)

  return new Response("Socket initialized", { status: 200 })
}
