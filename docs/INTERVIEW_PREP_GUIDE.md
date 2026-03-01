# 🎯 Tars Chat - Complete Interview Preparation Guide

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Database Schema Design](#database-schema-design)
4. [Authentication System](#authentication-system)
5. [Real-time Messaging](#real-time-messaging)
6. [Key Features Implementation](#key-features-implementation)
7. [Common Interview Questions](#common-interview-questions)

---

## 🛠️ Tech Stack Overview

### Frontend
- **Next.js 15+** (App Router) - React framework with server components
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **Framer Motion** - Animations and transitions
- **Clerk** - Authentication provider

### Backend
- **Convex** - Real-time backend-as-a-service
  - Serverless functions (queries & mutations)
  - Real-time subscriptions (WebSocket-based)
  - Built-in database with indexes
  - Automatic schema management

### Why This Stack?
- **Convex**: Eliminates need for separate backend, WebSocket server, and database
- **Clerk**: Handles auth complexity (OAuth, sessions, webhooks)
- **Next.js App Router**: Modern React patterns with server components
- **TypeScript**: Catches errors at compile time

---

## 🏗️ Architecture & Data Flow

### High-Level Architecture
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─── Clerk (Auth) ───────────┐
       │                            │
       ├─── Next.js Frontend ───────┤
       │    (React Components)      │
       │                            │
       └─── Convex Backend ─────────┤
            (Real-time DB)          │
                                    │
                              Webhooks
                              (User Sync)
```

### Request Flow Example: Sending a Message

1. **User types message** → `MessageInputRedesigned.tsx`
2. **Component calls mutation** → `useMutation(api.messages.sendMessage)`
3. **Convex validates auth** → Checks JWT token from Clerk
4. **Mutation executes** → `convex/messages.ts:sendMessage`
   - Validates user is participant
   - Inserts message to DB
   - Updates conversation's `lastMessageAt`
5. **Real-time update** → All subscribed clients receive new message
6. **UI updates automatically** → React re-renders with new data

### Provider Hierarchy
```tsx
<ClerkProvider>           // Auth context
  <ConvexProviderWithClerk>  // Real-time DB + Auth integration
    <ThemeProvider>        // Dark mode
      <HeartbeatProvider>  // Presence system
        <App />
      </HeartbeatProvider>
    </ThemeProvider>
  </ConvexProviderWithClerk>
</ClerkProvider>
```

---

## 🗄️ Database Schema Design

### 1. Users Table
```typescript
{
  clerkId: string,          // Primary identifier from Clerk
  name: string,
  email: string,
  profileImage?: string,
  lastSeen: number,         // Timestamp for presence
  isOnline: boolean,        // Computed from lastSeen
}
```

**Indexes:**
- `by_clerk_id` - Fast user lookup
- `by_email` - Email-based queries
- `by_last_seen` - Presence queries

**Design Decision:** Store `lastSeen` timestamp instead of boolean `isOnline` for more granular presence states (Active now, Recently active, Offline).

### 2. Conversations Table
```typescript
{
  conversationId: string,   // Deterministic ID for 1-on-1
  participants: string[],   // Array of Clerk IDs
  createdAt: number,
  lastMessageAt?: number,   // For sorting
  isGroup?: boolean,
  groupName?: string,
  createdBy?: string,       // Group creator
}
```

**Indexes:**
- `by_conversation_id` - Unique conversation lookup
- `by_participants` - Find conversations by user

**Design Decision:** 
- **1-on-1 chats**: Use deterministic ID `userId1_userId2` (sorted) to prevent duplicates
- **Group chats**: Use random ID `group_timestamp_random`
- Store participants as array for flexible querying

### 3. Messages Table
```typescript
{
  conversationId: Id<"conversations">,
  senderId: string,         // Clerk ID
  content: string,
  sentAt: number,
  isDeleted: boolean,       // Soft delete
  readBy?: string[],        // Clerk IDs who read this
  reactions?: Array<{
    emoji: string,
    userId: string
  }>
}
```

**Indexes:**
- `by_conversation_and_time` - Chronological message retrieval
- `by_sender` - User's message history

**Design Decisions:**
- **Soft delete**: Keep deleted messages with `isDeleted` flag
- **Read receipts**: Array of user IDs who've read the message
- **Reactions**: Array of objects (one reaction per user)

### 4. TypingStates Table
```typescript
{
  userId: Id<"users">,
  conversationId: Id<"conversations">,
  lastTypingAt: number,     // Timestamp
}
```

**Indexes:**
- `by_conversation_and_user` - Quick lookup
- `by_lastTypingAt` - Cleanup old states

**Design Decision:** Separate table for typing states with auto-cleanup (cron job removes states older than 5 minutes).

---

## 🔐 Authentication System

### How It Works

#### 1. User Signs Up/In
```
User → Clerk UI → Clerk Backend → JWT Token → Browser
```

#### 2. Clerk Webhook Syncs User to Convex
```typescript
// app/api/webhooks/clerk/route.ts
POST /api/webhooks/clerk
  ↓
Verify webhook signature (Svix)
  ↓
Handle event (user.created, user.updated, user.deleted)
  ↓
Call Convex mutation to sync user data
```

**Events Handled:**
- `user.created` → Create user in Convex DB
- `user.updated` → Update user profile
- `user.deleted` → Remove user from Convex DB

#### 3. Protected Routes
```typescript
// middleware.ts
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();  // Redirects to /sign-in if not authenticated
  }
});
```

**Public routes:** `/`, `/sign-in`, `/sign-up`
**Protected routes:** `/messages`, `/users`, `/profile`

#### 4. Convex Auth Integration
```typescript
// Every Convex query/mutation
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
```

Convex validates JWT token from Clerk on every request.

### Auth Flow Diagram
```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Sign in
     ▼
┌──────────┐
│  Clerk   │
└────┬─────┘
     │ 2. JWT Token
     ▼
┌──────────┐      3. Webhook       ┌──────────┐
│ Browser  │ ───────────────────→  │  Convex  │
└────┬─────┘                       └────┬─────┘
     │ 4. API calls with JWT           │
     └─────────────────────────────────┘
```

---

## 💬 Real-time Messaging

### How Messages Sync Live

#### 1. Convex Subscriptions (WebSocket)
```typescript
// Component subscribes to messages
const messages = useQuery(api.messages.getMessages, { conversationId });
```

**What happens:**
- Convex opens WebSocket connection
- When ANY client sends a message, Convex pushes update to ALL subscribed clients
- React automatically re-renders with new data

#### 2. Sending a Message
```typescript
// components/features/messaging/MessageInputRedesigned.tsx
const sendMessage = useMutation(api.messages.sendMessage);

const handleSend = async () => {
  await sendMessage({
    conversationId,
    content: message
  });
};
```

#### 3. Backend Mutation
```typescript
// convex/messages.ts
export const sendMessage = mutation({
  handler: async (ctx, args) => {
    // 1. Validate auth
    const identity = await ctx.auth.getUserIdentity();
    
    // 2. Validate user is participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation.participants.includes(identity.subject)) {
      throw new Error("Not authorized");
    }
    
    // 3. Insert message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: identity.subject,
      content: args.content,
      sentAt: Date.now(),
      isDeleted: false,
      readBy: [identity.subject]
    });
    
    // 4. Update conversation timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now()
    });
  }
});
```

#### 4. Real-time Update Flow
```
User A sends message
  ↓
Convex mutation executes
  ↓
Database updated
  ↓
Convex pushes update via WebSocket
  ↓
User B's useQuery hook receives update
  ↓
React re-renders User B's UI
```

### Why This is Fast
- **WebSocket**: Persistent connection, no polling
- **Optimistic updates**: UI updates before server confirms
- **Automatic subscriptions**: Convex handles all WebSocket logic

---

## 🎨 Key Features Implementation

### 1. Online/Offline Status (Presence System)

#### How It Works
```typescript
// components/providers/HeartbeatProvider.tsx
useEffect(() => {
  const interval = setInterval(() => {
    sendHeartbeat();  // Every 30 seconds
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**Heartbeat mutation:**
```typescript
// convex/presence.ts
export const sendHeartbeat = mutation({
  handler: async (ctx) => {
    await ctx.db.patch(user._id, {
      lastSeen: Date.now()  // Update timestamp
    });
  }
});
```

**Status computation:**
```typescript
// lib/utils/presenceStatus.ts
const ACTIVE_NOW_THRESHOLD = 10 * 1000;  // 10 seconds
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000;  // 5 minutes

if (timeSinceLastSeen < ACTIVE_NOW_THRESHOLD) {
  return "Active now";  // Green dot
} else if (timeSinceLastSeen < RECENTLY_ACTIVE_THRESHOLD) {
  return "Recently active";  // No dot
} else {
  return "Offline";  // No dot
}
```

**Why this design?**
- Avoids constant DB writes (only every 30s)
- More granular than boolean online/offline
- Handles tab close gracefully (Page Visibility API)

### 2. Typing Indicator

#### Frontend
```typescript
// components/features/messaging/MessageInputRedesigned.tsx
const setTypingState = useMutation(api.typingStates.setTypingState);
const clearTypingState = useMutation(api.typingStates.clearTypingState);

const handleChange = useDebouncedCallback((value: string) => {
  if (value.length > 0) {
    setTypingState({ conversationId });
  }
}, 300);  // Debounce to avoid too many calls

// Clear on send
const handleSend = async () => {
  await sendMessage({ ... });
  await clearTypingState({ conversationId });
};
```

#### Backend
```typescript
// convex/typingStates.ts
export const getTypingState = query({
  handler: async (ctx, args) => {
    const typingStates = await ctx.db
      .query("typingStates")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    
    const now = Date.now();
    const TYPING_TIMEOUT = 3000;  // 3 seconds
    
    // Filter active typing states (exclude current user)
    return typingStates.filter(state =>
      state.userId !== currentUser._id &&
      now - state.lastTypingAt < TYPING_TIMEOUT
    );
  }
});
```

**Auto-cleanup:** Cron job removes typing states older than 5 minutes.

### 3. Unread Message Count

#### Read Tracking
```typescript
// messages table
{
  readBy: ["user1_clerk_id", "user2_clerk_id"]  // Array of readers
}
```

#### Mark as Read (IntersectionObserver)
```typescript
// lib/hooks/useMessageVisibility.ts
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const messageId = entry.target.dataset.messageId;
      markMessageAsRead({ messageId });
    }
  });
}, { threshold: 0.5 });  // 50% visible
```

#### Count Unread
```typescript
// convex/messages.ts
export const getUnreadCount = query({
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    
    let unreadCount = 0;
    for (const message of messages) {
      // Skip own messages
      if (message.senderId === currentUserId) continue;
      
      // Count if not in readBy array
      if (!message.readBy?.includes(currentUserId)) {
        unreadCount++;
      }
    }
    return unreadCount;
  }
});
```

### 4. Smart Auto-Scroll

```typescript
// lib/hooks/useAutoScroll.ts
const useAutoScroll = (messageCount: number) => {
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Check if user is near bottom
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isNearBottom) {
      // Auto-scroll
      container.scrollTop = container.scrollHeight;
    } else {
      // Show "New Messages" button
      setShowNewMessagesButton(true);
    }
  }, [messageCount]);
  
  return { scrollContainerRef, showNewMessagesButton, scrollToBottom };
};
```

### 5. Group Chat

#### Creating a Group
```typescript
// convex/conversations.ts
export const createGroupConversation = mutation({
  args: {
    participantIds: v.array(v.string()),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    // Ensure creator is in participants
    const allParticipants = [identity.subject, ...args.participantIds];
    
    // Generate unique ID
    const conversationId = `group_${Date.now()}_${randomString}`;
    
    await ctx.db.insert("conversations", {
      conversationId,
      participants: allParticipants,
      isGroup: true,
      groupName: args.groupName,
      createdBy: identity.subject,
      createdAt: Date.now()
    });
  }
});
```

#### Displaying Group Messages
```typescript
// Show sender name and avatar for each message
{conversation.isGroup && (
  <div className="flex items-center gap-2">
    <Avatar src={message.sender.profileImage} />
    <span>{message.sender.name}</span>
  </div>
)}
```

### 6. Message Reactions

```typescript
// convex/messages.ts
export const toggleReaction = mutation({
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    const reactions = message.reactions || [];
    
    // Find existing reaction from this user
    const existingIndex = reactions.findIndex(
      r => r.userId === currentUserId
    );
    
    if (existingIndex >= 0) {
      if (reactions[existingIndex].emoji === args.emoji) {
        // Same emoji - remove it
        reactions.splice(existingIndex, 1);
      } else {
        // Different emoji - replace it
        reactions[existingIndex] = { emoji: args.emoji, userId: currentUserId };
      }
    } else {
      // Add new reaction
      reactions.push({ emoji: args.emoji, userId: currentUserId });
    }
    
    await ctx.db.patch(args.messageId, { reactions });
  }
});
```

### 7. Dark Mode

```typescript
// components/providers/ThemeProvider.tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
  // Load from localStorage
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
}, []);

useEffect(() => {
  // Apply to document
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}, [theme]);
```

**CSS Variables:**
```css
/* globals.css */
:root {
  --background: #ffffff;
  --foreground: #000000;
}

.dark {
  --background: #1a1a1a;
  --foreground: #ffffff;
}
```

---

## ❓ Common Interview Questions

### 1. "How does real-time messaging work?"

**Answer:**
"We use Convex which provides real-time subscriptions over WebSocket. When a component calls `useQuery`, it establishes a WebSocket connection. When any client sends a message via a mutation, Convex automatically pushes the update to all subscribed clients. React then re-renders with the new data. This eliminates the need for polling or manual WebSocket management."

### 2. "How do you prevent duplicate conversations?"

**Answer:**
"For 1-on-1 chats, we use a deterministic conversation ID by sorting the two user IDs and joining them: `userId1_userId2`. Before creating a conversation, we query by this ID. If it exists, we return the existing conversation. For group chats, we generate a unique ID with timestamp and random string."

### 3. "How does the presence system work?"

**Answer:**
"We use a heartbeat mechanism. Every 30 seconds, the client sends a heartbeat mutation that updates the user's `lastSeen` timestamp. Instead of storing a boolean `isOnline`, we compute the status from the timestamp:
- Less than 10 seconds ago: 'Active now' (green dot)
- Less than 5 minutes ago: 'Recently active'
- Older: 'Offline'

This gives us more granular presence states and handles edge cases like tab switching."

### 4. "How do you handle message read receipts?"

**Answer:**
"Each message has a `readBy` array containing Clerk IDs of users who've read it. We use IntersectionObserver to detect when a message becomes 50% visible in the viewport, then call a mutation to add the current user to the `readBy` array. For unread counts, we query messages where the current user is NOT in the `readBy` array and is not the sender."

### 5. "Why did you choose Convex over traditional REST API?"

**Answer:**
"Convex provides several advantages:
1. **Real-time by default**: No need to set up WebSocket server
2. **Type-safe**: Automatic TypeScript types from schema
3. **Serverless**: No server management
4. **Optimistic updates**: Built-in support
5. **Auth integration**: Works seamlessly with Clerk

For a real-time chat app, this eliminates a lot of boilerplate compared to Express + Socket.io + PostgreSQL."

### 6. "How do you handle authentication?"

**Answer:**
"We use Clerk for authentication. The flow is:
1. User signs in via Clerk UI
2. Clerk webhook notifies our Next.js API route
3. We sync user data to Convex database
4. Clerk provides JWT token to browser
5. Every Convex request includes this JWT
6. Convex validates the token and provides user identity

For route protection, we use Clerk middleware that redirects unauthenticated users to `/sign-in`."

### 7. "How does typing indicator work?"

**Answer:**
"When a user types, we debounce the input (300ms) and call a mutation to update their typing state with the current timestamp. Other users query typing states for the conversation and filter for states less than 3 seconds old. When a message is sent, we immediately clear the typing state. A cron job cleans up stale typing states older than 5 minutes."

### 8. "How do you handle deleted messages?"

**Answer:**
"We use soft delete. Instead of removing the message from the database, we set `isDeleted: true`. In the UI, we show 'This message was deleted' placeholder. This preserves conversation flow and allows for potential recovery or audit trails. Only the message sender can delete their own messages, which we enforce in the mutation."

### 9. "How is the schema designed for scalability?"

**Answer:**
"Key design decisions:
1. **Indexes**: We have indexes on frequently queried fields (clerkId, conversationId, sentAt)
2. **Denormalization**: We store participant IDs in conversations array for fast lookup
3. **Pagination-ready**: Messages are indexed by conversation and time
4. **Separate typing states**: Prevents message table bloat
5. **Soft deletes**: Maintains referential integrity

For future scale, we could add pagination to message queries and implement message archiving."

### 10. "How do you handle mobile responsiveness?"

**Answer:**
"We use a mobile-first approach:
1. **Dynamic viewport height**: `h-dvh` instead of `h-screen` for mobile browsers
2. **Conditional rendering**: Different layouts for mobile vs desktop
3. **AnimatePresence**: Smooth transitions between conversation list and chat
4. **Bottom navigation**: Mobile uses bottom nav, desktop uses sidebar
5. **Safe area support**: `pb-[env(safe-area-inset-bottom)]` for iOS notch

The layout is essentially a stack on mobile (one screen at a time) and a split view on desktop."

---

## 🎓 Key Takeaways for Interview

### What Makes This Project Strong

1. **Modern Stack**: Next.js 15, TypeScript, Convex (shows you're up-to-date)
2. **Real-time**: Proper WebSocket implementation, not polling
3. **Type Safety**: End-to-end TypeScript
4. **Auth**: Production-ready auth with Clerk
5. **UX Details**: Typing indicators, read receipts, presence, smooth animations
6. **Scalable Design**: Proper indexes, soft deletes, deterministic IDs

### Be Ready to Discuss

- **Trade-offs**: Why Convex vs traditional backend?
- **Performance**: How would you optimize for 1000+ messages?
- **Security**: How do you prevent unauthorized access?
- **Edge cases**: What if two users create conversation simultaneously?
- **Future improvements**: Pagination, file uploads, push notifications

### Demo Tips

1. **Show real-time**: Open two browser windows, send messages
2. **Show typing indicator**: Type in one window, watch the other
3. **Show presence**: Close one tab, watch status change
4. **Show group chat**: Create a group, show sender names
5. **Show dark mode**: Toggle theme, show consistency

---

## 📚 Additional Resources

- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Your README**: Comprehensive feature list and setup

Good luck with your interview! 🚀
