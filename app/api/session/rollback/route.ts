import { NextResponse } from "next/server"
import { cleanupExpiredSessions, rollbackSession } from "@/lib/session"
import { getCurrentUser } from "@/lib/getCurrentUser"

export async function POST(req: Request) {
    try {
        // 1. Manually cleanup all expired sessions
        await cleanupExpiredSessions()

        // 2. If a specific sessionId is provided, roll it back
        const { sessionId } = await req.json().catch(() => ({}))
        if (sessionId) {
            await rollbackSession(sessionId)
            return NextResponse.json({ message: `Session ${sessionId} rolled back` })
        }

        return NextResponse.json({ message: "Expired sessions cleaned up" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Support GET for easy triggering (e.g. from a cron service)
export async function GET() {
    await cleanupExpiredSessions()
    return NextResponse.json({ message: "Cleanup triggered" })
}
