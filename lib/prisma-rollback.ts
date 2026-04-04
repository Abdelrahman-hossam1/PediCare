import { Prisma } from "@prisma/client"
import { headers } from "next/headers"

export const prismaRollbackExtension = Prisma.defineExtension((client) => {
    return client.$extends({
        query: {
            $allModels: {
                async create({ model, args, query }) {
                    let sessionId: string | undefined
                    try {
                        sessionId = (await headers()).get("x-session-id") || undefined
                    } catch {
                        // Fails if called outside of request context (e.g. build time or cron)
                    }

                    const modelName = model as any
                    if (!sessionId || modelName === "Session" || modelName === "SessionAction") {
                        return query(args)
                    }

                    const result = await query(args)

                    await (client as any).sessionAction.create({
                        data: {
                            sessionId,
                            model: modelName,
                            action: "CREATE",
                            targetId: (result as any).id,
                            data: result,
                        },
                    })

                    return result
                },

                async update({ model, args, query }) {
                    let sessionId: string | undefined
                    try {
                        sessionId = (await headers()).get("x-session-id") || undefined
                    } catch { }

                    const modelName = model as any
                    if (!sessionId || modelName === "Session" || modelName === "SessionAction") {
                        return query(args)
                    }

                    // Fetch previous state before update
                    const prevData = await (client as any)[modelName.toLowerCase()].findUnique({
                        where: (args as any).where,
                    })

                    const result = await query(args)

                    await (client as any).sessionAction.create({
                        data: {
                            sessionId,
                            model: modelName,
                            action: "UPDATE",
                            targetId: (prevData as any).id,
                            prevData,
                            data: result,
                        },
                    })

                    return result
                },

                async delete({ model, args, query }) {
                    let sessionId: string | undefined
                    try {
                        sessionId = (await headers()).get("x-session-id") || undefined
                    } catch { }

                    const modelName = model as any
                    if (!sessionId || modelName === "Session" || modelName === "SessionAction") {
                        return query(args)
                    }

                    // Fetch previous state before delete
                    const prevData = await (client as any)[modelName.toLowerCase()].findUnique({
                        where: (args as any).where,
                    })

                    const result = await query(args)

                    await (client as any).sessionAction.create({
                        data: {
                            sessionId,
                            model: modelName,
                            action: "DELETE",
                            targetId: (prevData as any).id,
                            prevData,
                        },
                    })

                    return result
                },
            },
        },
    })
})
