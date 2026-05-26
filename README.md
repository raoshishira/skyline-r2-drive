# 🌌 Skyline R2 Drive

[![GitHub stars](https://img.shields.io/github/stars/raoshishira/skyline-r2-drive?style=social)](https://github.com/raoshishira/skyline-r2-drive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Skyline R2 Drive** is a secure, high-performance, localhost-based file manager for Cloudflare R2. It provides a familiar "Google Drive-like" interface for your R2 buckets while keeping your API keys and data strictly under your local control.

> [!TIP]
> **Enjoying the project?** Give it a ⭐ on GitHub to show your support!

## 🚀 Features

- 📂 **Multi-Bucket Management**: Switch between all your R2 buckets instantly.
- ⚙️ **In-App Configuration**: Manage your R2 credentials directly through the UI—no manual `.env` editing required.
- 📁 **Virtual File System**: Navigate prefixes as if they were real directories.
- ⚡ **High-Speed Uploads**:
  - Drag & drop support.
  - Multipart uploads for large files.
  - Relative path preservation for folder uploads.
- 📦 **Flexible Downloads**:
  - Stream single files directly to your machine.
  - Recursive folder downloads: Auto-zips entire directories on-the-fly.
- 🔒 **Security First**:
  - **Local-Only Design**: Built specifically to run on `localhost`.
  - **Backend-Only Storage**: R2 credentials are saved to a local `.env` file. While they pass through the browser during initial configuration, they are never stored in LocalStorage or used for client-side SDK calls.
  - **Password Protection**: Local login required to access the dashboard.
  - **Security Headers**: Powered by Helmet.js and CSRF protection.
- ?? **Modern UI/UX**:
  - Built with Tailwind CSS and Shadcn/UI patterns.
  - Responsive design with smooth transitions.
  - Loading states and real-time UI updates via React Query.

## ?? Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand (State), React Query (Data Fetching), Lucide React (Icons).
- **Backend**: Node.js, Express, AWS SDK v3 (S3 Client for R2), Multer (Uploads), Archiver (Zipping).

## ?? Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher.
- A Cloudflare account with R2 enabled.
- [R2 API Tokens](https://dash.cloudflare.com/?to=/:account/r2/api-tokens) (with Edit permissions).

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/local-r2-drive.git

# Navigate to the project
cd local-r2-drive

# Install all dependencies (Frontend & Backend)
npm run install:all
```

### 3. Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and provide your Cloudflare details:
   - `R2_ENDPOINT`: Your S3 API endpoint (e.g., `https://<id>.r2.cloudflarestorage.com`).
   - `R2_ACCESS_KEY_ID`: Your R2 Token Access Key.
   - `R2_SECRET_ACCESS_KEY`: Your R2 Token Secret Key.
   - `APP_PASSWORD`: Set a password for local access.

### 4. Run Development Server
```bash
npm run dev
```
1. Access the application at [http://localhost:5173](http://localhost:5173).
2. Follow the on-screen instructions to set your local password for the first time.

## ?? Architecture

The project is structured as a **Monorepo** for simplicity and ease of development:

```text
local-r2-drive/
+-- frontend/          # React + Vite application
�   +-- src/api/       # Axios client & Query hooks
�   +-- src/store/     # Zustand global state
+-- backend/           # Node.js + Express server
�   +-- src/services/  # R2/S3 Integration logic
�   +-- src/controllers/# API Request handlers
+-- .env               # Shared configuration (Git ignored)
```

## ?? Security Best Practices

- **Never** host this application on a public-facing IP address without adding robust Authentication (like OAuth2) and Rate Limiting.
- The `APP_PASSWORD` is a simple layer of protection for local environments. Use a strong, unique password.
- Regularly rotate your Cloudflare API tokens.

## ?? Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## ?? License

Distributed under the MIT License. See `LICENSE` for more information.

