# Cedar Authorization Dashboard

A Next.js dashboard for managing Cedar policies, entities, and authorization with [cedar-agent](https://github.com/permitio/cedar-agent).

## Quick Start

1. **Start cedar-agent:**
   ```bash
   podman run -p 8180:8180 permitio/cedar-agent
   # or with Docker:
   docker run -p 8180:8180 permitio/cedar-agent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment (optional):**
   ```bash
   cp env.example .env.local
   # Edit .env.local if needed
   ```

4. **Run the dashboard:**
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Description | Default |
|----------|-------------|---------|
| `CEDAR_AGENT_URL` | URL of the cedar-agent server | `http://localhost:8180` |

Example `.env.local`:
```env
CEDAR_AGENT_URL=http://localhost:8180
```

## Features

- **Policies** - Create, edit, delete Cedar policies with syntax highlighting
- **Entities** - Manage users, roles, resources as JSON data
- **Authorization Testing** - Check if principal can perform action on resource
- **Schema** - Define entity types for type-safe policies

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Cedar policy language via cedar-agent

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (proxy to cedar-agent)
│   ├── authorize/     # Authorization testing page
│   ├── entities/      # Entities management page
│   ├── policies/      # Policies management page
│   ├── schema/        # Schema management page
│   └── page.tsx       # Dashboard home
├── components/        # Reusable UI components
└── lib/
    ├── cedar-client.ts  # API client
    └── env.ts           # Environment configuration
```
