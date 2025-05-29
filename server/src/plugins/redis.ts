import fp from "fastify-plugin"
import { createClient } from "@redis/client"

export default fp(async (fastify, opts) => {
  const client = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  })

  client.on("error", (err) => fastify.log.error(`Redis error: ${err}`))
  await client.connect()

  fastify.decorate("redis", client)

  fastify.addHook("onClose", async () => {
    await client.quit()
  })
})
