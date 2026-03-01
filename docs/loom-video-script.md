# 5-Minute Loom Video Script (Recruiter-Friendly)

## Goal
- First **2 minutes**: project overview (stack, setup flow, structure, schema, how pieces are linked)
- Next **3 minutes**: deep dive into **Online/Offline** and **Typing Indicator**
- Keep language simple, clear, and confident

---

## Before recording (quick prep)
- Open browser with app running and logged in
- Keep two users ready if possible (normal + incognito) for realtime demo
- In VS Code, pre-open tabs:
  - `app/(main)/messages/page.tsx`
  - `convex/schema.ts`
  - `convex/presence.ts`
  - `lib/hooks/useHeartbeat.ts`
  - `lib/utils/presenceStatus.ts`
  - `convex/typingStates.ts`
  - `components/features/messaging/MessageInputRedesigned.tsx`
  - `components/features/messaging/TypingIndicator.tsx`

---

# Full Script (with timestamps)

## 0:00 – 0:20 (Intro)
Hi, I’m Pranav Nigade. This is my Fullstack internship assignment submission.
I built a real-time chat app called **Tars Chat** using **Next.js, TypeScript, Convex, and Clerk**.
In this video, I’ll quickly show the project structure and architecture first, then I’ll deep-dive into two features: **Online/Offline presence** and **Typing Indicator**.

---

## 0:20 – 0:45 (Quick product showcase)
(Show browser)
This is the app.
Users can sign in with Clerk, search users, open conversations, and send messages in realtime.
On desktop, we have sidebar plus chat area. On mobile, list and chat are separated for better UX.
Messages, unread counts, timestamps, and status updates are all realtime through Convex.
At architecture level, this is subscription-driven UI, so data updates push automatically from Convex queries.

---

## 0:45 – 1:25 (How I started + tech setup, short)
(Show VS Code)
I started by creating a **Next.js App Router** project with **TypeScript**.
Then I integrated **Clerk** for authentication and route protection.
After that, I added **Convex** for backend logic, database, and realtime subscriptions.
When a new user signs up in Clerk, a webhook event like `user.created` is triggered, and my webhook route syncs that profile into Convex.
I also added a fallback sync path on app load, so if webhook delivery is delayed, the user still gets created in Convex.
Then I built core modules in this order:
1. Auth and user sync
2. Conversations and messages
3. Presence and typing
4. UI states like empty states, unread badges, and responsive behavior

So frontend is Next.js, auth is Clerk, and all realtime backend + DB is Convex.

---

## 1:25 – 1:50 (Project structure + linkage)
(Show folder tree)
- `app/` contains pages and layouts
- `components/features/` contains feature UI like messaging, navigation, users, presence
- `convex/` contains backend queries, mutations, schema, and cron jobs
- `lib/hooks/` contains reusable hooks like heartbeat and conversation data

The flow is: UI triggers mutation -> Convex writes data -> Convex query subscriptions update UI in realtime.
For reliability, I also handled a race condition while creating 1-on-1 conversations. If two requests create the same conversation at once, I catch and re-query by deterministic conversation ID, so duplicates are prevented.

---

## 1:50 – 2:00 (Schema in 10 seconds)
(Open `convex/schema.ts`)
Main tables are:
- `users`
- `conversations`
- `messages`
- `typingStates`

These tables are linked by ids and participant fields, so conversation, message, presence, and typing all stay connected.
I also keep indexes like `by_clerk_id` and `by_conversation_and_time` for fast lookups and ordered realtime feeds.

---

# Feature Deep Dive (3 mins)

## 2:00 – 3:30 (Feature 1: Online/Offline Presence)
(Show browser first, then code)
First, quick demo: when user is active, we show online status; when user closes tab or becomes inactive, status changes.

(Open `convex/presence.ts`)
Here I have two main mutations:
- `sendHeartbeat` updates `lastSeen`
- `markOffline` pushes `lastSeen` to older time so user appears offline

This design is timestamp-based presence, not a static boolean. That avoids stale states if a browser closes unexpectedly.

(Open `lib/hooks/useHeartbeat.ts`)
This hook runs on client side:
- Sends heartbeat every 5 seconds
- Handles tab events like `visibilitychange`, `beforeunload`, `pagehide`
- On hidden/close, marks offline
- On visible again, sends immediate heartbeat

I also included retry behavior so transient network failure does not break presence updates.

(Open `lib/utils/presenceStatus.ts`)
Presence is computed from `lastSeen` thresholds:
- Very recent -> Active now
- Slightly old -> Recently active
- Older -> Offline

Why this design is good:
- Timestamp-based presence is safer than only boolean flags
- If heartbeat stops, status naturally becomes offline
- It works well with realtime subscriptions

(Back to browser)
So as heartbeat updates in Convex, all clients automatically receive updated status without refresh.

---

## 3:30 – 4:50 (Feature 2: Typing Indicator)
(Show browser typing quickly)
Now typing indicator:
When one user types, the other user sees “typing…” with animated dots.

(Open `convex/typingStates.ts`)
Core backend parts:
- `setTypingState` upserts typing timestamp for user + conversation
- `clearTypingState` removes typing state
- `getTypingState` returns active typers for that conversation

It filters out expired typing states using timeout so stale typing is not shown.
There is also cleanup logic for old typing records.
This is basically ephemeral state modeling: short-lived write, short-lived read, automatic cleanup.

(Open `components/features/messaging/MessageInputRedesigned.tsx`)
On input change:
- I call typing update with debounce (to avoid too many writes)
- I set a short inactivity timeout
- If user stops typing or sends message, I clear typing state

So typing is accurate and does not linger.
Debouncing here helps control write amplification during fast typing.

(Open `components/features/messaging/TypingIndicator.tsx`)
This component subscribes to typing query in realtime and shows display text + animated dots.
No manual polling needed.

---

## 4:50 – 5:00 (Closing)
So overall, this app is designed with clear separation:
- Next.js for UI
- Clerk for auth
- Convex for data + realtime backend

And these two features show the realtime architecture clearly:
presence through heartbeat, and typing through short-lived typing states.
Thank you for watching.

---

## Optional one-line live code tweak (if asked in interview)
You can quickly change status dot color in presence UI component and show it live in browser, then revert.

---

## Optional technical lines you can drop naturally during demo
- “I verify Clerk webhook signatures before processing events, so user sync is secure.”
- “This app is event-driven: mutations change state, queries stream updates in realtime.”
- “For direct messages, conversation IDs are deterministic, which helps avoid duplicate threads.”
- “I used a fallback sync path for resilience in case webhook timing is delayed.”
- “Typing state is intentionally ephemeral and garbage-collected by cleanup logic.”
- “Presence is computed from `lastSeen`, which is more robust than relying only on a boolean flag.”
