import { Server as SocketServer, Socket } from 'socket.io'
import { createAuthMiddleware, joinUserRoom, joinJobRoom, broadcastJobUpdate } from './auth'

/**
 * Socket.io server initialization and event handlers
 * Handles real-time job updates and user notifications
 */
export function initializeSocketServer(io: SocketServer): void {
  // Require authentication for all connections
  io.use(createAuthMiddleware())

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.userEmail} (${socket.id})`)

    // Join user's personal room for notifications
    joinUserRoom(socket)

    // Handle job subscription
    socket.on('subscribe:job', async (jobId: string, callback) => {
      try {
        const hasAccess = await joinJobRoom(socket, jobId)

        if (!hasAccess) {
          callback({ success: false, error: 'Access denied' })
          return
        }

        callback({ success: true })
        socket.emit('subscribed:job', { jobId })

        // Notify others that user is viewing job
        socket.broadcast.to(`job:${jobId}`).emit('user:joined', {
          userEmail: socket.data.userEmail,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Subscribe error:', error)
        callback({ success: false, error: 'Subscription failed' })
      }
    })

    // Handle job unsubscription
    socket.on('unsubscribe:job', (jobId: string) => {
      socket.leave(`job:${jobId}`)
      socket.emit('unsubscribed:job', { jobId })

      // Notify others that user left
      socket.broadcast.to(`job:${jobId}`).emit('user:left', {
        userEmail: socket.data.userEmail,
        timestamp: new Date().toISOString()
      })
    })

    // Handle job update events
    socket.on('job:update', (jobId: string, updateData: any, callback) => {
      try {
        // Verify user is in the job room (meaning they have access)
        if (!socket.rooms.has(`job:${jobId}`)) {
          callback({ success: false, error: 'Not subscribed to this job' })
          return
        }

        // Broadcast update to all users watching this job
        const eventData = {
          jobId,
          data: updateData,
          updatedBy: socket.data.userEmail,
          timestamp: new Date().toISOString()
        }

        io.to(`job:${jobId}`).emit('job:updated', eventData)
        callback({ success: true })

        console.log(`Job updated: ${jobId} by ${socket.data.userEmail}`)
      } catch (error) {
        console.error('Job update error:', error)
        callback({ success: false, error: 'Update failed' })
      }
    })

    // Handle stage change
    socket.on('job:stageChanged', (jobId: string, newStage: string, callback) => {
      try {
        if (!socket.rooms.has(`job:${jobId}`)) {
          callback({ success: false, error: 'Not subscribed to this job' })
          return
        }

        const eventData = {
          jobId,
          newStage,
          changedBy: socket.data.userEmail,
          timestamp: new Date().toISOString()
        }

        io.to(`job:${jobId}`).emit('job:stageChanged', eventData)
        callback({ success: true })

        console.log(`Job stage changed: ${jobId} -> ${newStage}`)
      } catch (error) {
        console.error('Stage change error:', error)
        callback({ success: false, error: 'Stage change failed' })
      }
    })

    // Handle notes update
    socket.on('job:notesUpdated', (jobId: string, notes: string, callback) => {
      try {
        if (!socket.rooms.has(`job:${jobId}`)) {
          callback({ success: false, error: 'Not subscribed to this job' })
          return
        }

        const eventData = {
          jobId,
          notes,
          updatedBy: socket.data.userEmail,
          timestamp: new Date().toISOString()
        }

        io.to(`job:${jobId}`).emit('job:notesUpdated', eventData)
        callback({ success: true })
      } catch (error) {
        console.error('Notes update error:', error)
        callback({ success: false, error: 'Notes update failed' })
      }
    })

    // Handle typing indicator
    socket.on('job:typing', (jobId: string, isTyping: boolean) => {
      try {
        if (!socket.rooms.has(`job:${jobId}`)) return

        socket.broadcast.to(`job:${jobId}`).emit('job:userTyping', {
          jobId,
          userEmail: socket.data.userEmail,
          isTyping,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Typing error:', error)
      }
    })

    // Handle get online users in job room
    socket.on('job:getUsers', (jobId: string, callback) => {
      try {
        if (!socket.rooms.has(`job:${jobId}`)) {
          callback({ success: false, error: 'Not subscribed to this job' })
          return
        }

        // Get all sockets in the job room
        const sockets = io.sockets.adapter.rooms.get(`job:${jobId}`)
        const onlineUsers = Array.from(sockets || []).map(socketId => {
          const sock = io.sockets.sockets.get(socketId)
          return {
            userEmail: sock?.data?.userEmail,
            socketId: socketId
          }
        })

        callback({ success: true, users: onlineUsers })
      } catch (error) {
        console.error('Get users error:', error)
        callback({ success: false, error: 'Failed to get users' })
      }
    })

    // Handle ping/keep-alive
    socket.on('ping', (callback) => {
      callback({ pong: true, serverTime: Date.now() })
    })

    // Disconnection handler
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.data.userEmail} - Reason: ${reason}`)

      // Notify all rooms that user left
      for (const room of socket.rooms) {
        if (room.startsWith('job:')) {
          const jobId = room.replace('job:', '')
          io.to(room).emit('user:left', {
            userEmail: socket.data.userEmail,
            timestamp: new Date().toISOString()
          })
        }
      }
    })

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.data.userEmail}:`, error)
    })
  })

  console.log('Socket.io server initialized')
}

/**
 * Broadcast helper functions for use in API routes
 */
export function broadcastToUser(io: SocketServer, userEmail: string, event: string, data: any): void {
  io.to(`user:${userEmail}`).emit(event, {
    data,
    timestamp: new Date().toISOString()
  })
}

export function broadcastToJob(io: SocketServer, jobId: string, event: string, data: any): void {
  broadcastJobUpdate(io, jobId, event, data)
}
