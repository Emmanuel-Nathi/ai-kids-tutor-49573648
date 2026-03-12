

# Plan: Add Voice Input to AIHomeworkHelper

## Changes

### Edit: `src/components/AIHomeworkHelper.tsx`
- Import `Mic` from lucide-react
- Add `isListening` state and `recognitionRef` useRef
- Create `toggleListening` function that:
  - Instantiates `window.SpeechRecognition || window.webkitSpeechRecognition` with `lang: 'en-ZA'`, `continuous: true`, `interimResults: true`
  - On `onresult`: populate input field with transcript
  - On toggle off: stop recognition
- Add a Mic button next to Send button in the input bar
- When listening: red pulsing background (`bg-red-500 animate-pulse`) on the Mic button
- Add TypeScript declaration for `webkitSpeechRecognition` on Window

### Files
| File | Action |
|------|--------|
| `src/components/AIHomeworkHelper.tsx` | Edit — add mic button + SpeechRecognition logic |

No other files or database changes needed.

