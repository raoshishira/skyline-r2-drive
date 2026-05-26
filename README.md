# 🌌 Skyline R2 Drive

[![GitHub stars](https://img.shields.io/github/stars/raoshishira/skyline-r2-drive?style=social)](https://github.com/raoshishira/skyline-r2-drive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Skyline R2 Drive** is a secure, high-performance, localhost-based file manager for Cloudflare R2. It provides a familiar "Google Drive-like" interface for your R2 buckets while keeping your API keys and data strictly under your local control.

> [!TIP]
> **Enjoying the project?** Give it a ⭐ on GitHub to show your support!

## 🚀 Features

- 📂 **Multi-Bucket Management**: Switch between all your R2 buckets instantly.
- ⚙️ **In-App Configuration**: Manage your R2 credentials directly through the UI — no manual `.env` editing required after first setup.
- 📁 **Virtual File System**: Navigate prefixes as if they were real directories.
- ⚡ **High-Speed Uploads**:
  - Drag & drop support for files and folders.
  - Multipart streaming uploads for large files (videos, archives, etc.).
  - Relative path preservation for folder uploads.
- 📦 **Flexible Downloads**:
  - Stream single files directly to your machine.
  - Recursive folder downloads: auto-zips entire directories on-the-fly.
- 🔒 **Security First**:
  - **Local-Only Design**: Built specifically to run on `localhost`.
  - **Backend-Only Storage**: R2 credentials are saved to a local `.env` file and never stored in LocalStorage or exposed to the client.
  - **Password Protection**: Local login required to access the dashboard.
  - **Security Headers**: Powered by Helmet.js.
- 🎨 **Modern UI/UX**:
  - Built with React, Vite, and Tailwind CSS.
  - Real-time transfer progress panel with auto-dismiss.
  - Loading states and live UI updates via React Query.

## 🧱 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand (State), React Query (Data Fetching), Lucide React (Icons).
- **Backend**: Node.js, Express, AWS SDK v3 (S3 Client for R2), Multer (Disk-based Uploads), Archiver (Zipping).

## 🏁 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher.
- A Cloudflare account with R2 enabled.
- [R2 API Tokens](https://dash.cloudflare.com/?to=/:account/r2/api-tokens) with **Object Read & Write** permissions.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/raoshishira/skyline-r2-drive.git

# Navigate to the project
cd skyline-r2-drive

# Install all dependencies (Frontend & Backend)
npm run install:all
```

### 3. Configuration
Copy the example environment file and fill in your values:
```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Description | Example |
|---|---|---|
| `R2_ENDPOINT` | Your Cloudflare R2 S3 API endpoint | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 Token Access Key ID | `abc123...` |
| `R2_SECRET_ACCESS_KEY` | R2 Token Secret Access Key | `xyz789...` |
| `R2_BUCKET` | Default bucket to open on launch | `my-bucket` |
| `APP_PASSWORD` | Password to log into the dashboard | `change-me-before-use` |
| `SESSION_SECRET` | Random secret for session signing | Any long random string |
| `PORT` | Backend server port | `3002` |

> [!IMPORTANT]
> Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run Development Server
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3002/api](http://localhost:3002/api)

Log in with the `APP_PASSWORD` you set in `.env`.

## 🗂️ Architecture

The project is structured as a **Monorepo**:

```text
skyline-r2-drive/
├── frontend/              # React + Vite application
│   └── src/
│       ├── api/           # Axios client
│       ├── components/    # UI components
│       ├── pages/         # Page-level components
│       └── store/         # Zustand global state
├── backend/               # Node.js + Express server
│   └── src/
│       ├── controllers/   # API request handlers
│       ├── middleware/     # Auth middleware
│       ├── routes/        # Express route definitions
│       └── services/      # R2/S3 integration logic
├── .env                   # Your local config (Git ignored)
└── .env.example           # Template — safe to commit
```

## 🔐 Security Best Practices

- **Never** host this on a public-facing server without adding robust authentication (OAuth2, mTLS) and rate limiting.
- Use a strong, unique `APP_PASSWORD` — it's the only thing standing between the internet and your R2 credentials if misconfigured.
- Use a long, random `SESSION_SECRET` to prevent session forgery.
- Regularly rotate your Cloudflare API tokens.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
