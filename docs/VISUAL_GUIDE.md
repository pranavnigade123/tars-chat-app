# 🎨 Visual Architecture Guide

## 🏗️ System Overview

```
USER BROWSER
├── Clerk Auth (JWT tokens)
├── Next.js Frontend (React components)
└── Convex Client (WebSocket connection)
         │
         ▼
CLOUD SERVICES
├── Clerk (Authentication)
└── Convex (Real-time Backend + Database)
```

## 💬 Message Flow

```
User types → sendMessage() → Convex validates → DB insert
                                                    ↓
                                            WebSocket push
                                                    ↓
                                    All clients receive update
                                                    ↓
                                            React re-renders
```

## 🔐 Auth Flow

```
1. User signs in → Clerk UI
2. Clerk webhook → Sync to Convex DB
3. JWT token → Stored in browser
4. Every request → Convex validates JWT
```

## 👥 Presence System

```
Every 30s: sendHeartbeat() → Update lastSeen timestamp
                                      ↓
                              Compute status:
                              • < 10s = "Active now"
                              • < 5min = "Recently active"
                              • Older = "Offline"
```

## ⌨️ Typing Indicator

```
User types → Debounced (300ms) → setTypingState()
                                        ↓
                                  Update lastTypingAt
                                        ↓
                              Other users see indicator
                                        ↓
                              Auto-clear after 3s
```

## 📖 Read Receipts

```
Message visible (50%) → IntersectionObserver detects
                                ↓
                        markMessageAsRead()
                                ↓
                        Add user to readBy[]
                                ↓
                        Sender sees ✓✓
```

## 🗄️ Database Tables

```
USERS
├── clerkId (indexed)
├── name, email, profileImage
└── lastSeen (for presence)

CONVERSATIONS
├── conversationId (indexed)
├── participants[] (array of clerkIds)
├── isGroup, groupName
└── lastMessageAt

MESSAGES
├── conversationId (indexed)
├── senderId, content, sentAt
├── isDeleted (soft delete)
├── readBy[] (read receipts)
└── reactions[] (emoji reactions)

TYPING_STATES
├── userId, conversationId
└── lastTypingAt (auto-cleanup)
```

## 🔄 Component Tree

```
ClerkProvider
└── ConvexProviderWithClerk
    └── ThemeProvider
        └── HeartbeatProvider
            └── App
                ├── Messages Page
                │   ├── ConversationList
                │   └── MessageList
                ├── Users Page
                └── Profile Page
```

## 🚀 Real-time Updates

```
Convex uses WebSocket subscriptions:

useQuery(api.messages.getMessages)
    ↓
Opens WebSocket connection
    ↓
When data changes → Automatic push
    ↓
React hook receives update
    ↓
Component re-renders
```

## 🎯 Key Patterns

**Data Flow:**
```
User Action → Mutation → DB → Subscription → All Clients
```

**Auth:**
```
Clerk JWT → Convex Validation → Authorized Action
```

**State Management:**
```
Convex (Source of Truth) → React Hooks → Components
(No Redux, No Context API for server data)
```

---

## 📝 Quick Reference

- **4 tables:** users, conversations, messages, typingStates
- **Heartbeat:** Every 30 seconds
- **Typing timeout:** 3 seconds
- **Active threshold:** 10 seconds
- **Read threshold:** 50% visible
- **Debounce:** 300ms for typing/search

---

Good luck! 🚀
