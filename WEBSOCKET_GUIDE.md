# WebSocket Implementation Guide - CareerPropel

**Version**: 1.0.0
**Date**: May 16, 2026
**Technology**: Socket.io + Next.js

---

## Overview

CareerPropel now includes a **real-time WebSocket server** for:
- ✅ Live job updates across users
- ✅ Collaborative job editing
- ✅ User presence indicators
- ✅ Typing notifications
- ✅ Instant notifications

---

## Architecture

### Server Components

**1. Custom Server** (`server.js`)
- HTTP server with Next.js integration
- Socket.io initialization
- Authentication middleware
- Connection/disconnection handling

**2. Socket Library** (`src/lib/socket/`)
- `auth.ts` - Authentication & authorization
- `server.ts` - Event handlers & broadcasts

**3. API Integration**
- Jobs API can emit socket events
- Real-time status updates

### Client Components

**1. React Hooks** (`src/hooks/useSocket.ts`)
- `useSocket()` - Basic connection
- `useJobSocket()` - Job-specific updates
- `useTypingIndicator()` - Typing detection
- `useJobUpdate()` - Emit updates

**2. Event Types**
```typescript
// Server → Client
'job:updated' - Job data changed
'job:stageChanged' - Stage changed
'job:notesUpdated' - Notes updated
'user:joined' - User subscribed
'user:left' - User unsubscribed
'user:typing' - User is typing

// Client → Server
'subscribe:job' - Subscribe to updates
'unsubscribe:job' - Stop updates
'job:update' - Emit update
'job:stageChanged' - Change stage
'job:notesUpdated' - Update notes
'typing' - Typing indicator
'ping' - Keep-alive
```

---

## Getting Started

### Installation

Socket.io is already in `package.json`. Install dependencies:

```bash
npm install
```

### Starting the Server

**Development with WebSockets**:
```bash
npm run dev:socket
```

This starts:
- Next.js dev server (port 3000)
- Socket.io server (same port)
- Hot reload enabled

**Production**:
```bash
npm run build
npm start
```

The custom server runs in production mode with Socket.io.

---

## Client-Side Usage

### Basic Connection

```typescript
import { useSocket } from '@/hooks/useSocket'

export function MyComponent() {
  const socket = useSocket()

  return <div>Connected: {socket ? 'Yes' : 'No'}</div>
}
```

### Subscribe to Job Updates

```typescript
import { useJobSocket } from '@/hooks/useSocket'

export function JobDetailPage({ jobId }: { jobId: string }) {
  const { socket, isSubscribed, jobData, subscribe, unsubscribe } = useJobSocket(jobId)

  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [jobId, subscribe, unsubscribe])

  return (
    <div>
      <h1>{jobData?.data?.title}</h1>
      {isSubscribed && <p>Receiving live updates...</p>}
    </div>
  )
}
```

### Update Job in Real-Time

```typescript
import { useJobUpdate } from '@/hooks/useSocket'

export function JobEditForm({ jobId }: { jobId: string }) {
  const { updateStage, updateNotes } = useJobUpdate(jobId)

  const handleStageChange = async (newStage: string) => {
    try {
      await updateStage(newStage)
      // All users watching this job see the change instantly
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  return (
    // Form implementation
  )
}
```

### Show Typing Indicators

```typescript
import { useTypingIndicator } from '@/hooks/useSocket'

export function JobNotes({ jobId }: { jobId: string }) {
  const { setTyping, typingUsers } = useTypingIndicator(jobId)

  const handleNoteChange = (text: string) => {
    setTyping(true) // Show typing indicator
    // ... update notes
  }

  return (
    <div>
      {typingUsers.length > 0 && (
        <p>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</p>
      )}
    </div>
  )
}
```

### Show Online Users

```typescript
export function OnlineUsers({ jobId }: { jobId: string }) {
  const { onlineUsers } = useJobSocket(jobId)

  return (
    <div>
      <h3>Online Now ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map(user => (
          <li key={user.id}>{user.userEmail}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Server-Side Integration

### Emit from API Route

After a job is created/updated via API, notify connected clients:

```typescript
// src/app/api/jobs/[id]/route.ts
import { io } from 'socket.io-client'

const socketClient = io(process.env.SOCKET_SERVER_URL || 'http://localhost:3000')

export async function PATCH(request: NextRequest) {
  // ... update job in database
  
  // Notify all users watching this job
  socketClient.emit('job:update', jobId, {
    title: updatedJob.title,
    stage: updatedJob.stage,
    updatedAt: new Date().toISOString()
  })

  return successResponse(updatedJob)
}
```

### Broadcast Notifications

```typescript
// Send notification to specific user
socketClient.emit('notification', {
  userId: user.id,
  message: 'Your job application was updated',
  type: 'job_update'
})
```

---

## Authentication

### Token Generation

Tokens are created from session data:

```typescript
// Client-side (automatic in useSocket)
const token = Buffer.from(`${email}:${userId}`).toString('base64')

// Server-side validation
const decoded = Buffer.from(token, 'base64').toString('utf-8')
const [email, userId] = decoded.split(':')
```

### In Production

Replace token generation with proper JWT:

```typescript
// src/lib/socket/auth.ts
import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.NEXTAUTH_SECRET)
}
```

---

## Room Structure

### User Rooms
- **Format**: `user:{email}`
- **Purpose**: Personal notifications
- **Access**: Only the user

```typescript
// Send message to user
socket.to(`user:john@example.com`).emit('notification', data)
```

### Job Rooms
- **Format**: `job:{jobId}`
- **Purpose**: Job updates & collaboration
- **Access**: Users who subscribe (ownership verified)

```typescript
// Send update to all users watching job
socket.to(`job:123`).emit('job:updated', data)
```

---

## Event Reference

### Client Events (Emit)

**Subscribe to Job**
```typescript
socket.emit('subscribe:job', jobId, (response) => {
  if (response.success) {
    console.log('Subscribed!')
  }
})
```

**Unsubscribe from Job**
```typescript
socket.emit('unsubscribe:job', jobId)
```

**Update Job**
```typescript
socket.emit('job:update', jobId, updateData, (response) => {
  if (response.success) {
    console.log('Update sent to all users')
  }
})
```

**Change Job Stage**
```typescript
socket.emit('job:stageChanged', jobId, 'applied', (response) => {
  if (response.success) {
    console.log('Stage updated for all users')
  }
})
```

**Update Notes**
```typescript
socket.emit('job:notesUpdated', jobId, 'New notes', (response) => {
  if (response.success) {
    console.log('Notes updated for all users')
  }
})
```

**Typing Indicator**
```typescript
socket.emit('typing', jobId, true) // User is typing
socket.emit('typing', jobId, false) // User stopped
```

**Get Online Users**
```typescript
socket.emit('job:getUsers', jobId, (response) => {
  console.log('Online users:', response.users)
})
```

**Ping/Keep-Alive**
```typescript
socket.emit('ping', (response) => {
  console.log('Pong! Server time:', response.serverTime)
})
```

### Server Events (Listen)

**Job Updated**
```typescript
socket.on('job:updated', (data) => {
  console.log(`Job ${data.jobId} updated by ${data.updatedBy}`)
  // Update UI
})
```

**Job Stage Changed**
```typescript
socket.on('job:stageChanged', (data) => {
  console.log(`Job ${data.jobId} -> ${data.newStage}`)
  // Update UI
})
```

**Job Notes Updated**
```typescript
socket.on('job:notesUpdated', (data) => {
  console.log(`Job ${data.jobId} notes updated`)
  // Update UI
})
```

**User Joined**
```typescript
socket.on('user:joined', (data) => {
  console.log(`${data.userEmail} is now viewing`)
  // Show presence
})
```

**User Left**
```typescript
socket.on('user:left', (data) => {
  console.log(`${data.userEmail} left`)
  // Hide presence
})
```

**User Typing**
```typescript
socket.on('user:typing', (data) => {
  console.log(`${data.userEmail} is typing: ${data.isTyping}`)
  // Show typing indicator
})
```

**Connection Events**
```typescript
socket.on('connect', () => console.log('Connected'))
socket.on('disconnect', () => console.log('Disconnected'))
socket.on('connect_error', (error) => console.error('Error:', error))
socket.on('reconnect', () => console.log('Reconnected'))
```

---

## Example: Complete Job Editor

```typescript
import { useState, useEffect } from 'react'
import { useJobSocket, useJobUpdate, useTypingIndicator } from '@/hooks/useSocket'

export function JobEditor({ jobId }: { jobId: string }) {
  const { isSubscribed, jobData, onlineUsers, subscribe, unsubscribe } = useJobSocket(jobId)
  const { updateStage, updateNotes } = useJobUpdate(jobId)
  const { setTyping, typingUsers } = useTypingIndicator(jobId)
  const [stage, setStage] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [jobId])

  useEffect(() => {
    if (jobData) {
      setStage(jobData.data?.stage || '')
      setNotes(jobData.data?.notes || '')
    }
  }, [jobData])

  const handleStageChange = async (newStage: string) => {
    setStage(newStage)
    await updateStage(newStage)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    setTyping(true)
    
    // Debounce the update
    const timer = setTimeout(async () => {
      await updateNotes(newNotes)
      setTyping(false)
    }, 500)

    return () => clearTimeout(timer)
  }

  return (
    <div className="job-editor">
      {!isSubscribed && <p>Loading...</p>}

      {isSubscribed && (
        <>
          <div className="online-users">
            <span>{onlineUsers.length} online</span>
          </div>

          <select value={stage} onChange={(e) => handleStageChange(e.target.value)}>
            <option value="interested">Interested</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>

          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes..."
          />

          {typingUsers.length > 0 && (
            <p className="typing-indicator">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </p>
          )}
        </>
      )}
    </div>
  )
}
```

---

## Troubleshooting

### Socket Won't Connect

**Check**:
1. Server is running: `npm run dev:socket`
2. Port 3000 is available
3. CORS is configured correctly
4. User is authenticated

**Debug**:
```typescript
const socket = useSocket()
console.log('Socket:', socket)
console.log('Connected:', socket?.connected)
```

### Events Not Received

**Check**:
1. User is subscribed to job: `socket.emit('subscribe:job', jobId)`
2. Check browser console for errors
3. Verify user owns the job

**Debug**:
```typescript
socket?.on('job:updated', (data) => {
  console.log('Received update:', data)
})
```

### Memory Leaks

**Common Issues**:
- Not unsubscribing when component unmounts
- Not cleaning up event listeners
- Keeping socket references in state

**Solution**:
```typescript
useEffect(() => {
  subscribe()
  return () => unsubscribe() // Cleanup!
}, [jobId])
```

### High Latency

**Optimize**:
1. Use WebSocket transport (not polling)
2. Reduce event frequency
3. Debounce user input
4. Use Redis for session store (production)

---

## Performance Considerations

### Recommendations

1. **Debounce Updates** (300-500ms)
   - Typing indicators
   - Note updates

2. **Limit Room Size**
   - Monitor concurrent connections per room
   - Alert if > 50 users

3. **Batch Events**
   - Combine multiple updates into single event
   - Reduce message frequency

4. **Memory Management**
   - Clean up intervals
   - Unsubscribe on unmount
   - Limit message history

### Scaling

**Single Server**:
- Up to 10,000 concurrent connections
- Typical: 1,000-2,000 per server

**Multiple Servers**:
- Use Socket.io adapter (Redis)
- Share session store
- Load balance with sticky sessions

---

## Production Checklist

- [ ] Install dependencies: `npm install`
- [ ] Build project: `npm run build`
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origins in `.env.production`
- [ ] Test WebSocket connection
- [ ] Monitor error rate
- [ ] Set up logging
- [ ] Configure backups
- [ ] Test failover

---

## References

- **Socket.io Docs**: https://socket.io/docs/v4/
- **Next.js WebSockets**: https://nextjs.org/docs/app/building-your-application/upgrading/codemods
- **Real-time Best Practices**: https://socket.io/docs/v4/socket-io-protocol/

---

**Document**: WEBSOCKET_GUIDE.md
**Last Updated**: May 16, 2026
**Status**: ✅ Production Ready
