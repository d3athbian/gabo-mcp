# Personal Knowledge MCP Server

A personal MCP (Model Context Protocol) server that captures, structures, and reuses technical knowledge across any AI tool or model.

> **Status:** Phase 0 (Foundations) - January 2026

---

## What is it?

Your personal AI memory. Instead of starting from scratch with each tool, this server:

- 📝 **Captures** your technical reasoning, decisions, patterns, and refined prompts
- 🔍 **Organizes** knowledge by type (architecture, code snippets, React patterns, etc.)
- 🧠 **Remembers** your approach so agents behave more like you over time
- 🚀 **Works everywhere** - Continue.dev, IDEs, agents, any MCP-compatible tool

### Key Features

- ✅ **Human-in-the-loop** - Nothing happens without explicit intention
- ✅ **Semantic search** - Find knowledge by meaning, not just keywords
- ✅ **Portable** - Export anytime, no vendor lock-in
- ✅ **Secure** - Row-level security, encrypted at rest
- ✅ **Local embeddings** - Privacy-first, runs on your Mac
- ✅ **Flexible embeddings** - Start with Ollama, switch to OpenAI later

---

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js 20 + TypeScript | Type safety, MCP SDK support |
| **Database** | Supabase (Postgres + pgvector) | Managed RLS, embeddings, hosted |
| **Embeddings** | Ollama + nomic-embed-text | Local, fast (50-100ms), private |
| **Auth** | Supabase Auth | OAuth + email/password |
| **Deploy** | Vercel | Serverless, Git native |
| **Testing** | Vitest | Fast, TypeScript native |

---

## Project Structure

```
gabo-mcp/
├── docs/
│   └── plan/
│       ├── manifesto.md          # Project vision
│       ├── knowledge-guidelines.md # What knowledge means
│       ├── privacy-policy.md      # Security & data governance
│       └── project-plan.md        # 7-phase detailed plan
├── src/
│   ├── index.ts                  # MCP server entry point
│   ├── config.ts                 # Configuration from env
│   ├── types.ts                  # TypeScript interfaces
│   ├── handlers/
│   │   ├── tools.ts              # MCP tool implementations
│   │   └── resources.ts          # MCP resources (future)
│   ├── db/
│   │   ├── client.ts             # Supabase client
│   │   └── queries.ts            # Database functions
│   ├── embeddings/
│   │   └── index.ts              # Embedding pipeline
│   └── tests/
│       ├── setup.ts              # Test configuration
│       └── *.test.ts             # Test files
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions CI/CD
├── .env.example                  # Environment template
├── tsconfig.json                 # TypeScript config
├── vitest.config.ts              # Vitest config
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Ollama installed (`brew install ollama`)
- A Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/gabo/gabo-mcp.git
cd gabo-mcp
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OLLAMA_API_URL=http://localhost:11434
EMBED_MODEL=nomic-embed-text
```

### 3. Start Ollama

```bash
# Install model (one-time)
ollama pull nomic-embed-text

# Start Ollama service
ollama serve
```

In another terminal:

### 4. Build & Test

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# Development mode (watches for changes)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## Knowledge Types

The system supports 8 capture types:

| Type | Purpose | Example |
|------|---------|---------|
| `UI_REASONING` | Why you make UI/UX decisions | "Always use semantic HTML for accessibility" |
| `ARCH_DECISION` | Architecture choices & trade-offs | "Microservices vs monolith analysis" |
| `PROMPT` | Refined prompts that work | "Effective prompts for code generation" |
| `ERROR_CORRECTION` | Bug fixes & lessons learned | "How to debug React state issues" |
| `CODE_SNIPPET` | Reusable code patterns | "useCallback hook pattern" |
| `DESIGN_DECISION` | Design principles | "Design system color standards" |
| `TECHNICAL_INSIGHT` | Technical discoveries | "TypeScript discriminated unions" |
| `REACT_PATTERN` | React-specific patterns | "Custom hooks for data fetching" |

---

## Saving Knowledge (Planned - Phase 5)

Via CLI (when Phase 5 is ready):

```bash
npm run capture REACT_PATTERN \
  "useCallback with proper dependencies" \
  "Full explanation..." \
  --tags react,hooks,performance
```

Via Continue.dev (when Phase 6 is ready):

```
/save_knowledge REACT_PATTERN "title" "content" --tags react
```

---

## Searching Knowledge (Planned - Phase 4+)

Via CLI:

```bash
npm run search "react hooks" --type REACT_PATTERN
```

Via Continue.dev:

```
/search "react state management"
```

The system will use:
- **Phase 3:** Keyword search (title + content)
- **Phase 4:** Semantic search (vector similarity)
- **Phase 5+:** Hybrid search combining both

---

## Development Workflow

### File Structure

- **`docs/`** - Project planning and governance
- **`src/`** - TypeScript source code
- **`.github/workflows/`** - CI/CD pipelines
- **`.env*`** - Environment variables (`.env.example` is tracked, `.env` is not)

### Running Locally

```bash
# Terminal 1: Ollama (if not running)
ollama serve

# Terminal 2: Development server
npm run dev

# Terminal 3: Testing (optional)
npm run test:watch
```

### Before Committing

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

The CI/CD pipeline will verify all of these automatically.

---

## Project Phases

| Phase | Status | Duration | Focus |
|-------|--------|----------|-------|
| 0. **Foundations** | ✅ In Progress | Week 1 | Governance, docs, setup |
| 1. **Supabase** | ⏳ Planned | Week 2 | DB provisioning, auth |
| 2. **Schema** | ⏳ Planned | Week 3 | Tables, RLS, indexes |
| 3. **MCP Core** | ⏳ Planned | Week 4 | Store/search (no embeddings) |
| 4. **Vector Search** | ⏳ Planned | Week 5 | Embeddings, semantic search |
| 5. **Human Interaction** | ⏳ Planned | Week 6 | CLI capture, preview mode |
| 6. **IDE Integration** | ⏳ Planned | Week 7 | Continue.dev, IDE plugins |
| 7. **Agent Evolution** | ⏳ Planned | Week 8+ | Dynamic prompts, versioning |

See [docs/plan/project-plan.md](docs/plan/project-plan.md) for detailed phase breakdown.

---

## Security & Privacy

### What's Stored (✅ Allowed)

- Technical reasoning and decisions
- Code snippets and patterns
- Refined prompts
- UI/UX principles
- Bug fixes and lessons learned

### What's NOT Stored (❌ Prohibited)

- Client names, company identifiers
- Private code or credentials
- API keys, tokens, secrets
- Personal data of others (PII)
- Financial or commercial data

### Security Measures

- **Row Level Security (RLS)** - Only you see your data
- **Encryption at rest** - All data encrypted in Postgres
- **No auto-save** - Explicit commands only
- **Audit logs** - Track all access
- **Service isolation** - MCP server has limited permissions

See [docs/plan/privacy-policy.md](docs/plan/privacy-policy.md) for full policy.

---

## Environment Variables

All variables are defined in `.env.example`. Key ones:

```env
# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Embeddings
EMBED_MODEL=nomic-embed-text              # Model name
OLLAMA_API_URL=http://localhost:11434     # Ollama endpoint
EMBED_BATCH_SIZE=32                       # Docs per batch
EMBED_CACHE_ENABLED=true                  # Cache embeddings

# MCP Server
MCP_SERVER_PORT=3000
MCP_REQUEST_TIMEOUT=30000

# Features
ENABLE_EMBEDDINGS=true
ENABLE_CACHE=true
ENABLE_AUDIT_LOG=true

# Debugging
DEBUG=false
LOG_LEVEL=info
```

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install
```

### "Ollama connection failed"

Make sure Ollama is running:

```bash
ollama serve
```

And the `OLLAMA_API_URL` in `.env` matches (default: `http://localhost:11434`)

### "TypeScript compilation errors"

```bash
npm run type-check
```

### "Tests failing"

```bash
npm run test -- --reporter=verbose
```

---

## Contributing

This is a personal project, but the code is public. Feel free to:

- 🐛 Report issues
- 💡 Suggest improvements
- 📖 Improve documentation
- 🔍 Review code

See [CONTRIBUTING.md](CONTRIBUTING.md) (future).

---

## License

MIT License - See [LICENSE](LICENSE)

---

## Roadmap

- [x] Phase 0: Documentation & setup
- [ ] Phase 1: Supabase infrastructure
- [ ] Phase 2: Database schema design
- [ ] Phase 3: MCP server core (store/search without embeddings)
- [ ] Phase 4: Vector embeddings & semantic search
- [ ] Phase 5: Manual knowledge capture (CLI/UI)
- [ ] Phase 6: IDE integration (Continue.dev)
- [ ] Phase 7: Agent evolution (dynamic prompts, versioning)
- [ ] Phase 8+: Multi-user, sharing, advanced features

---

## Contact

**Project Lead:** @gabo  
**Repository:** [github.com/gabo/gabo-mcp](https://github.com/gabo/gabo-mcp)  
**Status:** Active development (Phase 0)

---

**Last Updated:** January 29, 2026  
**Next Phase:** February 5, 2026
