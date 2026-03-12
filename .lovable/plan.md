

# Plan: Make AIHomeworkHelper Collapsible

The component already uses the `ai-tutor` edge function with streaming (not a mock), so only the collapsible toggle needs to be added. No need to change the AI integration.

## Changes

### Edit: `src/components/AIHomeworkHelper.tsx`
- Add `isOpen` state (default `false`)
- Add `ChevronDown`/`ChevronUp` imports from lucide-react
- Render a large primary Button above the Card: "💬 Need help? Chat with your AI Study Buddy!" with chevron icon
- Wrap the existing Card in a conditional render with a smooth CSS transition (using framer-motion's `AnimatePresence` + `motion.div` since framer-motion is already installed)
- Toggle `isOpen` on button click

No other files need changes. The AI integration already uses the `ai-tutor` edge function with Lovable AI gateway streaming -- no mock to replace.

