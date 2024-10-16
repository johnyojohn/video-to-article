# Video-to-Article Converter

This project is a web application that converts educational videos into multimedia articles using AI. It consists of a Next.js frontend and a Go backend with GraphQL API. I made it for two reasons: firstly, because it crossed off a bunch of things from my try-these-out list, including Go, GraphQL, and Gemini. And secondly, because I missed some lectures at CMU because I was sick, but I don't like watching recorded lectures so I made this to try to convert them into written form.

It is not optimized for performance yet. Converting a 15 minute video into an article takes about 4 minutes.

## Prerequisites

- Node.js (v14 or later)
- Go (v1.16 or later)
- Google Cloud Platform account with the following APIs enabled:
  - Cloud Storage
  - Vertex AI

## Local Development Setup

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   PROJECT_ID=your_gcp_project_id
   CLIENT_EMAIL=your_service_account_email
   PRIVATE_KEY=your_service_account_private_key
   BUCKET_NAME=your_gcs_bucket_name
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Go dependencies:
   ```
   go mod download
   ```

3. Set up environment variables:
   ```
   export PROJECT_ID=your_gcp_project_id
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

4. Start the backend server:
   ```
   go run server.go
   ```

The GraphQL server will be available at `http://localhost:8080/query`.


## Project Structure

- `frontend/`: Next.js frontend application
- `backend/`: Go backend with GraphQL API
- `backend/graph/`: GraphQL schema and resolvers
- `backend/core/`: Core logic for article generation and some SQLite stuff
