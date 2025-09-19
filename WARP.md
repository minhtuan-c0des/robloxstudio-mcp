# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Roblox Studio MCP Server (Node.js + TypeScript) bridging AI assistants and Roblox Studio via a local HTTP bridge and a Studio plugin.

Common commands (PowerShell on Windows)
- Install dependencies: `npm ci`
- Build (TS -> dist): `npm run build`
- Typecheck only: `npm run typecheck`
- Lint (ESLint TS rules): `npm run lint`
- Dev (run from src with tsx): `npm run dev`
- Start built artifact: `npm start`
- Test (Jest, ESM/ts-jest): `npm test`
- Test (watch): `npm run test:watch`
- Test (coverage): `npm run test:coverage`
- Run a single test file: `npm test -- src/__tests__/http-server.test.ts`
- Run tests matching a name: `npm test -- -t "Full Connection Flow"`
- Override Studio bridge port: `$env:ROBLOX_STUDIO_PORT = "3005"; npm run dev`
- Health check (when dev server is running): `curl http://localhost:3002/health`

CLI entry point
- Run the published CLI (outside this repo or after publish): `npx -y robloxstudio-mcp`

High-level architecture and structure
- Entry point and MCP server
  - src/index.ts boots two services:
    - MCP server (stdio) via @modelcontextprotocol SDK exposing tools (e.g., file tree, search, instance/property operations, project structure). It registers tool handlers and connects via StdioServerTransport.
    - Local HTTP bridge (Express) on localhost (default port 3002, configurable via ROBLOX_STUDIO_PORT) for communication with the Roblox Studio plugin.
  - On start, logs where the HTTP server is listening and that the MCP server is running on stdio. Periodically logs connection state and performs cleanup of old requests.

- HTTP bridge (Express)
  - src/http-server.ts exposes endpoints used by the Studio plugin and for observability:
    - GET /health and GET /status: overall service/plugin/MCP status, uptime, last activity.
    - POST /ready and POST /disconnect: plugin lifecycle hooks. Disconnect clears all pending queued requests.
    - GET /poll: long-poll style fetch for pending work. Returns 503 until the MCP server is active; once active, returns a pending request (if any) or null.
    - POST /response: plugin posts back results (or errors) tied to a requestId.
    - Additionally mounts /mcp/* POST endpoints that proxy tool calls to the internal tools implementation (useful for programmatic/local testing without an MCP client).
  - Connection state timeouts are enforced (plugin inactivity ~10s, MCP activity ~15s) to keep status accurate.

- Bridge and tool layer
  - src/bridge-service.ts: in-memory request queue with UUID tracking, 30s timeouts, and cleanup. Provides getPendingRequest() for the plugin poll, and resolve/reject helpers to complete requests.
  - src/tools/index.ts: implements the tool surface (grouped as File System, Studio Context, Instance/Property, Creation, Project Analysis, plus advanced duplication and calculated/relative property tools). Each tool shapes output as MCP text content and delegates to StudioHttpClient.
  - src/tools/studio-client.ts: thin client that uses BridgeService to enqueue requests and await results; translates timeouts into clear user-facing errors.

- Roblox Studio plugin
  - studio-plugin/plugin.luau and studio-plugin/INSTALLATION.md. The plugin polls the HTTP bridge (default http://localhost:3002), shows connection status in a dock widget, and executes Roblox API calls in response to queued work. It expects HTTP to be enabled in Studio game settings.
  - Default polling cadence is ~500ms; the plugin marks itself ready, polls for work, and posts responses back to the bridge.

- Tests
  - src/__tests__/*: integration and unit tests (Jest, ts-jest ESM preset) exercise the HTTP bridge and BridgeService without requiring Roblox Studio. They verify lifecycle, polling, error handling, timeouts, disconnect/reconnect flows, and request priority.
  - Jest config (jest.config.js): ESM via ts-jest, testMatch on **/*.test.ts, collects coverage for src/**/*.ts excluding src/index.ts.

Operational notes for Warp
- To run locally during development, prefer `npm run dev`; for compiled execution use `npm run build && npm start`.
- The bridge listens on port 3002 by default. Override with ROBLOX_STUDIO_PORT if the port is in use.
- Use /health and /status to quickly diagnose plugin/MCP state: before the MCP server connects, /poll returns 503; after connect, it returns either a request or a null payload.
- When using the project via an MCP client (e.g., Claude), follow README’s npx configuration. For direct local testing, the /mcp/* endpoints can call tool implementations over HTTP without a client.
- get_project_structure typically benefits from a higher maxDepth. The server recommends 5–10 for comprehensive exploration.

What this file considered
- README.md quick start and architecture; package.json scripts for canonical dev commands; Jest/TS/ESLint configs; src/index.ts + http-server.ts + bridge-service.ts + tools/* for system design; studio-plugin docs for plugin behavior. No CLAUDE, Cursor, or Copilot rule files were found in this repo at the time of writing.
