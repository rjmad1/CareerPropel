import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
}

/**
 * React hook for Socket.io integration
 * Automatically handles authentication and cleanup
 * 
 * Usage:
 *   const socket = useSocket()
 *   socket?.emit('subscribe:job', jobId)
 *   socket?.on('job:updated', (data) => console.log(data))
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, reconnection = true } = options
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Only connect if authenticated and autoConnect is enabled
    if (!session?.user?.email || !autoConnect) {
      return
    }

    // Create Socket.io client
    const socketInstance = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000', {
      // Generate token (in production, get from NextAuth session)
      query: {
        token: Buffer.from(`${session.user.email}:${session.user.id || ''}`).toString('base64')
      },
      reconnection: reconnection,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true
    })

    // Connection event
    socketInstance.on('connect', () => {
      console.log('[Socket] Connected')
      setIsConnected(true)
    })

    // Disconnection event
    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      setIsConnected(false)
    })

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })

    // Reconnection
    socketInstance.on('reconnect', () => {
      console.log('[Socket] Reconnected')
      setIsConnected(true)
    })

    socketRef.current = socketInstance
    setSocket(socketInstance)

    // Cleanup
    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [session?.user?.email, session?.user?.id, autoConnect, reconnection])

  return socket
}

/**
 * Hook to subscribe to a specific job's real-time updates
 * 
 * Usage:
 *   const { subscribe, unsubscribe, isSubscribed } = useJobSocket(jobId)
 *   
 *   useEffect(() => {
 *     subscribe()
 *     return () => unsubscribe()
 *   }, [jobId])
 */
export function useJobSocket(jobId: string) {
  const socket = useSocket()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [jobData, setJobData] = useState<any>(null)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])

  const subscribe = useCallback(() => {
    if (!socket) return

    socket.emit('subscribe:job', jobId, (response: any) => {
      if (response.success) {
        console.log(`[Socket] Subscribed to job: ${jobId}`)
        setIsSubscribed(true)
        
        // Get online users
        socket.emit('job:getUsers', jobId, (response: any) => {
          if (response.success) {
            setOnlineUsers(response.users)
          }
        })
      } else {
        console.error('[Socket] Subscription failed:', response.error)
      }
    })
  }, [socket, jobId])

  const unsubscribe = useCallback(() => {
    if (!socket) return

    socket.emit('unsubscribe:job', jobId)
    setIsSubscribed(false)
    setJobData(null)
    console.log(`[Socket] Unsubscribed from job: ${jobId}`)
  }, [socket, jobId])

  // Listen for job updates
  useEffect(() => {
    if (!socket) return

    socket.on('job:updated', (data) => {
      if (data.jobId === jobId) {
        setJobData(data)
      }
    })

    socket.on('job:stageChanged', (data) => {
      if (data.jobId === jobId) {
        setJobData(prev => ({
          ...prev,
          stage: data.newStage,
          updatedAt: new Date().toISOString()
        }))
      }
    })

    socket.on('job:notesUpdated', (data) => {
      if (data.jobId === jobId) {
        setJobData(prev => ({
          ...prev,
          notes: data.notes,
          updatedAt: new Date().toISOString()
        }))
      }
    })

    socket.on('user:joined', (data) => {
      setOnlineUsers(prev => {
        if (!prev.find(u => u.userEmail === data.userEmail)) {
          return [...prev, { userEmail: data.userEmail }]
        }
        return prev
      })
    })

    socket.on('user:left', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.userEmail !== data.userEmail))
    })

    return () => {
      socket.off('job:updated')
      socket.off('job:stageChanged')
      socket.off('job:notesUpdated')
      socket.off('user:joined')
      socket.off('user:left')
    }
  }, [socket, jobId])

  return {
    socket,
    isSubscribed,
    jobData,
    onlineUsers,
    subscribe,
    unsubscribe
  }
}

/**
 * Hook for real-time typing indicators
 */
export function useTypingIndicator(jobId: string) {
  const socket = useSocket()
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const setTyping = useCallback((isTyping: boolean) => {
    if (!socket) return

    socket.emit('typing', jobId, isTyping)

    // Auto-stop typing after 3 seconds of inactivity
    if (isTyping) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', jobId, false)
      }, 3000)
    }
  }, [socket, jobId])

  useEffect(() => {
    if (!socket) return

    socket.on('user:typing', (data) => {
      if (data.isTyping && !typingUsers.includes(data.userEmail)) {
        setTypingUsers(prev => [...prev, data.userEmail])
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.userEmail))
        }, 4000)
      } else if (!data.isTyping) {
        setTypingUsers(prev => prev.filter(u => u !== data.userEmail))
      }
    })

    return () => {
      socket.off('user:typing')
    }
  }, [socket, typingUsers])

  return { setTyping, typingUsers }
}

/**
 * Hook to emit job updates
 */
export function useJobUpdate(jobId: string) {
  const socket = useSocket()

  const updateJob = useCallback((updateData: any) => {
    if (!socket) return Promise.reject('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit('job:update', jobId, updateData, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }, [socket, jobId])

  const updateStage = useCallback((newStage: string) => {
    if (!socket) return Promise.reject('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit('job:stageChanged', jobId, newStage, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }, [socket, jobId])

  const updateNotes = useCallback((notes: string) => {
    if (!socket) return Promise.reject('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit('job:notesUpdated', jobId, notes, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }, [socket, jobId])

  return {
    updateJob,
    updateStage,
    updateNotes
  }
}
