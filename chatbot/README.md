# ROOTIFY AI Chatbot ("Rooty")

This folder contains the complete, self-contained implementation of the **Rooty AI Assistant** for the ROOTIFY Goan Regional Marketplace.

---

## Folder Structure

```
chatbot/
├── server/                    # Backend API and AI logic
│   ├── index.js               # Standalone Node.js HTTP server (/api/chat, /api/chat/status)
│   ├── aiService.js           # Google Gemini & OpenAI LLM callers + grounded engine
│   └── knowledge.js           # Complete Goan domain knowledge & catalog grounding
├── frontend/                  # React UI components, services & types
│   ├── ChatBot.tsx            # Floating launcher, responsive chat window & state
│   ├── ChatMessageItem.tsx    # Individual chat bubble for user and assistant
│   ├── FormattedMessage.tsx   # Markdown renderer with internal React Router links
│   ├── SuggestedPrompts.tsx   # Role-based quick prompt pills
│   ├── aiChatService.ts       # Client API communicator & localStorage persistence
│   ├── types.ts               # Chat interfaces (ChatMessage, Context, AIStatus)
│   └── index.ts               # Barrel exports for easy importing
├── vite-plugin/               # Vite dev server middleware
│   └── vite-chat-plugin.ts    # Mounts /api/chat directly inside Vite on port 5173
└── .env.example               # Configuration template for GEMINI_API_KEY
```

---

## Features
- **Floating Launcher**: Bottom-right floating trigger button (with unread ping indicator).
- **Responsive Window**: Works on desktop (floating card) and mobile (bottom-sheet drawer).
- **Domain-Grounded**: Deep knowledge of authentic Goan foods (Bebinca, Dodol, Choriz, Xacuti), Self-Help Groups (Divar Island Mahila Mandal), 12 Goa talukas, order tracking, and vendor onboarding.
- **Context-Aware**: Injects active user role, current location, cart items, and live orders.
- **Provider Support**: Google Gemini API (`gemini-3.8-flash`), OpenAI API, or built-in Goan domain knowledge fallback.
- **Zero Secret Leaks**: API keys are accessed only on the server/middleware side.

---

## Configuration

Copy `.env.example` to `.env` in `frontend/` or the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
PORT=5000
```
*(Get a free key from https://aistudio.google.com/app/apikey)*

---

## Running

1. **Development (Frontend + Embedded Chat API)**:
   ```bash
   npm run dev
   ```
2. **Standalone Backend Server**:
   ```bash
   npm run server
   # Runs on http://localhost:5000
   ```
