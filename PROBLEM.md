# ChapterSync — Problem Definition & Solution Outline

## The Problem

Global non-profit and not-for-profit organizations (think Rotary International, Red Cross, Habitat for Humanity, Scouts, Lions Club, etc.) operate through a **hub-and-spoke model**: one global/national headquarters coordinating hundreds or thousands of local chapters across cities, regions, and countries.

### Calendar Coordination is Broken

**1. Fragmented Scheduling**
Each local chapter manages its own calendar — often in Google Calendar, Outlook, spreadsheets, or even WhatsApp groups. There is no single source of truth. Global HQ has no real-time visibility into what local chapters are planning.

**2. Conflicting Events**
Without cross-chapter visibility, chapters in the same region schedule overlapping events — competing for the same volunteers, donors, and community attention. A regional fundraiser might clash with a chapter's annual gala 30 miles away.

**3. Top-Down Mandates Get Lost**
When global HQ announces a worldwide campaign (e.g., "Global Day of Service — March 15"), the message trickles down through email chains and PDFs. Local chapters must manually block the date, and many miss it or interpret it differently. There's no mechanism to propagate a global event down to every chapter's calendar automatically.

**4. Bottom-Up Reporting is Manual**
HQ needs to know what's happening on the ground — how many events each chapter is running, attendance, regional coverage gaps. Today this requires manual surveys, spreadsheets, and weeks of back-and-forth.

**5. Timezone & Locale Chaos**
A global org spanning 40+ countries deals with timezone math, date format differences, and language barriers. Scheduling a global town hall that works for chapters in Tokyo, Nairobi, and São Paulo is a recurring headache.

**6. Volunteer & Resource Double-Booking**
Shared resources — guest speakers, mobile equipment, regional staff — get double-booked because chapters can't see each other's schedules. There's no concept of "shared resource availability" across chapters.

**7. Permission Confusion**
Who can create events? Who can modify the regional calendar? Can a local chapter president override a national directive? Most orgs solve this with "ask someone on Slack," not with actual access controls.

---

## The Need

A purpose-built platform that:

- Gives **global HQ a bird's-eye view** of all chapter activity
- Lets **local chapters manage their own calendars** without friction
- **Propagates global events downward** automatically
- **Surfaces conflicts** before they happen (same region, same date, shared resources)
- Provides **role-based access control** that mirrors the org's actual hierarchy
- Handles **timezones, locales, and languages** natively
- Generates **reports and dashboards** without manual data collection
- Is **simple enough** that volunteer-run chapters with limited tech skills can use it

---

## The Solution: ChapterSync

A web application designed specifically for hierarchical organizations to synchronize calendars across global, regional, and local levels.

### Core Architecture

```
Global HQ
  └── Region (e.g., North America, EMEA, APAC)
        └── District / State / Country
              └── Local Chapter
```

The org hierarchy is configurable — some orgs have 2 levels (global → local), others have 5+. The system adapts.

---

### Key Features

#### 1. Hierarchical Calendar System
- **Each node in the hierarchy gets its own calendar**
- Events cascade downward: a global event automatically appears on every chapter's calendar (marked as "HQ Event")
- Chapters can add local events that roll up into regional/global dashboards
- Filter views: "Show me everything in the Southeast US region for Q2"

#### 2. Smart Conflict Detection
- When a chapter creates an event, the system checks:
  - Same-region events on the same date
  - Shared resource availability (speakers, venues, equipment)
  - Proximity conflicts (two chapters within X miles on the same day)
- Conflicts surface as warnings, not hard blocks — chapters retain autonomy

#### 3. Role-Based Access Control (RBAC)

| Role | Scope | Permissions |
|------|-------|-------------|
| **Global Admin** | Entire org | Full control. Create global events, manage hierarchy, assign roles, view all data |
| **Regional Director** | Their region + children | Create regional events, view/approve chapter events, manage regional roles |
| **Chapter President** | Their chapter | Create/edit chapter events, view regional + global calendars, request resources |
| **Chapter Coordinator** | Their chapter | Create/edit chapter events, limited to own chapter view |
| **Member** | Their chapter | View-only access to chapter + parent calendars, RSVP to events |
| **Observer** | Configurable | Read-only access to specified scope (for board members, auditors, partners) |

**Key RBAC principles:**
- Permissions inherit downward (a Regional Director sees everything in their region)
- No lateral access by default (Chapter A can't edit Chapter B's calendar)
- Scope is always explicit — every role is bound to a node in the hierarchy
- Custom roles supported for orgs with unique structures

#### 4. Event Types & Workflows
- **Global Mandate**: Created by HQ, pushed to all chapters, cannot be removed locally
- **Regional Event**: Created at region level, visible to chapters in that region
- **Chapter Event**: Created locally, visible to the chapter + rolls up to dashboards
- **Draft / Pending Approval**: Chapters can submit events for regional approval before publishing
- **Recurring Events**: Support for weekly meetings, monthly board calls, annual galas

#### 5. Resource Management
- Shared resources (guest speakers, mobile units, branded materials) are registered globally
- Chapters request resources when creating events
- The system shows availability and prevents double-booking
- Regional directors can arbitrate conflicts

#### 6. Timezone-Aware Scheduling
- Every chapter has a home timezone
- All events display in the viewer's local time
- Global events show a timezone picker with "suggested times" that maximize chapter coverage
- iCal/Google Calendar sync exports in the correct timezone

#### 7. Dashboards & Reporting
- **Global Dashboard**: Total events by region, chapter activity heatmap, upcoming global events
- **Regional Dashboard**: Chapter engagement scores, event density, conflict alerts
- **Chapter Dashboard**: Upcoming events, RSVPs, tasks, announcements from HQ
- **Export**: CSV, PDF reports for board meetings and grant applications

#### 8. Notifications & Communication
- Push/email notifications for: new global events, conflict warnings, approval requests, reminders
- Digest emails: weekly summary of upcoming events at your level
- Announcement channel: HQ can broadcast messages alongside calendar events

#### 9. Integration Points
- **Calendar Sync**: Two-way sync with Google Calendar, Outlook, Apple Calendar (via CalDAV/iCal)
- **Communication**: Slack/Teams/Discord webhooks for event notifications
- **CRM**: Optional integration with donor/volunteer management systems
- **SSO**: SAML/OIDC for orgs with existing identity providers

---

### Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js (App Router) + TypeScript | SSR for performance, React ecosystem, great DX |
| **UI** | Tailwind CSS + shadcn/ui | Rapid, consistent UI. Accessible components |
| **Calendar UI** | Custom built on @fullcalendar or similar | Full control over hierarchy-aware rendering |
| **Backend** | Next.js API Routes + tRPC or REST | Unified codebase, type-safe API layer |
| **Database** | PostgreSQL | Relational model fits hierarchical data well (adjacency list / materialized path) |
| **ORM** | Drizzle or Prisma | Type-safe queries, migrations |
| **Auth** | NextAuth.js (Auth.js) | Flexible providers, session management |
| **RBAC** | Custom middleware + CASL or similar | Fine-grained, hierarchy-aware permissions |
| **Real-time** | Server-Sent Events or WebSockets | Live conflict alerts, calendar updates |
| **File Storage** | S3-compatible (R2, S3) | Event attachments, exports |
| **Hosting** | Vercel or self-hosted | Easy deployment, edge functions for global perf |
| **CI/CD** | GitHub Actions | Automated testing, preview deploys |

---

### Data Model (Simplified)

```
Organization
  ├── id, name, slug, settings

OrgNode (hierarchical unit — HQ, region, chapter, etc.)
  ├── id, org_id, parent_id, name, level, timezone, metadata
  └── Adjacency list with materialized path for fast ancestor/descendant queries

User
  ├── id, email, name, avatar, preferences

UserRole (RBAC binding)
  ├── user_id, org_node_id, role
  └── A user can hold different roles at different nodes

Event
  ├── id, org_node_id, created_by, title, description
  ├── start_time (UTC), end_time (UTC), timezone, recurrence_rule
  ├── type: global_mandate | regional | chapter | draft
  ├── visibility: public | members_only | leadership_only
  └── cascade_down: boolean (should child nodes see this?)

EventResource
  ├── event_id, resource_id, status (requested | confirmed | denied)

Resource
  ├── id, org_id, name, type, home_node_id, availability_rules

RSVP
  ├── event_id, user_id, status (going | maybe | declined)

Notification
  ├── id, user_id, type, payload, read_at
```

---

### MVP Scope (Phase 1)

1. **Org hierarchy setup** — Create org, define levels, add chapters
2. **User auth & RBAC** — Sign up, invite members, assign roles with proper scoping
3. **Calendar CRUD** — Create/edit/delete events at any level
4. **Event cascade** — Global/regional events appear on chapter calendars
5. **Conflict detection** — Same-region, same-date warnings
6. **Basic dashboard** — Event counts, upcoming events, chapter activity
7. **Timezone handling** — All times stored UTC, displayed in user's local time
8. **Responsive UI** — Works on desktop and mobile (volunteer coordinators are often on phones)

### Phase 2
- Resource management & booking
- Google/Outlook calendar sync
- Approval workflows
- Notification system (email + in-app)
- Reporting & CSV export

### Phase 3
- SSO / SAML integration
- Multi-language support (i18n)
- Public event pages (for community visibility)
- Mobile app (React Native or PWA)
- API for third-party integrations

---

### What Makes This Different

Most calendar tools (Google Calendar, Calendly, Teamup) are designed for **flat teams** or **individual scheduling**. They break down when:

- You need **hierarchical visibility** (global sees all, local sees own + parent)
- **Permissions must follow org structure**, not just "editor" vs "viewer"
- Events need to **cascade through levels** without manual duplication
- You need **cross-chapter conflict detection** based on geography
- The users are **volunteers with varying tech literacy**, not paid employees

ChapterSync is purpose-built for this organizational shape.
