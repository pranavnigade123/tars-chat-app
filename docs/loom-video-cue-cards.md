# Loom Video Cue Cards (Memorization Version)

Use this as speaking prompts, not full reading text.

---

## Card 1 — Intro (0:00–0:20)
- I’m Pranav Nigade
- Fullstack internship submission: Tars Chat
- Stack: Next.js App Router + TypeScript + Convex + Clerk + Tailwind
- Plan: 2 min architecture, 3 min deep dive (presence + typing)

---

## Card 2 — Live Product Demo (0:20–0:45)
- Show app home/messages
- Clerk sign-in, user discovery, messaging
- Desktop layout vs mobile layout
- Mention realtime updates (messages, unread, status)
- Technical line: “This is subscription-driven UI via Convex queries.”

---

## Card 3 — How I Built It (0:45–1:25)
- Started with Next.js + TypeScript
- Added Clerk for auth + middleware route protection
- Added Convex for backend, DB, realtime
- Build order:
  1) Auth + user sync
  2) Conversations + messages
  3) Presence + typing
  4) Empty/loading/responsive polish
- Technical line: “Clerk webhook `user.created` syncs users to Convex.”
- Technical line: “Fallback sync path handles delayed webhook scenarios.”

---

## Card 4 — Structure + Data Flow (1:25–1:50)
- `app/` routes/layouts
- `components/features/` feature-based UI
- `convex/` schema + queries + mutations + cron
- `lib/hooks/` reusable business hooks
- Flow: UI action → mutation → DB write → live query update
- Technical line: “Event-driven architecture with realtime subscriptions.”

---

## Card 5 — Schema (1:50–2:00)
- `users`: profile + `lastSeen`
- `conversations`: participants + metadata
- `messages`: sender/content/time/read state/reactions
- `typingStates`: short-lived typing state
- Technical line: “Indexes like `by_clerk_id` and `by_conversation_and_time` optimize lookups.”

---

## Card 6 — Presence Feature Demo + Code (2:00–3:30)
- Demo first: online turns offline when inactive/closed
- Open `convex/presence.ts`
  - `sendHeartbeat` updates `lastSeen`
  - `markOffline` forces offline state on tab close/hide
- Open `lib/hooks/useHeartbeat.ts`
  - heartbeat every 5s
  - visibility + unload event handling
  - retry behavior for transient failures
- Open `lib/utils/presenceStatus.ts`
  - compute status from timestamp thresholds
- Key explanation:
  - timestamp-based presence > static boolean
  - naturally self-heals when heartbeats stop

---

## Card 7 — Typing Feature Demo + Code (3:30–4:50)
- Demo first: “typing…” appears then disappears quickly
- Open `convex/typingStates.ts`
  - `setTypingState` (upsert)
  - `clearTypingState`
  - `getTypingState` with timeout filtering
  - cleanup for stale records
- Open `MessageInputRedesigned.tsx`
  - debounce typing updates
  - inactivity timeout clears typing
  - clear on send
- Open `TypingIndicator.tsx`
  - subscribes realtime and renders animated indicator
- Key explanation:
  - ephemeral state model
  - debounce prevents write amplification

---

## Card 8 — Engineering Confidence Lines (use 1–2 only)
- “I handled a race condition in DM creation by retrying read after insert conflict using deterministic conversation IDs.”
- “Webhook signature verification is in place before processing Clerk events.”
- “Presence and typing are isolated from core message delivery, so they don’t regress normal chat flow.”
- “This architecture keeps UI thin and business logic centralized in Convex mutations/queries.”

---

## Card 9 — Closing (4:50–5:00)
- Separation of concerns:
  - Next.js = UI
  - Clerk = auth
  - Convex = data + realtime backend
- Features proved with code: presence + typing
- Thank recruiter and close

---

## Emergency Shortener (if interviewer cuts time)
If asked to do in ~2 mins total:
1) 20s intro + stack
2) 30s architecture + schema
3) 35s presence flow
4) 35s typing flow

---

## Practical recording tips
- Speak at ~120–140 words/min
- Pause 1 second when switching browser → code
- Keep one hand on scroll wheel, one on this cue card
- Avoid reading exact lines; use keywords only
