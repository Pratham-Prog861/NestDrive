# NestDrive

NestDrive is a full-stack file drive for images with folders, search, and auth. The client is a React + Vite app, and the server is an Express + MongoDB API with optional Cloudinary storage (local uploads fallback when Cloudinary is not configured).

## Features

- JWT auth with signup/login and profile fetch.
- Folder hierarchy with recursive size totals and breadcrumbs.
- Image upload to Cloudinary or local disk fallback.
- Global search for folders and images.
- Responsive dashboard with modals and image preview.

## Tech Stack

- Client: React 19, Vite, Tailwind CSS v4, React Query, React Router, Radix UI.
- Server: Express, MongoDB (Mongoose), JWT, Multer, Cloudinary.

## Project Structure

```js
client/   # React app
server/   # Express API
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 11+
- MongoDB (local or hosted)

### Install

```js
pnpm install --dir client
pnpm install --dir server
```

### Environment Variables

Create a .env file in server/:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nestdrive
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create a .env file in client/ (optional):

```js
VITE_API_URL=http://localhost:5000/api
```

If Cloudinary values are omitted, uploads are stored locally in server/uploads/.

### Run (Dev)

```js
cd client pnpm run dev
cd server pnpm run dev
```

The API runs on http://localhost:5000 by default.

## API Overview

Base URL: /api

- POST /auth/signup
- POST /auth/login
- GET /auth/me
- GET /folders
- POST /folders
- GET /folders/:folderId
- DELETE /folders/:folderId
- POST /images (form field: file)
- DELETE /images/:imageId
- GET /search?q=...

## Scripts

Client (client/):

- dev
- build
- preview
- lint

Server (server/):

- dev (nodemon)
- start
