# NexAI - Full-Stack AI SaaS Portal

NexAI is a premium, full-stack AI-powered SaaS platform offering suite-based generative tools designed to boost productivity. The application features a clean, responsive frontend dashboard integrated with a high-performance Express server and Gemini's state-of-the-art Generative AI models.

## Core Features

*   **💬 AI Chat**: Seamless conversation experience featuring rich, real-time response streaming.
*   **📄 PDF Analyzer**: Upload PDF files to instantly generate comprehensive summaries, extract key bullet points, and ask custom contextual questions about the document.
*   **📝 Resume Generator**: Generates professional, ATS-friendly resumes/CVs in JSON format based on personalized descriptions.
*   **📊 Presentation Generator**: Creates structured presentation slide decks (including title, bullet points, and speaker notes) in structured JSON format.
*   **🎨 Dynamic Image Generator**: Integration for creating high-quality images based on text prompts.

---

## Technology Stack

### Backend
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **AI Integration**: `@google/generative-ai` (Gemini SDK configured to utilize `gemini-2.5-flash` model for high-efficiency, multi-modal outputs)
*   **Uploads**: Multer for handling multi-part PDF file uploads

### Frontend
*   **Framework**: React (Vite-powered environment)
*   **Routing**: TanStack Router / TanStack Start
*   **Styling**: Tailwind CSS for responsive layouts
*   **Authentication & State**: Supabase client connection integration

---

## Directory Structure

```text
NexAI/
├── backend/
│   ├── config/            # DB configuration & connections
│   ├── controllers/       # Controller logic for endpoints (Chat, PDF, Resume, etc.)
│   ├── middleware/        # Authentication & global middleware layers
│   ├── models/            # Mongoose Schemas (User, Chat, Document, Resume, AIUsage)
│   ├── routes/            # Express endpoint route mapping
│   ├── services/          # Shared Gemini AI integration layer
│   ├── utils/             # Helper scripts & database seeders
│   ├── server.js          # Main entry file
│   └── .env               # Server environment configuration
└── frontend/
    ├── src/               # React components, routes, hooks, & styles
    ├── public/            # Static assets
    ├── vite.config.js     # Dev server & reverse proxy configurations
    └── .env               # Frontend environment configuration
```

---

## Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB installed and running locally (or MongoDB Atlas URI)

### 1. Setup Backend
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables by checking or updating `.env`:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/nexai
    JWT_SECRET=your_jwt_encryption_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  Start the backend development server:
    ```bash
    npm run dev
    ```

### 2. Setup Frontend
1.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure `.env` contains the required authentication parameters (e.g. Supabase keys).
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
5.  Access the web interface at `http://localhost:5173` (requests to `/api` are automatically proxied to the backend server at `http://localhost:5000`).

---

## AI Services Layer Audit Notes

The backend has been audited and updated to ensure robust integration with the Gemini API:
*   All endpoints query Gemini models via a unified service layer in `backend/services/gemini.js`.
*   All routines utilize the high-speed and modern `gemini-2.5-flash` model, ensuring compatibility with the latest API keys on the `v1beta` endpoint.
