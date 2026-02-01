# Manifesto - Personal Knowledge MCP

## Project Summary — Personal Knowledge MCP

### Objective

Build a personal MCP server that captures, structures, and reuses my daily technical knowledge (reasoning, decisions, patterns, prompts, workflows), in an accumulative, portable, and agnostic way to the tool or AI model I use.
The system should allow agents to behave more and more like me over time, consulting my past reasoning and decision history before acting.

### What problem does it solve

Current AIs don't remember how I work or why I make decisions.
Each IDE / tool / chat starts "from scratch".
Practical knowledge (criteria, trade-offs, style) gets lost.
Automatic changes can go beyond what's requested.
This project creates a persistent technical memory, accessible by any agent.

### What it is (and what it's not)

#### ✅ It is

- An MCP Server (Model Context Protocol)
- A personal semantic memory
- A living repository of technical reasoning
- A backend reusable by:
  - Continue.dev
  - IDEs (Antigravity, VSCode forks)
  - Local agents (Ollama)
  - Cloud models

#### ❌ It is not

- A chatbot
- A replacement for MongoDB Atlas
- An automatic system that acts without control
- A scraping or surveillance system

### Key Principles

1. **Human-in-the-loop** - Nothing is saved or applied without explicit intention.
2. **Total portability** - Knowledge doesn't belong to a specific tool.
3. **Clear separation of responsibilities**
   - MCP = intelligence and criteria
   - MongoDB Atlas = storage + vector search
   - Ollama = local embeddings (nomic-embed-text)
4. **Incremental evolution** - The system is built in clear, auditable, and controlled stages.
5. **Privacy-first** - Embeddings generated locally, no data sent to cloud for vectorization

### Conceptual Architecture

```
[ IDE / Agent / Tool ]
         ↓
[ MCP Server ]
         ↓
[ Embeddings (Ollama - Local) ]
         ↓
[ MongoDB Atlas (M0 Free Tier) ]
- Vector Search (768 dims, cosine similarity)
- 512 MB storage (enough for 30+ years of personal knowledge)
- Application-level security (user_id filtering)
```

### What is stored

- Technical reasoning
- Architecture decisions
- Recurring patterns
- Personal criteria
- Refined prompts
- Reusable "skills"
- Project context (not private code)

Each entry is saved as:

- Structured text
- Metadata
- Vector embedding (768 dimensions from nomic-embed-text)

### What it enables in the future

- Consult how I usually solve X
- Guide agents to:
  - Not break implicit contracts
  - Not modify more than requested
  - Respect my technical style
  - Reuse knowledge between projects
- Train my own criteria without training models
- Semantic search: find related concepts even with different words

### Defined Stack (high level)

- **Backend / MCP:** Node.js + TypeScript
- **DB:** MongoDB Atlas (M0 Free Tier with Vector Search)
- **Auth:** Manual (user_id validation in queries)
- **Embeddings:** Ollama + nomic-embed-text (local, 768 dims)
- **Deploy:** Vercel (on-demand / serverless)

### MongoDB Atlas Benefits for Personal Use

**Why M0 Free Tier is perfect:**

- ✅ 512 MB = ~60,000-100,000 knowledge entries
- At 5 entries/day: 33 years of usage
- At 20 entries/day: 8 years of usage
- ✅ Vector Search included (cosine similarity)
- ✅ 10 GB transfer/week (impossible to reach personally)
- ✅ 500 connections (more than enough)
- ✅ 100 ops/second (plenty for one user)

### Project Status

**Conscious design phase:**

1. First understand
2. Then model
3. After implement
4. Always validate

**Current Status:**

- ✅ Ollama installed with nomic-embed-text
- ✅ Embeddings working (768 dimensions verified)
- ✅ MongoDB Atlas cluster configured (M0 Free Tier)
- ✅ Atlas Vector Search index created
- ✅ Application connected to MongoDB
- ⏳ Vector embeddings generation (Phase 4)

This manifesto should be in my docs folder.
