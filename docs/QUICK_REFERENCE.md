# 🚀 Quick Reference Cheat Sheet

## 📊 Tech Stack (One-Liner)
**Frontend:** Next.js 15 + TypeScript + Tailwind + Clerk Auth  
**Backend:** Convex (real-time DB + serverless functions)  
**Why:** Real-time by default, type-safe, no server management

---

## 🗄️ Database Tables (4 Tables)

### 1. users
- `clerkId`, `name`, `email`, `profileImage`, `lastSeen`, `isOnline`
- **Purpose:** User profiles synced from Clerk

### 2. conversations
- `conversationId`, `participants[]`, `isGroup`, `groupName`, `lastMessageAt`
- **Purpose:** Chat rooms (1-on-1 or group)
- **Key:** Deterministic ID for 1-on-1: `userId1_userId2` (sorted)

### 3. messages
- `conversationId`, `senderId`, `content`, `sentAt`, `isDeleted`, `readBy[]`, `reactions[]`
- **Purpose:** Chat messages with read receipts and reactions

### 4. typingStates
- `userId`, `conversationId`, `lastTypingAt`
- **Purpose:** Real-time typing indicators (auto-cleanup after 5 min)

---

## 🔐 Auth Flow (4 Steps)

1. **User signs in** → Clerk UI
2. **Clerk webhook** → `/api/webhooks/clerk` → Sync to Convex
3. **JWT token** → Stored in browser
4. **Every request** → Convex validates JWT

**Route Protection:** Clerk middleware redirects unauthenticated users

---

## 💬 Real-time Messaging (How It Works)

```
User A types → sendMessage mutation → Convex DB updated
                                    ↓
                            WebSocket push to all clients
                                    ↓
User B's useQuery hook → React re-renders → Message appears
```

**Key:** Convex subscriptions (WebSocket) + React hooks = automatic updates

---

## 🎯 Key Features (Quick Explanations)

### 1. Presence System
- **Heartbeat every 30s** → Updates `lastSeen` timestamp
- **Status computed from timestamp:**
  - < 10s ago = "Active now" (green)
  - < 5 min ago = "Recently active"
  - Older = "Offline"

### 2. Typing Indicator
- **On type** → Debounced mutation (300ms) → Update `lastTypingAt`
- **Display** → Query states < 3s old (exclude self)
- **On send** → Clear typing state immediately

### 3. Unread Count
- **Track:** `readBy[]` array in each message
- **Mark read:** IntersectionObserver (50% visible) → Add user to `readBy[]`
- **Count:** Messages where current user NOT in `readBy[]` and not sender

### 4. Smart Auto-Scroll
- **Near bottom?** → Auto-scroll to new messages
- **Scrolled up?** → Show "New Messages" button (don't force scroll)

### 5. Group Chat
- **ID:** `group_${timestamp}_${random}`
- **Display:** Show sender avatar + name for each message
- **Members:** Query participants array

### 6. Message Reactions
- **One reaction per user** → Array of `{emoji, userId}`
- **Toggle:** Same emoji = remove, different emoji = replace

### 7. Dark Mode
- **Storage:** localStorage
- **Apply:** Toggle `dark` class on `<html>`
- **CSS:** Tailwind dark mode variants

---

## 🔥 Common Interview Questions (Quick Answers)

### "How does real-time work?"
Convex WebSocket subscriptions. `useQuery` hook auto-updates when data changes.

### "How prevent duplicate conversations?"
Deterministic ID: sort user IDs → `userId1_userId2`. Query before creating.

### "How does presence work?"
Heartbeat every 30s updates `lastSeen`. Status computed from timestamp age.

### "How track read receipts?"
`readBy[]` array. IntersectionObserver detects visibility → add user to array.

### "Why Convex over REST API?"
Real-time by default, type-safe, serverless, no WebSocket setup needed.

### "How handle auth?"
Clerk provides JWT → Convex validates on every request. Webhook syncs users.

### "How typing indicator work?"
Debounced mutation updates timestamp. Query states < 3s old. Auto-cleanup via cron.

### "How handle deleted messages?"
Soft delete: `isDeleted: true`. Show placeholder. Preserves conversation flow.

### "How is schema scalable?"
Indexes on frequent queries, denormalized participants, pagination-ready, separate typing states.

### "How handle mobile?"
Mobile-first: `h-dvh`, conditional rendering, AnimatePresence, bottom nav, safe area support.

---

## 📁 File Structure (Key Files)

```
app/
├── (auth)/                    # Auth pages (sign-in, sign-up)
├── (main)/messages/page.tsx   # Main chat UI
├── api/webhooks/clerk/        # User sync webhook
└── layout.tsx                 # Root layout with providers

components/
├── features/messaging/        # Chat components
├── features/navigation/       # Headers, nav bars
├── providers/                 # Context providers
└── ui/                        # shadcn components

convex/
├── schema.ts                  # Database schema
├── messages.ts                # Message queries/mutations
├── conversations.ts           # Conversation logic
├── users.ts                   # User management
├── presence.ts                # Heartbeat system
└── typingStates.ts            # Typing indicators

lib/
├── hooks/                     # Custom React hooks
└── utils/                     # Helper functions
```

---

## 🎬 Demo Script (30 seconds)

1. **Open two browsers** → Sign in as different users
2. **Send message** → Show real-time sync
3. **Type in one** → Show typing indicator in other
4. **Create group** → Show multi-user chat
5. **Toggle dark mode** → Show theme consistency
6. **Close one tab** → Show presence change to "Offline"

---

## 💡 Pro Tips for Interview

### What to Emphasize
✅ Real-time architecture (WebSocket)  
✅ Type safety (TypeScript end-to-end)  
✅ Modern stack (Next.js 15, Convex)  
✅ UX details (typing, presence, read receipts)  
✅ Scalable design (indexes, soft deletes)

### What to Avoid
❌ Don't say "I just followed a tutorial"  
❌ Don't claim you built everything from scratch  
❌ Don't ignore trade-offs (every choice has pros/cons)

### If Asked "What Would You Improve?"
- Add pagination for messages (currently loads all)
- Implement file/image uploads
- Add push notifications
- Implement message search
- Add message editing
- Optimize bundle size

---

## 🧠 Mental Model

Think of the app as **3 layers:**

1. **UI Layer** (React components)
   - Displays data
   - Handles user input
   - Triggers mutations

2. **Data Layer** (Convex)
   - Stores data
   - Validates requests
   - Pushes updates

3. **Auth Layer** (Clerk)
   - Manages users
   - Provides JWT
   - Syncs via webhook

**Data flows:** UI → Mutation → DB → Subscription → UI (all clients)

---

## 📝 Key Metrics

- **4 database tables** (users, conversations, messages, typingStates)
- **15 features** (10 core + 5 optional)
- **30-second heartbeat** (presence system)
- **3-second timeout** (typing indicator)
- **50% visibility** (read receipt threshold)
- **10-second threshold** ("Active now" status)

---

## 🎯 One-Sentence Summary

"A real-time chat app built with Next.js and Convex that demonstrates modern web development practices including WebSocket-based messaging, presence tracking, and type-safe full-stack development."

---

Good luck! You've got this! 💪
