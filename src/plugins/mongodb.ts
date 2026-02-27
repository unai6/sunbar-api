import chalk from 'chalk'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fp from 'fastify-plugin'
import mongoose from 'mongoose'

/**
 * MongoDB Plugin
 * Connects to MongoDB using Mongoose
 */
async function mongodbPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunbar'

  try {
    // Connect with explicit timeout and options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // Fail fast if MongoDB is not available
    })

    console.log(chalk.green('  ✅ MongoDB connected successfully'))

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      await mongoose.connection.close()
      console.log(chalk.gray('  🔌 MongoDB connection closed'))
    })
  } catch (error) {
    console.log(chalk.red('  ❌ MongoDB connection failed'))
    console.log(chalk.yellow('  ⚠️  Server will continue without MongoDB'))
    console.log(
      chalk.gray(
        '     Database operations will fail until MongoDB is available'
      )
    )
    // Don't throw - allow server to start even if MongoDB is not available
    // This prevents the plugin timeout error
  }
}

export default fp(mongodbPlugin, {
  name: 'mongodb',
  fastify: '4.x'
})
