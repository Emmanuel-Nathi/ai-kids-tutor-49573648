

# Plan: AIHomeworkHelper Component + Account Tab Verification

## Current State
- **SubscriptionManager** already exists and is integrated into the Parent Dashboard "Account" tab — no changes needed there.
- **ChildChat page** (`src/pages/ChildChat.tsx`) already handles AI tutoring via the `ai-tutor` edge function with streaming. It works as a full-page chat.
- The user wants a **separate, embeddable `AIHomeworkHelper` component** styled with kid-friendly UI (blue bot messages, green user messages, Bot icon, typing indicator).

## What to Build

### 1. Create `src/components/AIHomeworkHelper.tsx`
A self-contained chat component that can be embedded in the Child Dashboard:
- **Card** wrapper with a friendly header ("Ask Owl for Help 🦉")
- **ScrollArea** for message history (auto-scroll on new messages)
- Bot messages: soft blue background (`bg-blue-50`), `Bot` lucide icon on left, rounded corners
- Child messages: soft green background (`bg-green-50`), aligned right
- Sticky input bar at bottom with `Input` + `Send` button (rounded-full)
- "Typing..." indicator with animated dots when streaming
- Large text (`text-base`) and `rounded-2xl` corners for kid-friendly feel
- Props: `childId: string` — fetches child grade/curriculum, connects to `ai-tutor` edge function with SSE streaming
- Reuses the same streaming pattern from `ChildChat.tsx`
- ReactMarkdown for assistant messages

### 2. Add AIHomeworkHelper to ChildHome
**Edit: `src/pages/ChildHome.tsx`**
- Add a collapsible section or a card below the subject grid: "Need help? Chat with Owl!"
- Clicking it expands the `AIHomeworkHelper` inline, or navigates to a dedicated route
- Since ChildChat already exists as a full page, the cleaner approach is to add a prominent "Chat with Owl" button that creates a session and navigates to `/child/:childId/chat?subject=general`

**Decision**: Since `ChildChat.tsx` already has full streaming + session tracking, the `AIHomeworkHelper` component will be a **lightweight inline version** embedded directly in `ChildHome` — no session creation, just quick Q&A using the ai-tutor function. Messages are not persisted.

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/AIHomeworkHelper.tsx` | Create — inline chat component with kid-friendly styling |
| `src/pages/ChildHome.tsx` | Add AIHomeworkHelper below the subject grid |

No database changes needed. Uses existing `ai-tutor` edge function.

