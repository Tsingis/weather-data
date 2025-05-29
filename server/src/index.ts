import Fastify from "fastify"
import redisPlugin from "./plugins/redis"
import { HybridCache } from "./HybridCache"

const PORT = Number(process.env.PORT) || 8000

const server = Fastify()

server.register(redisPlugin)

let cache: HybridCache

server.addHook("onReady", async () => {
  cache = new HybridCache(server.redis, {
    l1Ttl: 60,
    l2Ttl: 300,
    prefix: "calc:",
  })
})

async function expensiveCalc(x: number): Promise<number> {
  await new Promise((r) => setTimeout(r, 2000))
  return x * x
}

server.get("/", async (request, reply) => {
  const num = Math.floor(Math.random() * 11)
  const { value, source } = await cache.get<number>(num.toString())

  if (value !== null) {
    return { source, x: num, result: value }
  }

  const result = await expensiveCalc(num)
  await cache.set(num.toString(), result)

  return { source: "computed", x: num, result }
})

const start = async () => {
  try {
    await server.listen({ host: "0.0.0.0", port: PORT })
    console.log(`Server is running at http://localhost:${PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
