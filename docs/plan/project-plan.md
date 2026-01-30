# Project Plan - Personal Knowledge MCP

**Status:** Conscious Design Phase  
**Last Updated:** January 29, 2026  
**Owner:** @gabo  
**Target Launch:** Q1 2026

---

## Executive Summary

**Problem:** Current AIs don't remember how you work. Each tool starts from scratch. Practical knowledge (criteria, trade-offs, style) gets lost.

**Solution:** A personal MCP server that captures, structures, and reuses technical reasoning across any tool or model.

**Success Criteria:**
- ✅ Can capture knowledge from CLI/IDE
- ✅ Can search for past knowledge with semantic search
- ✅ Agent uses knowledge base to inform decisions
- ✅ Knowledge base is portable (export/import)
- ✅ Zero unintended data leaks
- ✅ <1s response time for searches

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  IDE / Agent / Tool / Chat Interface                            │
│  (Continue.dev, Antigravity, VSCode forks, Ollama)             │
└────────────────────┬────────────────────────────────────────────┘
                     │ (MCP Protocol)
┌────────────────────▼────────────────────────────────────────────┐
│  MCP Server (Node.js + TypeScript)                              │
│  ├── Tools: store_knowledge, search_knowledge, list_entries    │
│  ├── Resources: knowledge index, tagged collections            │
│  └── Prompts: system prompts with learned knowledge            │
└────────────────────┬────────────────────────────────────────────┘
                     │ (REST API / PostgreSQL)
┌────────────────────▼────────────────────────────────────────────┐
│  Embeddings + Logic Layer                                       │
│  ├── Model: nomic-embed-text (Ollama) or OpenAI                │
│  ├── Vector Storage: pgvector in Postgres                      │
│  └── Semantic Search: cosine similarity + hybrid               │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│  Supabase (Postgres + pgvector + RLS + Auth)                   │
│  ├── Schemas: knowledge_entries, knowledge_tags               │
│  ├── Row Level Security: Only user sees own data              │
│  ├── Encryption: At rest + in transit                         │
│  └── Service Role: MCP server access only                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Foundations (Week 1) ✅

### Objective
Define governance, knowledge classification, and project structure.

### Deliverables

#### 0.1 Knowledge Definition ✅
- [x] Document what constitutes "knowledge"
- [x] Define storage policy with 8 capture types
- [x] Create `knowledge-guidelines.md` (reference existing)
- [x] Define metadata structure for entries

**Capture Event Types:**
1. `UI_REASONING` — UI/UX design decisions and rationale
2. `ARCH_DECISION` — Architecture choices and trade-offs
3. `PROMPT` — Refined prompts that work well with models
4. `ERROR_CORRECTION` — Bug fixes and lessons learned
5. `CODE_SNIPPET` — Reusable code patterns and utilities
6. `DESIGN_DECISION` — Design principles and guidelines
7. `TECHNICAL_INSIGHT` — Technical discoveries and optimizations
8. `REACT_PATTERN` — React-specific patterns and hooks

#### 0.2 Privacy & Security Policy ✅
- [x] Create `privacy-policy.md`
- [x] Document allowed data (9 categories)
- [x] Document prohibited data (8 categories)
- [x] Define RLS strategy for Supabase
- [x] Define encryption requirements
- [x] Set data retention policies
- [x] Outline user rights (access, modify, delete, export)

**Key Principle:** Human-in-the-loop, total transparency, user sovereignty

#### 0.3 Project Structure ⏳ In Progress
- [ ] Create `tsconfig.json` (TypeScript config)
- [ ] Create `package.json` with scripts
- [ ] Create `.env.example` template
- [ ] Create `README.md` with setup guide
- [ ] Create `src/` boilerplate
- [ ] Create `.github/workflows/ci.yml`
- [ ] Update `.gitignore` with proper patterns

**Approval Gate:** Validate governance docs before proceeding to Phase 1

---

## Phase 1: Supabase Infrastructure (Week 2)

### Objective
Provision Supabase project and enable required extensions.

### Deliverables

#### 1.1 Project Creation
- [ ] Create Supabase project in cloud console
- [ ] Select region (recommended: nearest to you)
- [ ] Save `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env`
- [ ] Generate and save `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Test connection with CLI: `npx supabase status`

#### 1.2 Extensions
- [ ] Enable `pgvector` extension (for embeddings)
- [ ] Enable `uuid-ossp` extension (for UUID generation)
- [ ] Enable `pgtap` extension (optional, for testing)
- [ ] Verify extensions: `SELECT * FROM pg_extension;`

#### 1.3 Authentication Setup
- [ ] Enable email/password auth method
- [ ] Configure redirect URLs for Vercel deployment
- [ ] Create test user account for testing
- [ ] Test manual login flow with SDK
- [ ] Store credentials in secure location

#### 1.4 Validation
- [ ] All extensions active and verified
- [ ] Can authenticate with test user
- [ ] Can query database (test table)
- [ ] Service role key accessible in Vercel secrets

**Success Metric:** Connection working, extensions active, auth functional

---

## Phase 2: Schema Design (Week 3)

### Objective
Design and implement database schema with Row Level Security.

### Deliverables

#### 2.1 Core Tables

**knowledge_entries**
```sql
CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'UI_REASONING', 'ARCH_DECISION', 'PROMPT',
    'ERROR_CORRECTION', 'CODE_SNIPPET', 'DESIGN_DECISION',
    'TECHNICAL_INSIGHT', 'REACT_PATTERN'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT content_not_empty CHECK (length(content) > 0),
  CONSTRAINT title_not_empty CHECK (length(title) > 0)
);

CREATE INDEX idx_knowledge_user ON knowledge_entries(user_id);
CREATE INDEX idx_knowledge_type ON knowledge_entries(type);
CREATE INDEX idx_knowledge_created ON knowledge_entries(created_at DESC);
CREATE INDEX idx_knowledge_tags ON knowledge_entries USING GIN(tags);
CREATE INDEX idx_knowledge_embedding ON knowledge_entries USING ivfflat (embedding vector_cosine_ops);
```

**knowledge_tags** (Normalized tags for analytics)
```sql
CREATE TABLE knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, tag)
);

CREATE INDEX idx_tags_user ON knowledge_tags(user_id);
```

**knowledge_audit_log** (Security/compliance)
```sql
CREATE TABLE knowledge_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SEARCH')),
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_user ON knowledge_audit_log(user_id);
CREATE INDEX idx_audit_action ON knowledge_audit_log(action);
```

#### 2.2 Row Level Security
```sql
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own entries
CREATE POLICY "Users can select own entries"
  ON knowledge_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON knowledge_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON knowledge_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON knowledge_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for tags and audit logs
```

#### 2.3 Validation
- [ ] All schemas created without errors
- [ ] Indexes created and visible
- [ ] RLS policies enforced
- [ ] Test: User A cannot see User B's data
- [ ] Test: Can insert, update, delete own entries
- [ ] Test: Service role can see all (for MCP server)

**Success Metric:** RLS working, data isolated per user, no leaks

---

## Phase 3: MCP Server Core (Week 4)

### Objective
Implement basic MCP server with storage and retrieval (no embeddings yet).

### Deliverables

#### 3.1 Project Setup
```bash
npm init -y
npm install --save @modelcontextprotocol/sdk @supabase/supabase-js dotenv
npm install --dev typescript @types/node tsx
npx tsc --init
```

#### 3.2 Core Tools (Keyword Search)

**Tool: `store_knowledge`**
- Input: type, title, content, tags[], source
- Output: { id, created_at, embedding_status }
- Logic: Validate input, sanitize, store in DB, return entry ID
- Error handling: No secrets leaked, validation errors clear

**Tool: `search_knowledge`**
- Input: query, type (optional), limit
- Output: [{ id, title, content, type, created_at, relevance_score }]
- Logic: Full-text search on title + content, filter by type
- Sorting: By created_at DESC (most recent first)

**Tool: `list_knowledge`**
- Input: type (optional), limit, offset
- Output: Paginated list of entries
- Logic: List all entries, optionally filter by type

**Tool: `get_knowledge`**
- Input: entry_id
- Output: Full entry with all metadata
- Error: 404 if not found or not owned by user

#### 3.3 Implementation Structure
```
src/
├── index.ts              # MCP server entry point
├── config.ts             # Config from env vars
├── types.ts              # TypeScript interfaces
├── handlers/
│   ├── tools.ts         # Tool handlers
│   └── resources.ts     # Resource handlers
├── db/
│   ├── client.ts        # Supabase client
│   └── queries.ts       # Database functions
├── embeddings/
│   └── placeholder.ts   # Stub for Phase 4
└── tests/
    ├── setup.ts         # Test configuration
    └── tools.test.ts    # Tool tests
```

#### 3.4 Deployment
- [ ] Code compiles without errors
- [ ] Push to GitHub
- [ ] Deploy to Vercel (Node.js 20)
- [ ] Set environment variables in Vercel
- [ ] Test MCP handshake

**Success Metric:** Tools work, data stored and retrieved, <200ms response time

---

## Phase 4: Vector Search (Week 5)

### Objective
Add embeddings pipeline using local Ollama.

### Deliverables

#### 4.1 Embedding Model Setup
- [ ] Install Ollama: `brew install ollama`
- [ ] Pull model: `ollama pull nomic-embed-text`
- [ ] Verify running: `curl http://localhost:11434/api/tags`
- [ ] Set `OLLAMA_API_URL=http://localhost:11434` in `.env`
- [ ] Set `EMBED_MODEL=nomic-embed-text`

**Model specs:**
- **Dimensions:** 768
- **Size:** 274MB
- **Speed:** ~50-100ms per embedding on M5 Pro
- **Quality:** High (better than OpenAI for many cases)
- **Cost:** $0 (local)

#### 4.2 Vector Storage
- [ ] Create embedding module: `src/embeddings/ollama.ts`
- [ ] Function: `generateEmbedding(text: string): Promise<number[]>`
- [ ] Function: `batchEmbeddings(texts: string[]): Promise<number[][]>`
- [ ] Error handling: Fallback if Ollama unavailable
- [ ] Caching: Store embeddings to avoid recomputation

#### 4.3 Semantic Search
Update `search_knowledge` tool:
- [ ] Convert query to embedding
- [ ] Find similar embeddings in pgvector
- [ ] Hybrid search: combine semantic + keyword
- [ ] Threshold: 0.7 cosine similarity (configurable)
- [ ] Limit: Return top 10 (configurable)

#### 4.4 Validation
- [ ] Embeddings generate correctly
- [ ] Vector search returns relevant results
- [ ] Performance: <1s for search
- [ ] Hybrid search combines results properly

**Success Metric:** Semantic search working, relevant results, fast

---

## Phase 5: Human Interaction (Week 6)

### Objective
Simple interface for manual knowledge capture.

### Deliverables

#### 5.1 Command Format
Users capture knowledge via structured commands in chat/CLI:
```
SAVE_KNOWLEDGE:
  type: REACT_PATTERN
  title: useCallback with proper dependencies
  content: [Full explanation of pattern, when to use, alternatives]
  tags: react, performance, hooks, useCallback
  source: continue.dev
```

#### 5.2 CLI Tool
```bash
npm run capture REACT_PATTERN \
  "useCallback with dependencies" \
  "Full content here..." \
  --tags react,hooks
```

#### 5.3 Preview Mode
- [ ] Show exactly what will be saved before sending
- [ ] Highlight: title, content preview, tags
- [ ] Confirm before uploading
- [ ] Show where it's being stored (timestamp, entry ID)

#### 5.4 Integration Points
- [ ] CLI tool working
- [ ] Can see what was saved via `get_knowledge`
- [ ] Tags properly indexed and searchable
- [ ] Timestamps accurate

**Success Metric:** Easy capture, clear preview, tags organized

---

## Phase 6: IDE Integration (Week 7)

### Objective
Integrate with development environment and Continue.dev.

### Deliverables

#### 6.1 Continue.dev Integration (Priority 1)
- [ ] Create Continue.dev extension config
- [ ] Expose `store_knowledge` tool
- [ ] Expose `search_knowledge` tool
- [ ] Enable from chat: `/save_knowledge` command
- [ ] Enable from chat: `/search` across knowledge base
- [ ] Test with Continue.dev IDE integration

#### 6.2 Antigravity / VSCode Fork (Optional)
- [ ] Document MCP connection setup
- [ ] Test with Antigravity if available
- [ ] Provide connection guide for users

#### 6.3 Quick Actions
- [ ] Keyboard shortcut: Ctrl+Shift+K (save knowledge)
- [ ] Context menu: "Add to knowledge base"
- [ ] Selection capture: Highlight → Save

**Success Metric:** Tools accessible from IDE, fast response, intuitive

---

## Phase 7: Agent Evolution (Week 8+)

### Objective
Make agents learn from and adapt to your knowledge base.

### Deliverables

#### 7.1 Knowledge Loader
- [ ] Tool: `load_knowledge` - fetch recent entries
- [ ] Summarize learnings by type
- [ ] Format as system prompt enhancement
- [ ] Cache for efficiency

#### 7.2 Dynamic Prompt Generation
Generate base system prompt from knowledge:
```
You are an AI assistant working with {user}.

Their technical principles:
- {architecture principle 1}
- {architecture principle 2}

Code style preferences:
- {style 1}
- {style 2}

Known patterns:
- {pattern 1}
- {pattern 2}

Common trade-offs they make:
- {tradeoff 1}
```

#### 7.3 Versioning & Evolution
- [ ] Tag knowledge with version: `thinking_style_v1`
- [ ] Track evolution of your approach
- [ ] Ability to "rollback to previous you"
- [ ] Compare different approaches over time

#### 7.4 Continuous Refinement
- [ ] Agent suggests new learnings
- [ ] You validate/reject suggestions
- [ ] Knowledge becomes more accurate over time
- [ ] Feedback loop: action → outcome → learning

**Success Metric:** Agent behavior reflects your style, improves over time

---

## Core Non-Negotiables

| Principle | Implementation |
|-----------|-----------------|
| ❌ Nothing automatic | Requires explicit command for every action |
| ❌ Nothing without validation | Preview and confirm before save |
| ✅ Everything observable | Logs of all operations visible |
| ✅ Everything versionable | Timestamps, git history, audit log |
| ✅ Everything portable | Export anytime as JSON + metadata |

---

## Stack Definition

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend** | Node.js 20 + TypeScript | Type safety, MCP SDK support |
| **MCP SDK** | @modelcontextprotocol/sdk | Industry standard |
| **Database** | Supabase (Postgres + pgvector) | RLS, auth, hosted |
| **Embeddings** | Ollama + nomic-embed-text | Local, fast, private |
| **Alternative** | OpenAI embeddings | For scale (future) |
| **Auth** | Supabase Auth | OAuth + email/password |
| **Deployment** | Vercel | Serverless, Git integration |
| **Testing** | Vitest | Fast, TypeScript native |
| **Linting** | ESLint + Prettier | Code quality |

---

## Success Metrics

### Phase 0 (Foundations)
- ✅ Privacy policy documented
- ✅ Project plan detailed
- ✅ TypeScript configured
- ✅ CI/CD pipeline ready

### Phase 1 (Supabase)
- [ ] Supabase project created
- [ ] Extensions enabled
- [ ] Connection tested
- [ ] Auth working

### Phase 2 (Schema)
- [ ] All tables created
- [ ] Indexes created
- [ ] RLS policies enforced
- [ ] No data leaks

### Phase 3 (MCP Core)
- [ ] Server starts without errors
- [ ] All 4 tools working
- [ ] Response time <200ms
- [ ] Error handling proper

### Phase 4 (Vector Search)
- [ ] Embeddings generating
- [ ] Semantic search working
- [ ] Hybrid search combining results
- [ ] Response time <1s

### Phase 5 (Human Interaction)
- [ ] CLI tool works
- [ ] Preview shows correct data
- [ ] Tags indexed properly
- [ ] Easy to save knowledge

### Phase 6 (IDE Integration)
- [ ] Continue.dev extension working
- [ ] Tools callable from chat
- [ ] Quick actions accessible
- [ ] Fast response times

### Phase 7 (Agent Evolution)
- [ ] Knowledge affects agent behavior
- [ ] System prompts dynamically generated
- [ ] Versioning working
- [ ] Improvement feedback loop

---

## Risk Management

| Risk | Mitigation |
|------|-----------|
| **Data leak** | RLS + encryption, careful sanitization |
| **Performance degradation** | Vector indexes, batch operations, caching |
| **Auth failure** | Test coverage, Supabase audit logs |
| **Embedding cost** | Start local, monitor usage, cache results |
| **Scope creep** | Clear phase gates, MVP focus |

---

## Timeline

| Phase | Duration | Status | Start | End |
|-------|----------|--------|-------|-----|
| 0. Foundations | 1 week | ⏳ In Progress | Jan 29 | Feb 5 |
| 1. Supabase | 1 week | ⏳ Planned | Feb 5 | Feb 12 |
| 2. Schema | 1 week | ⏳ Planned | Feb 12 | Feb 19 |
| 3. MCP Core | 1 week | ⏳ Planned | Feb 19 | Feb 26 |
| 4. Vector | 1 week | ⏳ Planned | Feb 26 | Mar 5 |
| 5. Human | 1 week | ⏳ Planned | Mar 5 | Mar 12 |
| 6. IDE | 1 week | ⏳ Planned | Mar 12 | Mar 19 |
| 7. Agent | 2 weeks | ⏳ Planned | Mar 19 | Apr 2 |

**Target Launch:** April 2, 2026

---

## Open Questions

1. **Embedding model:** Stick with local nomic-embed-text or eventually use OpenAI?
2. **Vector size:** 768 dims good or want smaller/larger?
3. **Refresh frequency:** How often to load knowledge into agent context?
4. **Versioning strategy:** How often to version "thinking style"?
5. **Archive vs delete:** Soft delete retention period (30 days)?
6. **Multi-user:** Ever want to share knowledge with others? (defer to Phase 8+)

---

## Decision Log

- **Decision:** Use Ollama + nomic-embed-text for local embeddings (not OpenAI)
  - **Reason:** Mac M5 Pro capable, data privacy, $0 cost, ~50-100ms latency
  - **Date:** Jan 29, 2026
  - **Review:** Revisit if performance needs or cost changes

- **Decision:** Supabase cloud deployment (not self-hosted)
  - **Reason:** Managed service, RLS built-in, easy auth, Git backups
  - **Date:** Jan 29, 2026
  - **Review:** Evaluate if moving to on-premise needed

- **Decision:** GitHub Actions for CI/CD
  - **Reason:** Free for public repos, native to GitHub, Vercel integration
  - **Date:** Jan 29, 2026
  - **Review:** Add more stages as project matures

---

## Contact & Ownership

**Project Lead:** @gabo  
**Last Updated:** January 29, 2026  
**Repository:** [github.com/gabo-mcp](https://github.com/gabo/gabo-mcp)  

This plan is a living document. Updates will be made as phases complete and learning occurs.
