// src/types/fastify-redis.d.ts
import { RedisClientType } from "@redis/client"
import "fastify"

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClientType
  }
}
