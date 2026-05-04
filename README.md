# Stash

Stash is a feature-rich, tag-based library web application designed to organize media into searchable collections. 

<div align="center">
  <img src=".assets/home.png" alt="Stash Screenshot" width="100%">
</div>

## Features

- **Media Support:** Supports images, videos, and markdown stories with a built-in reader.
- **Hierarchical Tags:** A linked and hierarchical tag system for precise media organization and search.
- **AI Tagging:** Automatically tags images using LLMs (via OpenRouter) based on user-defined tag descriptions.
- **Importing:** Supports direct browser uploads, local server directory imports, and integration with Transmission.

## Architecture & Tech Stack

- **Frontend (`_frontend`):** Built with **SvelteKit** and Vite.
- **Worker (`_worker`):** High-performance background jobs powered by **Bun** and TypeScript. Handles media thumbnail generation, AI tagging, and metadata extraction.
- **Gatekeeper (`_gatekeeper`):** High-performance media serving and proxying written in **Go**.
- **Desktop Client (`_desktop_client`):** Electron-based desktop client for localized usage.
- **Database:** **PostgreSQL** accessed via Prisma ORM.

## Getting Started

1. Clone the repository.
2. Review the provided `docker-compose.example.yml` and adjust the volume paths to match your system. Rename it to `docker-compose.yml`.
3. Copy `.env.example` to `.env` and configure the necessary environment variables (e.g., database connection string, OpenRouter keys, etc.).
4. Start the stack:

```bash
docker-compose up -d
```
