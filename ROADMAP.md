# OpenCal — Build Roadmap

## Current State
Landing site is live with mock data. No database, no auth, no real functionality.

---

## Phase 1: Foundation (Database + Auth + Core Models)

### 1.1 Database Setup
- [ ] Install Drizzle ORM + postgres driver (`drizzle-orm`, `postgres`, `drizzle-kit`)
- [ ] Configure Drizzle with connection string (Neon/Supabase PostgreSQL)
- [ ] Create schema files under `src/db/schema/`
- [ ] Tables: `users`, `accounts`, `sessions`, `verification_tokens` (Auth.js)
- [ ] Tables: `organizations`, `org_nodes`, `user_roles`
- [ ] Tables: `events`, `rsvps`
- [ ] Run initial migration
- [ ] Seed script with demo data (replace mock data)

### 1.2 Authentication
- [ ] Install Auth.js v5 (`next-auth@beta`)
- [ ] Configure Google OAuth provider
- [ ] Configure GitHub OAuth provider
- [ ] Configure email/magic-link provider (Resend)
- [ ] Set up Drizzle adapter for Auth.js (persist users to DB)
- [ ] Create `src/lib/auth.ts` with auth config
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Wire sign-in page to actual providers
- [ ] Add session provider to layout
- [ ] Update Header with user avatar / sign-out

### 1.3 Database Schema Design

```
users
  id          UUID PK
  email       TEXT UNIQUE NOT NULL
  name        TEXT
  avatar_url  TEXT
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

organizations
  id          UUID PK
  slug        TEXT UNIQUE NOT NULL
  name        TEXT NOT NULL
  description TEXT
  logo_url    TEXT
  website     TEXT
  settings    JSONB (timezone defaults, features, etc.)
  created_by  UUID FK -> users
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

org_nodes (hierarchical units: HQ, region, district, chapter)
  id              UUID PK
  org_id          UUID FK -> organizations
  parent_id       UUID FK -> org_nodes (NULL = root)
  name            TEXT NOT NULL
  slug            TEXT NOT NULL
  level           INT NOT NULL (0=root, 1=region, 2=district, 3=chapter)
  level_label     TEXT (custom label: "Region", "District", "Chapter")
  timezone        TEXT DEFAULT 'UTC'
  city            TEXT
  description     TEXT
  materialized_path TEXT (e.g. "/root-id/region-id/chapter-id" for fast queries)
  member_count    INT DEFAULT 0
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
  UNIQUE(org_id, slug)

user_roles
  id          UUID PK
  user_id     UUID FK -> users
  org_id      UUID FK -> organizations
  org_node_id UUID FK -> org_nodes
  role        TEXT NOT NULL (global_admin | regional_director | chapter_president | chapter_coordinator | member | observer)
  created_at  TIMESTAMP
  UNIQUE(user_id, org_node_id, role)

events
  id              UUID PK
  org_id          UUID FK -> organizations
  org_node_id     UUID FK -> org_nodes (where it was created)
  created_by      UUID FK -> users
  title           TEXT NOT NULL
  description     TEXT
  long_description TEXT
  start_time      TIMESTAMP WITH TIME ZONE NOT NULL
  end_time        TIMESTAMP WITH TIME ZONE NOT NULL
  timezone        TEXT NOT NULL
  location        TEXT
  type            TEXT NOT NULL (global_mandate | regional | chapter | draft)
  visibility      TEXT NOT NULL DEFAULT 'public' (public | members_only | leadership_only)
  cascade_down    BOOLEAN DEFAULT false
  max_attendees   INT
  tags            TEXT[] (array)
  status          TEXT DEFAULT 'published' (draft | pending_approval | published | cancelled)
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

rsvps
  id          UUID PK
  event_id    UUID FK -> events
  user_id     UUID FK -> users
  status      TEXT NOT NULL (going | maybe | declined)
  created_at  TIMESTAMP
  updated_at  TIMESTAMP
  UNIQUE(event_id, user_id)
```

---

## Phase 2: Org Management + RBAC

### 2.1 Org Creation Flow
- [ ] "Create Organization" page (`/create-org`)
- [ ] Form: name, slug (auto-generated), description, timezone
- [ ] Slug validation (unique, URL-safe)
- [ ] Creator becomes `global_admin` automatically
- [ ] Redirect to org dashboard after creation

### 2.2 Org Settings
- [ ] Org settings page (`/[org]/settings`) — name, description, logo
- [ ] Hierarchy level configuration (define level labels: "Region", "Chapter", etc.)
- [ ] Delete org (with confirmation)

### 2.3 Org Node (Chapter/Region) Management
- [ ] Add child node UI (e.g., add a region under HQ, add a chapter under a region)
- [ ] Edit node details (name, timezone, city, description)
- [ ] Tree view of the full hierarchy
- [ ] Delete node (with reassignment or cascade)

### 2.4 RBAC Middleware
- [ ] Create `src/lib/rbac.ts` — permission definitions per role
- [ ] `checkPermission(userId, orgNodeId, action)` function
- [ ] Actions: `org.manage`, `node.manage`, `event.create`, `event.edit`, `event.delete`, `member.invite`, `member.manage`, `rsvp`
- [ ] Hierarchy-aware: global_admin can do anything; regional_director can manage their region + children
- [ ] Server-side middleware that protects API routes
- [ ] Client-side hook: `usePermission(action)` for conditional UI rendering

### 2.5 Member Management
- [ ] Invite members page (`/[org]/members`)
- [ ] Invite by email (sends magic link to join)
- [ ] Assign role + scope (which org_node)
- [ ] View members list with roles
- [ ] Remove member / change role

---

## Phase 3: Calendar & Events

### 3.1 Event CRUD
- [ ] Create event form (title, description, dates, timezone, location, type, visibility)
- [ ] Scope selection: which org_node does this event belong to?
- [ ] Edit event page
- [ ] Delete event (soft delete or hard)
- [ ] Event status workflow: draft → pending_approval → published

### 3.2 Event Cascade
- [ ] When `cascade_down = true`, event appears on all descendant node calendars
- [ ] Visual indicator on cascaded events ("From HQ", "From North America Region")
- [ ] Cascaded events are read-only at lower levels (can't edit a global mandate locally)

### 3.3 Calendar Views
- [ ] Install/build calendar component (FullCalendar or custom)
- [ ] Month view showing events with color-coding by type
- [ ] Week view
- [ ] Day view
- [ ] Filter by: event type, org node, visibility
- [ ] Calendar scoped to current node + parent cascaded events

### 3.4 RSVP System
- [ ] RSVP button on event pages (going / maybe / declined)
- [ ] Attendee count display
- [ ] Attendee list (visible to event creator + admins)
- [ ] Max attendees enforcement

### 3.5 Conflict Detection
- [ ] When creating an event, check for:
  - Same org_node events on overlapping dates
  - Sibling node events on overlapping dates (same region, different chapters)
- [ ] Surface warnings in the create/edit form
- [ ] Conflict dashboard for regional directors

---

## Phase 4: Dashboard

### 4.1 Org Dashboard (`/[org]/dashboard`)
- [ ] Total events count (by type)
- [ ] Upcoming events list
- [ ] Chapter activity summary (events per chapter this month)
- [ ] Member count by node
- [ ] Recent activity feed

### 4.2 Node Dashboard (`/[org]/[nodeSlug]/dashboard`)
- [ ] Node-specific event list
- [ ] Cascaded events from parent
- [ ] Chapter events (if node is a region)
- [ ] Conflict alerts

### 4.3 Personal Dashboard (`/dashboard`)
- [ ] All orgs I belong to
- [ ] My upcoming events (across all orgs)
- [ ] My RSVPs
- [ ] Notifications

---

## Phase 5: Notifications & Communication

- [ ] In-app notification system (bell icon in header)
- [ ] Email notifications via Resend:
  - New global event created
  - Event approaching (24h before)
  - Invited to org / role assigned
  - Conflict detected
- [ ] Weekly digest email (upcoming events at your scope)
- [ ] Announcement system: broadcast messages alongside events

---

## Phase 6: Integrations & Advanced

- [ ] Google Calendar two-way sync (OAuth + Calendar API)
- [ ] Outlook Calendar sync
- [ ] iCal export (.ics download per node/org)
- [ ] Resource management (shared speakers, equipment)
- [ ] Approval workflows (chapter submits → regional director approves)
- [ ] CSV export for reports
- [ ] SSO / SAML integration
- [ ] Multi-language support (i18n)
- [ ] Public embeddable calendar widget
- [ ] API keys for third-party integrations

---

## Execution Order (What We Build Now)

We build in this exact sequence, each step building on the previous:

```
Step 1:  Database schema + Drizzle setup + migrations
Step 2:  Auth.js with Google/GitHub + DB adapter
Step 3:  Org creation flow (create, view, list)
Step 4:  Org node management (add regions, chapters, tree view)
Step 5:  RBAC middleware + member management
Step 6:  Event CRUD + cascade logic
Step 7:  Calendar view component
Step 8:  RSVP + conflict detection
Step 9:  Dashboard pages
Step 10: Notifications
```

Steps 1–6 are the functional MVP. Steps 7–10 complete the core product.
