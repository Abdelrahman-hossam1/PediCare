import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { rollbackSession } from "@/lib/session"

export async function POST(req: Request) {
  const user = await getCurrentUser(req)

  if (user?.sessionId) {
    await rollbackSession(user.sessionId)
  }

  const response = NextResponse.json({ message: "Logged out and changes rolled back" }, { status: 200 })
  response.cookies.delete({ name: "token", path: "/" })
  return response
}

