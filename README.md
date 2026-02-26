# 💬 Tars Chat

> **Tars Full Stack Engineer Internship Coding Challenge 2026**  
> A real-time messaging web application built with Next.js, TypeScript, Convex, and Clerk

![Status](https://img.shields.io/badge/status-complete-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Convex](https://img.shields.io/badge/Convex-Real--time-orange.svg)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple.svg)

---


## 🌟 What is Tars Chat?

Tars Chat is a full-featured real-time messaging platform where users can sign up, discover other users, and engage in instant one-on-one conversations. The application demonstrates modern web development practices with real-time capabilities, responsive design, and polished user experience.

---

## ✅ Implemented Features

### Core Requirements (1-10) - All Completed ✅

#### 1. Authentication ✅
- Clerk integration for signup/login (email & social)
- User profile display with name and avatar
- Automatic user sync to Convex database
- Secure logout functionality

#### 2. User List & Search ✅
- Display all registered users (excluding current user)
- Real-time search with instant filtering
- Click to start conversation

#### 3. One-on-One Direct Messages ✅
- Private conversations between two users
- Real-time message delivery using Convex subscriptions
- Conversation sidebar with latest message preview
- Message grouping for better readability

#### 4. Message Timestamps ✅
- Smart timestamp formatting:
  - Today: Time only (2:34 PM)
  - This year: Date + time (Feb 15, 2:34 PM)
  - Different year: Full date (Feb 15, 2024, 2:34 PM)

#### 5. Empty States ✅
- No conversations yet
- No messages in conversation
- No search results found
- All with helpful, engaging messages and CTAs

#### 6. Responsive Layout ✅
- Desktop: Sidebar + chat area layout
- Mobile: Full-screen conversation list, tap to open chat
- Back button navigation on mobile
- Bottom navigation bar (mobile)
- Vertical sidebar navigation (desktop)
- Safe area support for iOS devices

#### 7. Online/Offline Status ✅
- Real-time presence indicators
- Green dot for online users
- Status text (Active now, Recently active, Offline)
- Automatic status updates via heartbeat system

#### 8. Typing Indicator ✅
- "User is typing..." text display
- Appears when user types
- Disappears after 3 seconds of inactivity
- Clears immediately on message send

#### 9. Unread Message Count ✅
- Badge showing unread count per conversation
- Real-time updates
- Clears when conversation is opened
- Uses IntersectionObserver for accurate tracking

#### 10. Smart Auto-Scroll ✅
- Automatically scrolls to latest message
- Detects when user scrolls up
- Shows "New Messages" button instead of forcing scroll
- Smooth scroll animations

### Optional Features (11-15) - Implemented ✅

#### 11. Delete Own Messages ✅
- Long-press (mobile) or right-click (desktop) to open context menu
- Delete option for own messages
- Soft delete with "This message was deleted" placeholder
- Bulk delete mode with multi-select
- Confirmation dialog before deletion

#### 12. Message Reactions ✅
- Quick reactions via context menu (👍 ❤️ 😂 😮 😢)
- Toggle reactions on/off
- Reaction count display
- Visual indication of user's own reactions
- Dark theme support

#### 13. Loading & Error States ✅
- Skeleton loaders throughout the app
- Error messages with retry options
- Graceful error handling
- Network failure recovery
- Delayed skeleton display (400ms) for better UX

#### 14. Group Chat ✅
- Create groups with multiple users (minimum 2)
- 2-step creation flow (select members → name group)
- Group name and member count display
- Sender avatars and names in group messages (WhatsApp-style)
- Blue gradient avatars for groups
- Search and filter users when creating groups

#### 15. Dark Mode ✅
- Full dark theme implementation
- Theme toggle in navigation (desktop sidebar, mobile headers)
- Persistent theme preference (localStorage)
- Consistent color palette:
  - Main backgrounds: `#1a1a1a`
  - Headers/navigation: `#1e1e1e`
  - Cards/modals: `#242424`
  - Message bubbles: `#2a2a2a`
  - Borders: `#2d2d2d`
- Smooth transitions between themes
- Dark theme for Clerk auth pages

---

## 🛠️ Tech Stack (As Required)

### Frontend
- **Next.js 15+** - App Router with React Server Components
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
  - Dialog, AlertDialog, Button, Input, Badge
  - Label, ScrollArea, Avatar, Skeleton
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Icon library

### Backend & Database
- **Convex** - Real-time backend and database
  - Real-time subscriptions
  - Serverless functions
  - Automatic schema management

### Authentication
- **Clerk** - User authentication and management
  - Email & social login
  - User profile management
  - Webhook integration for user sync

### Deployment
- **Vercel** - Frontend hosting (ready to deploy)
- **Convex Cloud** - Backend hosting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Accounts on:
  - [Clerk](https://clerk.com) (free tier)
  - [Convex](https://convex.dev) (free tier)

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/pranavnigade123/tars-chat-app.git
cd tars-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Clerk**
   - Create a new application on Clerk
   - Enable email and social login providers
   - Copy your API keys

4. **Set up Convex**
   - Create a new project on Convex
   - Run `npx convex dev` to initialize
   - Copy your deployment URL

5. **Configure environment variables**

Create a `.env.local` file:
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Clerk Webhook (optional, for production)
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

6. **Run the development server**
```bash
npm run dev
```

7. **Open the app**

Navigate to `http://localhost:3000`

### Setting Up Clerk Webhook (Optional)

For production, configure a webhook in Clerk dashboard:
- Endpoint: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Add the webhook secret to your environment variables

---

## 🎯 How to Use

1. **Sign Up** - Create an account using email or social login
2. **Browse Users** - See all registered users in the "People" tab
3. **Search** - Use the search bar to find specific users
4. **Start Chatting** - Click on any user to open a conversation
5. **Create Groups** - Click the group icon to create a group chat with multiple users
6. **Send Messages** - Type and send messages in real-time
7. **React to Messages** - Long-press (mobile) or right-click (desktop) to add reactions
8. **Delete Messages** - Use context menu to delete your own messages
9. **Toggle Theme** - Switch between light and dark mode
10. **Stay Updated** - See online status, typing indicators, and unread counts

---

## 🏗️ Project Architecture

### Database Schema (Convex)

**users**
- User profiles synced from Clerk
- Online status tracking
- Last seen timestamps

**conversations**
- One-on-one and group conversation records
- Participant tracking
- Deterministic conversation IDs
- Group metadata (name, member count, creator)

**messages**
- Message content and metadata
- Read receipts tracking (readBy array)
- Soft delete support (isDeleted flag)
- Reaction support (emoji + userId)

**typingStates**
- Real-time typing indicators
- Auto-cleanup of stale states

### Key Features Implementation

**Real-time Updates**
- Convex subscriptions for live data
- Automatic re-rendering on changes
- Optimistic updates for better UX

**Presence System**
- Heartbeat mechanism (30-second intervals)
- Automatic offline detection
- Page visibility API integration

**Message Read Tracking**
- IntersectionObserver for viewport detection
- Bulk mark-as-read on conversation open
- Real-time unread count updates

**Responsive Design**
- Mobile-first approach
- Dynamic viewport height (dvh)
- Safe area support for iOS
- Conditional rendering for mobile/desktop

---

## 🎥 Video Presentation

**[Link to Loom Video]** _(To be added)_



## 📊 Feature Completion Status

| Requirement | Status | Notes |
|------------|--------|-------|
| 1. Authentication | ✅ Complete | Clerk integration with user sync |
| 2. User List & Search | ✅ Complete | Real-time filtering |
| 3. Direct Messages | ✅ Complete | Real-time with subscriptions |
| 4. Message Timestamps | ✅ Complete | Smart formatting |
| 5. Empty States | ✅ Complete | All scenarios covered |
| 6. Responsive Layout | ✅ Complete | Mobile & desktop optimized |
| 7. Online/Offline Status | ✅ Complete | Real-time presence |
| 8. Typing Indicator | ✅ Complete | With auto-clear |
| 9. Unread Count | ✅ Complete | Real-time badges |
| 10. Smart Auto-Scroll | ✅ Complete | With new message button |
| 11. Delete Messages | ✅ Complete | Context menu + bulk delete |
| 12. Message Reactions | ✅ Complete | 5 emoji reactions |
| 13. Loading & Error States | ✅ Complete | Throughout app |
| 14. Group Chat | ✅ Complete | Multi-user groups with names |
| 15. Dark Mode | ✅ Complete | Full theme support |

**Completion Rate: 10/10 core features + 5/5 optional = 100%**

---


## 🔒 Security & Best Practices

- ✅ All API routes protected with authentication
- ✅ Conversation membership validation
- ✅ No hardcoded secrets (environment variables)
- ✅ Type-safe with TypeScript
- ✅ Input validation and sanitization
- ✅ Secure webhook signature verification
- ✅ Environment variables in .gitignore

---


### Key Technical Decisions

### Potential Enhancements
- Message editing functionality
- File/image attachments
- Push notifications
- Message search
- Voice/video calling
- Read receipts for group chats
- Group admin controls
- User blocking/reporting
- Message forwarding
- Link previews

---

## 👨‍💻 About Me

**Pranav Nigade**

- Portfolio: [pranavnigade.me](https://pranavnigade.me)
- GitHub: [@pranavnigade123](https://github.com/pranavnigade123)
- Project Repository: [tars-chat-app](https://github.com/pranavnigade123/tars-chat-app)

This project was built as part of the **Tars Full Stack Engineer Internship Coding Challenge 2026**.

---



## 📞 Questions?

If you have any questions about the implementation or want to discuss any technical decisions, feel free to:
- Open an issue on GitHub
- Review the code and leave comments
- Contact me through GitHub

---