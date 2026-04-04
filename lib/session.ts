import { prisma } from "./prisma"

const DEFAULT_SESSION_DURATION = 60 // 1 hour in minutes

export async function createSession(userId: string) {
    const durationMinutes = process.env.SESSION_DURATION_MINUTES
        ? parseInt(process.env.SESSION_DURATION_MINUTES)
        : DEFAULT_SESSION_DURATION

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes)

    return await prisma.session.create({
        data: {
            userId,
            expiresAt,
        },
    })
}

export async function validateSession(sessionId: string) {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
    })

    if (!session) return null
    if (session.expiresAt < new Date()) {
        // Session expired, but we don't trigger rollback here to avoid request latency
        // Rollback should be triggered by a background job or explicit logout
        return null
    }

    return session
}

export async function rollbackSession(sessionId: string) {
    const actions = await prisma.sessionAction.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" }, // Reverse order
    })

    for (const action of actions) {
        try {
            await reverseAction(action)
        } catch (error) {
            console.error(`Failed to rollback action ${action.id}:`, error)
        }
    }

    // Delete the session and its actions after rollback
    await prisma.session.delete({
        where: { id: sessionId },
    })
}

async function reverseAction(action: any) {
    const { model, action: type, targetId, prevData } = action
    const delegate = (prisma as any)[model.toLowerCase()]

    switch (type) {
        case "CREATE":
            // Reverting a CREATE means DELETE
            await delegate.delete({ where: { id: targetId } })
            break
        case "UPDATE":
            // Reverting an UPDATE means restoring prevData
            await delegate.update({
                where: { id: targetId },
                data: prevData,
            })
            break
        case "DELETE":
            // Reverting a DELETE means re-creating with prevData
            await delegate.create({ data: prevData })
            break
    }
}

export async function cleanupExpiredSessions() {
    const expiredSessions = await prisma.session.findMany({
        where: { expiresAt: { lt: new Date() } },
        select: { id: true },
    })

    for (const session of expiredSessions) {
        await rollbackSession(session.id)
    }
}
