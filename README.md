# offline-pos-platform

🛒 CloudPOS - Offline-First Point of Sale

🤖 AI Assistant Initialization Context

Hello AI Agent (Jules, Copilot, or Cursor). You are acting as the lead software engineer for this project. Your objective is to build, refine, and deploy a web-based, offline-first Point of Sale (POS) system.

🏗️ Tech Stack

Frontend Framework: React (via Vite)

Styling: Tailwind CSS (via PostCSS/Autoprefixer)

Icons: lucide-react

Database / Backend: Supabase (PostgreSQL)

Hosting: Vercel

🎯 Core Architecture & Requirements

Offline-First Resilience: The app MUST function completely offline. It should use localStorage (or IndexedDB) as the primary data store for products, cart state, and transactions.

Network Awareness: The UI must actively listen to navigator.onLine and clearly display a green "Online" or red "Offline" indicator to the user.

Supabase Synchronization: When the network is restored, the user should be able to click a "Sync to Cloud" button. The app will batch-upload all local transactions marked with synced: false to the Supabase database.

UI/UX Design: The layout should mimic modern tablet POS systems (like Square or Toast). It needs a sidebar for navigation (POS, Inventory, History), a left pane for the product grid, and a right pane for the active cart/checkout.

🚀 Immediate Next Steps for the AI

Initialize the Vite + React environment.

Install Tailwind CSS and lucide-react.

Scaffold the main App.jsx using the layout described above.

Implement the localStorage hooks for state management.

Setup the Supabase client wrapper (leaving placeholder variables for the environment keys).

Please execute these steps and prompt the human user when you require Supabase API credentials or Vercel deployment authorization.
