import Fastify from 'fastify'
import cors from '@fastify/cors'
import mongodbPlugin from './plugins/mongodb'
import venueRoutes from './routes/venues'

/**
 * Create Fastify Server
 */
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
        : undefined
  }
})

/**
 * Server Configuration
 */
const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Register Plugins
 */
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })

  // MongoDB
  await fastify.register(mongodbPlugin)
}

/**
 * Register Routes
 */
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })

  // API routes
  await fastify.register(venueRoutes, { prefix: '/api/venues' })
}

/**
 * Start Server
 */
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()

    await fastify.listen({ port: PORT, host: HOST })

    fastify.log.info(`🚀 Server listening on ${HOST}:${PORT}`)
    fastify.log.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

/**
 * Graceful Shutdown
 */
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`)
    await fastify.close()
    process.exit(0)
  })
})

// Start the server
start()
