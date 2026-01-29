# Knowledge Guidelines

## What is Knowledge?

### Storage Policy
- **Prompts**: Store complete prompts that are useful or interesting
- **Reasoning**: Store reasoning processes that are valuable
- **Technical Decisions**: Store architectural and technical decisions
- **Errors and Corrections**: Store mistakes and how they were corrected
- **Code**: Store code snippets that are reusable or illustrative

## Capture Events

These are the mental commands for capturing knowledge:
- SAVE_UI_REASONING
- SAVE_ARCH_DECISION  
- SAVE_PROMPT
- SAVE_ERROR_CORRECTION
- SAVE_CODE_SNIPPET
- SAVE_REACT_PATTERN
- SAVE_DESIGN_DECISION
- SAVE_TECHNICAL_INSIGHT
```

**docs/plan/privacy-policy.md**
```markdown
# Privacy Policy

## Data Protection Guidelines

### What is Allowed
- Patterns and reasoning
- Technical approaches and solutions
- General architectural decisions
- Code snippets and examples

### What is NOT Allowed
- Client names or company information
- Private repository contents
- Sensitive personal data
- Confidential business information
- Specific project details that could identify clients

## Security Measures

All data stored in the system will be:
- Accessible only to the authorized user
- Protected by Row Level Security (RLS)
- Stored in a secure Supabase environment
- Not accessible by other users or systems

## Data Handling

- All knowledge entries are private to the user
- No third-party access is permitted
- Data is stored in a way that maintains user privacy
- No personal identifiers are stored in the knowledge base
```

**docs/plan/project-plan.md**
```markdown
# Project Plan - Knowledge Management System

## Phase 0 - Foundations (No Code)

### 0.1 Define What is Knowledge
- [ ] Create knowledge-guidelines.md
- [ ] Define storage policy for prompts, reasoning, decisions, errors, code
- [ ] Document capture events and mental commands

### 0.2 Define Capture Events
- [ ] List explicit mental commands for knowledge capture
- [ ] Define SAVE_UI_REASONING
- [ ] Define SAVE_ARCH_DECISION
- [ ] Define SAVE_PROMPT
- [ ] Define SAVE_ERROR_CORRECTION
- [ ] Define SAVE_CODE_SNIPPET

### 0.3 Privacy Policy
- [ ] Create privacy-policy.md
- [ ] Define data protection guidelines
- [ ] Establish security measures
- [ ] Document data handling procedures

## Phase 1 - Supabase Infrastructure

### 1.1 Create Supabase Project
- [ ] Create new Supabase project
- [ ] Save project URL
- [ ] Save anon key
- [ ] Save service role key (secure)

### 1.2 Activate Extensions
- [ ] Enable pgvector extension
- [ ] Enable UUID extension
- [ ] Manual verification required

### 1.3 Basic Authentication
- [ ] Enable email/password authentication
- [ ] Create user account
- [ ] Test manual login

## Phase 2 - Schema Design

### 2.1 Knowledge Entries Schema
- [ ] Define knowledge_entries table
- [ ] Fields: id, user_id, type, title, content, embedding, tags, created_at, source
- [ ] Validate schema design before implementation

### 2.2 Row Level Security
- [ ] Implement RLS rules
- [ ] Ensure only user can view their data
- [ ] Configure MCP to use service role
- [ ] Ensure no client can read all data

## Phase 3 - MCP Server

### 3.1 Create Repository
- [ ] Initialize Node.js + TypeScript project
- [ ] No framework yet
- [ ] Setup basic project structure

### 3.2 Basic MCP Server
- [ ] Implement handshake MCP
- [ ] Create store_knowledge tool
- [ ] Create search_knowledge tool
- [ ] No embeddings yet

### 3.3 Deploy to Vercel
- [ ] Configure environment variables
- [ ] First successful request
- [ ] Verify logs are visible

## Phase 4 - Vector Search

### 4.1 Embeddings Pipeline
- [ ] Decide between local vs cloud
- [ ] Determine embedding size
- [ ] Evaluate cost considerations

### 4.2 Insert with Embedding
- [ ] Save text content
- [ ] Generate vector embeddings
- [ ] Insert into Supabase

### 4.3 Semantic Search
- [ ] Implement similarity search
- [ ] Set threshold parameters
- [ ] Order by score + date

## Phase 5 - Human Interaction

### 5.1 Manual Commands
- [ ] Define SAVE_KNOWLEDGE command format
- [ ] Specify: type, title, content, tags
- [ ] Example: SAVE_KNOWLEDGE: tipo: ui titulo: patrón de layout contenido: … tags: react, ui

### 5.2 Simple Client
- [ ] Create CLI or script interface
- [ ] Allow manual saving
- [ ] Show exactly what is sent

## Phase 6 - IDE Integration (Optional)

### 6.1 Antigravity Integration
- [ ] Implement CLI
- [ ] Copy/paste conscious workflow
- [ ] Single source: MCP

## Phase 7 - Agent Evolution

### 7.1 Read Existing Knowledge
- [ ] Load existing knowledge base
- [ ] Understand current patterns

### 7.2 Dynamic Prompt Generation
- [ ] Generate base prompt dynamically
- [ ] Adjust based on learning
- [ ] Progressive refinement

### 7.3 Versioning
- [ ] Version your "thinking style"
- [ ] Track evolution of your approach
- [ ] Maintain portable knowledge

## Core Principles

### Non-Negotiables
- ❌ Nothing automatic without understanding
- ❌ Nothing written without your validation
- ✅ Everything observable
- ✅ Everything versionable
- ✅ Everything portable

## Implementation Approach

This will be implemented as a phased approach, with each phase validated before proceeding to the next. The agent will work in collaboration with you, ensuring that all decisions are reviewed and validated by you before implementation.