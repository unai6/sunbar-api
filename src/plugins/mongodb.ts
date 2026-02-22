import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fp from 'fastify-plugin'
import mongoose from 'mongoose'

/**
 * MongoDB Plugin
 * Connects to MongoDB using Mongoose
 */
async function mongodbPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunbar'

  try {
    await mongoose.connect(mongoUri)
    fastify.log.info('MongoDB connected successfully')

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      await mongoose.connection.close()
      fastify.log.info('MongoDB connection closed')
    })
  } catch (error) {
    fastify.log.error('MongoDB connection error:', error)
    throw error
  }
}

export default fp(mongodbPlugin, {
  name: 'mongodb'
})
