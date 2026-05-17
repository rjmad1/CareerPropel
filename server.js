/**
 * Custom Next.js server with Socket.io integration
 * This file enables WebSocket support for real-time features
 * 
 * Usage:
 *   node server.js (for production)
 *   npm run dev (uses next dev, Socket.io runs separately)
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { getToken } = require('next-auth/jwt')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Authentication middleware — verifies NextAuth JWT from cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || ''
      const mockReq = { headers: { cookie: cookieHeader } }

      const jwtToken = await getToken({
        req: mockReq,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!jwtToken?.email) {
        return next(new Error('Authentication required'))
      }

      socket.data.userEmail = jwtToken.email
      socket.data.userId = jwtToken.sub
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.data.userEmail}`)

    // Join user's personal room
    socket.join(`user:${socket.data.userEmail}`)

    // Subscribe to job
    socket.on('subscribe:job', async (jobId, callback) => {
      try {
        // In production, verify user owns this job
        socket.join(`job:${jobId}`)
        callback({ success: true, jobId })
        console.log(`[Socket] User subscribed to job: ${jobId}`)
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Unsubscribe from job
    socket.on('unsubscribe:job', (jobId) => {
      socket.leave(`job:${jobId}`)
      console.log(`[Socket] User unsubscribed from job: ${jobId}`)
    })

    // Broadcast job update
    socket.on('job:update', (jobId, data, callback) => {
      try {
        io.to(`job:${jobId}`).emit('job:updated', {
          jobId,
          ...data,
          updatedBy: socket.data.userEmail,
          timestamp: new Date().toISOString()
        })
        callback({ success: true })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Typing indicator
    socket.on('typing', (jobId, isTyping) => {
      socket.broadcast.to(`job:${jobId}`).emit('user:typing', {
        userEmail: socket.data.userEmail,
        isTyping,
        timestamp: new Date().toISOString()
      })
    })

    // Get users in room
    socket.on('getUsers', (jobId, callback) => {
      try {
        const room = io.sockets.adapter.rooms.get(`job:${jobId}`)
        const users = Array.from(room || []).map(socketId => {
          const sock = io.sockets.sockets.get(socketId)
          return {
            userEmail: sock?.data?.userEmail,
            id: socketId
          }
        })
        callback({ success: true, users })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Heartbeat/ping
    socket.on('ping', (callback) => {
      callback({ pong: true, serverTime: Date.now() })
    })

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.data.userEmail}`)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.data.userEmail}:`, error)
    })
  })

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`✅ Server running at http://${hostname}:${port}`)
    console.log(`📡 WebSocket server running`)
    console.log(`🔐 Environment: ${dev ? 'development' : 'production'}`)
  })
})
