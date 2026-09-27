# ⚡ ThumbForge AI

### AI-Powered YouTube Thumbnail Generation Platform

<p align="center">
  <strong>Turn an idea + optional headshot into high-quality YouTube thumbnail concepts using AI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/AI-Cloudflare%20Workers%20AI-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Storage-ImageKit-4B5563?style=for-the-badge" alt="ImageKit">
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" alt="Status">
</p>

---

## 🎯 Overview

**ThumbForge AI** is a full-stack AI application designed to simplify the process of creating engaging YouTube thumbnails.

Instead of manually designing every thumbnail, users can provide a topic or creative prompt and optionally upload a headshot. The platform sends the request through a secure FastAPI backend, generates thumbnail concepts using **Cloudflare Workers AI**, stores generated images through **ImageKit**, and presents the results through a responsive React interface.

The application also includes authentication, user-specific generation history, real-time generation progress, image previews, and downloads.

---

## ✨ Why ThumbForge AI?

Creating a good YouTube thumbnail often requires a combination of:

- Graphic design
- Image editing
- Typography
- Composition
- Subject positioning
- Color selection
- Iteration

ThumbForge AI focuses on reducing that manual work through an AI-assisted generation workflow.

```text
                ┌─────────────────────┐
                │   User Idea/Prompt  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Optional Headshot   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   ThumbForge AI     │
                │   Generation Flow   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Cloudflare Workers  │
                │      AI / FLUX      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Generated Thumbnail │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ ImageKit CDN/Storage│
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ React Thumbnail UI  │
                └─────────────────────┘
🚀 Key Features
Feature	Description
🤖 AI Generation	Generate thumbnail concepts using Cloudflare Workers AI
🧑 Headshot Support	Use an uploaded headshot as a visual reference
🎨 Multiple Styles	Bold Dramatic, Clean Minimal, Vibrant Energetic
🔐 Authentication	Email/password and Google OAuth through Supabase
👤 User Ownership	Users can access their own generated jobs and history
📡 Real-Time Progress	Generation updates through Server-Sent Events
🖼️ Image Hosting	Generated images are uploaded to ImageKit
👀 Preview Modal	Inspect generated thumbnails before downloading
📥 Downloads	Download generated thumbnail images
📚 History	Review previously generated thumbnails
🌓 Theme Support	Light/Dark interface
📱 Responsive UI	Designed for desktop and smaller screens
🔒 Protected APIs	Authenticated backend endpoints
⚡ Fast API	FastAPI-based asynchronous backend
🧠 Engineering Highlights

This project is more than an AI image-generation demo. It demonstrates several real-world full-stack engineering concepts.

🔐 Secure Authentication

Supabase handles:

User registration
Login
Google OAuth
Session management
Password recovery
Password reset

The frontend sends authenticated requests to the FastAPI backend using Bearer tokens.

👤 User-Specific Data Ownership

Generation jobs are associated with authenticated users.

User
 │
 ├── Job A
 │    ├── Thumbnail 1
 │    └── Thumbnail 2
 │
 └── Job B
      ├── Thumbnail 1
      └── Thumbnail 2

This prevents one authenticated user from accessing another user's generation history.

📡 Server-Sent Events

Instead of repeatedly polling the API, the frontend can receive generation progress through an SSE stream.

React
  │
  │ POST /api/jobs
  ▼
FastAPI
  │
  ├── Generate Thumbnail 1
  ├── Generate Thumbnail 2
  └── Generate Thumbnail 3
        │
        ▼
   Cloudflare AI
        │
        ▼
     ImageKit
        │
        ▼
      SSE
        │
        ▼
React UI

This allows the interface to react to generation progress in real time.

☁️ AI + CDN Architecture

The system separates AI generation from image storage.

Cloudflare Workers AI
        │
        │ Generated Image
        ▼
     ImageKit
        │
        │ CDN URL
        ▼
   React Frontend

This keeps generated image delivery separate from the application server.

🏗️ System Architecture
                              ┌──────────────────┐
                              │      User        │
                              └────────┬─────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │    React + Vite App     │
                         │                         │
                         │ • Generator UI          │
                         │ • Authentication        │
                         │ • History               │
                         │ • Preview               │
                         └────────────┬────────────┘
                                      │
                              Bearer Authentication
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      FastAPI API        │
                         │                         │
                         │ • Authentication        │
                         │ • Jobs                  │
                         │ • Generation            │
                         │ • History               │
                         │ • SSE                   │
                         └──────┬────────┬─────────┘
                                │        │
                   ┌────────────┘        └──────────────┐
                   ▼                                    ▼
        ┌─────────────────────┐              ┌─────────────────────┐
        │ Cloudflare Workers  │              │      ImageKit       │
        │        AI           │              │                     │
        │                     │              │ • Storage           │
        │ FLUX.2 Klein 4B     │              │ • CDN                │
        └──────────┬──────────┘              └──────────┬──────────┘
                   │                                    │
                   └────────────────┬───────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │     SQLite      │
                           │                 │
                           │ Jobs / Metadata │
                           └─────────────────┘

                         ┌─────────────────┐
                         │     Supabase    │
                         │                 │
                         │ Authentication  │
                         └─────────────────┘
🛠️ Tech Stack
Frontend
React
Vite
JavaScript
CSS
Supabase JavaScript Client
Backend
Python
FastAPI
SQLModel
SQLAlchemy
Uvicorn
HTTPX
Pillow
Authentication
Supabase Auth
Email/Password
Google OAuth
Session Management
Password Reset
AI
Cloudflare Workers AI
FLUX.2 Klein 4B
Image Infrastructure
ImageKit
CDN-based image delivery
Database
SQLite
SQLModel
Development
Git
GitHub
npm
Python Virtual Environment
PowerShell
📂 Project Structure
thumbnail-generator/
│
├── backend/
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── cloudflare_service.py
│   │   ├── generator.py
│   │   ├── imagekit_service.py
│   │   └── routes.py
│   │
│   ├── .env.example
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── supabaseClient.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
🔄 Application Workflow
1. Authentication
User
 ↓
Supabase
 ↓
Authenticated Session
2. Thumbnail Request
Prompt
 +
Optional Headshot
 +
Selected Styles
       │
       ▼
   FastAPI
3. AI Generation
FastAPI
   │
   ▼
Cloudflare Workers AI
   │
   ▼
Generated Image
4. Image Storage
Generated Image
       │
       ▼
    ImageKit
       │
       ▼
    CDN URL
5. Result
ImageKit URL
     │
     ▼
React Gallery
     │
 ┌───┴────┐
 ▼        ▼
Preview  Download
🔑 Authentication Flow
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Supabase  │
│    Auth     │
└──────┬──────┘
       │
       │ Access Token
       ▼
┌─────────────┐
│   React     │
└──────┬──────┘
       │
       │ Authorization: Bearer <token>
       ▼
┌─────────────┐
│   FastAPI   │
└──────┬──────┘
       │
       ▼
Authenticated API Access
📡 API Overview
Method	Endpoint	Purpose	Auth
GET	/api/health	API health check	Public
POST	/api/upload-headshot	Upload headshot	Required
POST	/api/jobs	Create generation job	Required
GET	/api/jobs/{job_id}	Get job details	Required
GET	/api/jobs/{job_id}/stream	Stream generation progress	Required
GET	/api/history	Get user generation history	Required

Interactive API documentation is available through FastAPI's Swagger UI:

/api/docs
⚙️ Local Development
Prerequisites

Install:

Python 3.11+
Node.js 18+
npm
Git

You also need credentials for:

Supabase
Cloudflare Workers AI
ImageKit
1. Clone the Repository
git clone https://github.com/guptarg09/thumbnail-generator.git
cd thumbnail-generator
2. Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Create:

backend/.env

using:

backend/.env.example

Configure:

CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_AI_MODEL=@cf/black-forest-labs/flux-2-klein-4b

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

DATABASE_URL=sqlite:///./thumbnailbuilder.db

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

Start the API:

python -m uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs
3. Frontend Setup

Open another terminal:

cd frontend
npm install

Create:

frontend/.env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key

Start the frontend:

npm run dev

Open:

http://localhost:5173
🧪 Production Build

Before deployment, verify the frontend:

npm run build

Verify the backend:

cd ../backend
python -c "from main import app; print('Backend import: OK')"
🔒 Security

ThumbForge AI follows several security practices:

🔐 Secrets are stored in environment variables
🚫 .env files are excluded from Git
🚫 Database files are excluded from Git
🔑 Protected API routes require authentication
👤 Jobs are associated with authenticated users
🛡️ Backend validates authenticated requests
🔒 Supabase manages authentication sessions
🌐 Frontend never receives backend private credentials

Never commit API keys, access tokens, private keys, or production .env files.

📈 Scalability Considerations

The current architecture separates major responsibilities:

Frontend
   │
   ▼
API Layer
   │
   ├──────────────► Authentication
   │
   ├──────────────► AI Generation
   │
   ├──────────────► Image Storage
   │
   └──────────────► Database

This makes individual components easier to replace or scale.

For example, the AI provider can be changed without redesigning the entire frontend.

Potential production improvements include:

PostgreSQL instead of SQLite
Background job queues
Redis-based job tracking
Horizontal backend scaling
CDN caching
Generation rate limiting
Usage quotas
AI generation retries
Observability and logging
Automated CI/CD
🧩 Design Decisions
Why FastAPI?

FastAPI provides:

Async request handling
Automatic API documentation
Pydantic validation
Simple dependency injection
Strong Python ecosystem support
Why Supabase?

Supabase provides authentication infrastructure without requiring the application to implement password handling and session management from scratch.

Why ImageKit?

ImageKit separates image storage and delivery from the application backend while providing CDN-based image delivery and transformations.

Why Cloudflare Workers AI?

The architecture keeps AI inference outside the application server, allowing the backend to orchestrate generation without hosting the model itself.

🗺️ Roadmap
Current
 AI thumbnail generation
 Headshot support
 Multiple visual styles
 Supabase authentication
 Google OAuth
 User-specific history
 ImageKit integration
 Real-time generation progress
 Thumbnail preview
 Downloads
 Production frontend build
 Repository cleanup
Planned
 PostgreSQL production database
 Background generation queue
 More thumbnail styles
 Advanced layout controls
 Typography controls
 Batch generation
 Usage limits
 Analytics
 Generation caching
 Automated tests
 CI/CD pipeline
 Production monitoring
📊 Project Status
Frontend       ████████████████████  Complete
Backend        ████████████████████  Complete
Authentication ████████████████████  Complete
AI Generation  ████████████████████  Complete
Image Storage  ████████████████████  Complete
History        ████████████████████  Complete
Deployment     ████████████░░░░░░░░  In Progress
👨‍💻 Author
Ritesh Gupta

Full-Stack Developer interested in:

System Design
Backend Engineering
AI Applications
Distributed Systems
Modern Web Development
Links
GitHub: https://github.com/guptarg09
Project Repository: https://github.com/guptarg09/thumbnail-generator
⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.