import cors from '@fastify/cors'
import chalk from 'chalk'
import 'dotenv/config'
import Fastify from 'fastify'
import mongodbPlugin from './plugins/mongodb'
import venueRoutes from './routes/venues'

// Log environment loading (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(chalk.gray('📝 Environment variables loaded from .env file'))
}

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
            ignore: 'pid,hostname',
          },
        }
        : undefined,
  },
})

/**
 * Server Configuration
 */
const PORT = parseInt(process.env.PORT || '3002', 10)
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Register Plugins
 */
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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
      timestamp: new Date().toISOString(),
    }
  })

  // API routes
  await fastify.register(venueRoutes, { prefix: '/api/venues' })
}

/**
 * Print banner with server info
 */
function printBanner() {
  const env = process.env.NODE_ENV || 'development'
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/sunbar'
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'

  console.log('')
  console.log(
    chalk.bold.yellow(
      '╔══════════════════════════════════════════════════════════╗',
    ),
  )
  console.log(
    chalk.bold.yellow('║') +
      chalk.bold.cyan(
        '              🌞 SunBar API Server 🌞                   ',
      ) +
      chalk.bold.yellow('║'),
  )
  console.log(
    chalk.bold.yellow(
      '╚══════════════════════════════════════════════════════════╝',
    ),
  )
  console.log('')
  console.log(
    chalk.bold('  Server:       ') + chalk.green(`http://${HOST}:${PORT}`),
  )
  console.log(chalk.bold('  Environment:  ') + chalk.blue(env))
  console.log(chalk.bold('  MongoDB:      ') + chalk.magenta(mongoUri))
  console.log(chalk.bold('  CORS Origin:  ') + chalk.cyan(corsOrigin))
  console.log('')
  console.log(chalk.bold.yellow('  📋 Available Routes:'))
  console.log('')

  // Print all registered routes
  printRoutes()
}

/**
 * Print all registered routes
 */
function printRoutes() {
  const routes = fastify.printRoutes({ commonPrefix: false })
  const lines = routes.split('\n').filter(line => line.trim())

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Color code by HTTP method
    if (trimmedLine.includes('GET')) {
      console.log('  ' + chalk.green('GET    ') + trimmedLine.replace('GET', '').trim())
    } else if (trimmedLine.includes('POST')) {
      console.log('  ' + chalk.blue('POST   ') + trimmedLine.replace('POST', '').trim())
    } else if (trimmedLine.includes('PUT')) {
      console.log('  ' + chalk.yellow('PUT    ') + trimmedLine.replace('PUT', '').trim())
    } else if (trimmedLine.includes('DELETE')) {
      console.log('  ' + chalk.red('DELETE ') + trimmedLine.replace('DELETE', '').trim())
    } else {
      console.log('  ' + chalk.gray(trimmedLine))
    }
  })

  console.log('')
}

/**
 * Start Server
 */
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()

    await fastify.listen({ port: PORT, host: HOST })

    printBanner()

    console.log(
      chalk.bold.green('  ✅ Server is ready and listening for requests'),
    )
    console.log('')
  } catch (err) {
    console.log('')
    console.log(chalk.bold.red('  ❌ Failed to start server:'))
    console.log(chalk.red(`     ${err}`))
    console.log('')
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
    console.log('')
    console.log(chalk.yellow(`  ⏳ Received ${signal}, closing server...`))
    await fastify.close()
    console.log(chalk.green('  ✅ Server closed gracefully'))
    console.log('')
    process.exit(0)
  })
})

// Start the server
start()
