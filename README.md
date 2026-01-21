<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BrickAI

BrickAI is a modern web application that blends high-performance production management tools with a retro-futuristic "Liquidglass" aesthetic. It features a fully functional, stylized "Brick Game" (Tetris clone) alongside robust editorial tools for film and media production.

## ✨ Key Features

### 🎮 The Brick Game
A reimagined classic puzzle game featuring a "Liquidglass" visual style.
- **Visuals**: Deep blacks, reflective surfaces, and a smooth, breathing "Monolith" light pulse.
- **Mechanics**: Full scoring system (soft/hard drops, line clears), mobile-optimized controls, and real-time HUD.
- **Design**: Responsive layout that maintains the project's "soul" across devices.

### 🎬 Production Management
Integrated tools for media production workflows:
- **Shotlists & Storyboards**: Orchestrate scenes with drag-and-drop ease.
- **Budgeting**: Detailed tracking for production finances, including "Keeta" budget templates.
- **Data Import/Export**: Support for CSV import/export to bridge the gap between spreadsheets and the web.

### 🌍 Internationalization
Full multi-language support:
- **Languages**: English (EN) and Portuguese (PT).
- **Translation Management**: Centralized `CONTENT_EN.json` and `CONTENT_PT.json` files for easy updates.
- **Formatting**: Auto-detection and localized formatting for dates and currencies.

### 🎨 Monolith / Liquidglass UI
A premium design system focused on:
- **Symmetry**: Perfectly aligned layouts and center-weighted content.
- **Aesthetics**: Glassmorphism, dynamic animations, and high-contrast dark modes.
- **Experience**: Micro-interactions and focus on a "premium" feel.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: TailwindCSS, Custom CSS ("Liquidglass" effects)
- **Backend**: Node.js (Express-lite server for proxies/API)
- **I18n**: i18next

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gpanazio/BrickAI.git
   cd BrickAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory (copy from `.env.example` if available) and add necessary keys:
   ```env
   GEMINI_API_KEY=your_key_here
   # Add other environment variables as needed
   ```

### Running the App

To run the complete application (Frontend + Backend proxy):

1. **Start the Frontend (Vite)**
   ```bash
   npm run dev
   ```

2. **Start the Backend Server** (if required for API features)
   ```bash
   node server.js
   ```

Access the app at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

- **/src**: React frontend application code.
- **/dist**: Production build artifacts.
- **server.js**: Node.js server for backend logic.
- **CONTENT_*.json**: Master translation files used to seed the app content.
