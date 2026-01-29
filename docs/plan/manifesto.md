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
- A replacement for Supabase
- An automatic system that acts without control
- A scraping or surveillance system

### Key Principles
1. **Human-in-the-loop** - Nothing is saved or applied without explicit intention.
2. **Total portability** - Knowledge doesn't belong to a specific tool.
3. **Clear separation of responsibilities**
   - MCP = intelligence and criteria
   - Supabase = storage and security
   - Models = reasoning / embeddings
4. **Incremental evolution** - The system is built in clear, auditable, and controlled stages.

### Conceptual Architecture
```
[ IDE / Agent / Tool ]           ↓      [ MCP Server ]           ↓ [ Embeddings + Logic ]           ↓      [ Supabase ]
(Postgres + pgvector + RLS) 
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
- Vector embedding

### What it enables in the future
- Consult how I usually solve X
- Guide agents to:
  - Not break implicit contracts
  - Not modify more than requested
  - Respect my technical style
  - Reuse knowledge between projects
- Train my own criteria without training models

### Defined Stack (high level)
- **Backend / MCP:** Node.js + TypeScript
- **DB:** Supabase (Postgres + pgvector + RLS)
- **Auth:** Supabase Auth (personal)
- **Embeddings:** local or cloud model (interchangeable)
- **Deploy:** Vercel (on-demand / serverless)

### Project Status
**Conscious design phase:**
1. First understand
2. Then model
3. After implement
4. Always validate

This manifesto should be in my docs folder.


