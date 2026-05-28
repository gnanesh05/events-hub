# Events Hub — UI/UX Refinement Plan

## Design Direction

**Feel:** Creative, futuristic, immersive. The app should feel like it belongs in 2030.

**References:** Linear's depth + Vercel's precision + a neon-drenched creative edge.

**Existing identity to preserve and amplify:**
- Dark theme (`#030708` base)
- Prism animated background
- Teal/cyan primary (`#59deca`)
- Glassmorphism panels
- `Schibsted Grotesk` + `Martian Mono` font pairing

**Principles:**
- Depth over flatness — layers, blur, glow
- Motion with purpose — micro-interactions, not decoration
- Neon restraint — accents glow, backgrounds stay dark
- Bold type, quiet chrome
- Every screen should feel intentionally designed

---

## Phase 1 — Design Foundation
> **Status: [~] In progress**

Build the visual system everything else inherits from.

### Typography Scale
Define and apply consistently across all pages:

| Token | Style | Usage |
|---|---|---|
| `hero` | 5xl–6xl, bold, text-gradient | Landing h1 |
| `page-title` | 3xl, semibold | Dashboard, /events h1 |
| `section-title` | 2xl, semibold | Card sections, sidebars |
| `card-title` | xl, medium | Event card titles |
| `body` | base, regular | Descriptions, paragraphs |
| `meta` | sm, light, muted | Date, location, tags |
| `caption` | xs | Timestamps, counts |

### Spacing System
Codify in `globals.css` as utilities:

| Utility | Value | Usage |
|---|---|---|
| `.page-section` | `py-20` | Top-level section padding |
| `.card-padding` | `p-6` | All cards |
| `.gap-layout` | `gap-10` | Grid gaps |
| `.gap-content` | `gap-6` | Within cards |
| `.gap-tight` | `gap-3` | Label/input, inline items |

### Layout Primitives
- `<PageHeader>` — title + subtitle, centered, consistent spacing
- `<Section>` — wrapper with standard vertical padding
- `<Container>` — `max-w-7xl mx-auto px-6`

---

## Phase 2 — Event Card Redesign
> **Status: [ ] Not started**

Highest visual impact. This is what users see most.

### Visual Enhancements
- Fixed aspect ratio image with `object-cover`
- Hover: subtle upward translate (`-translate-y-1`) + glow shadow in primary colour
- Image overlay gradient (bottom fade) for title legibility
- Primary-coloured left accent border on hover

### Information Hierarchy
1. Image (full width, fixed ratio)
2. Title (xl, semibold, 2-line clamp)
3. Date + Location (sm, muted, icon-prefixed)
4. Mode badge (`Online` / `Offline` / `Hybrid`) — pill, colour-coded
5. Availability indicator — `X spots left` or `Full` in teal/red

### Futuristic Touches
- Thin neon border on hover (`border-primary/40`)
- `backdrop-blur` on metadata row overlaid on image
- Glowing dot indicator for upcoming events

---

## Phase 3 — Navbar Refinement
> **Status: [ ] Not started**

### Missing
- [ ] Mobile navigation menu (hamburger → slide-in drawer)
- [ ] Active route indication (current page highlighted)
- [ ] Session loading skeleton (replace "Loading..." text)

### Enhancements
- [ ] Subtle glow on logo on hover
- [ ] Notification bell pulse animation on new unread
- [ ] Smoother dropdown open/close transition (fade + scale)
- [ ] Account dropdown shows user email as subtitle under name

---

## Phase 4 — Hero Section
> **Status: [ ] Not started**

### Current Issues
- Too static, weak CTA emphasis, content too wide

### Improvements
- Constrain headline to `max-w-3xl`
- Add event count stat (`X events listed`, `X upcoming this month`)
- CTA button: glow effect, arrow animation on hover
- Optional: floating event count badges as decorative elements

### Futuristic Additions
- Animated tag cloud or category pills below CTA
- Subtle grid/scanline texture overlay on hero section

---

## Phase 5 — Form Experience
> **Status: [ ] Not started**

Applies to: Create Event, Edit Event, Login, Sign Up.

### Add
- [ ] Inline field validation (on blur, not just on submit)
- [ ] Character counts on text areas
- [ ] Smooth error message entrance animation
- [ ] Input focus glow (`ring-primary/40`)
- [ ] Disabled submit state while pending
- [ ] Field-level success indicator (subtle green tick after valid input)

### Visual Polish
- [ ] Consistent label spacing across all forms
- [ ] Section headers in Create/Edit form get futuristic divider lines
- [ ] Form cards get stronger `border-primary/30` glow on focus-within

---

## Phase 6 — Booking Flow Polish
> **Status: [ ] Not started**

### Improve
- [ ] Booking confirmation: animated success card (checkmark with glow)
- [ ] Seat availability bar: visual progress `slotsBooked / bookingSlots`
- [ ] Optimistic UI: immediate feedback before server response
- [ ] Cancel booking: confirmation step with warning styling

### Futuristic Touches
- Availability bar glows red as seats fill up
- Booking success: brief particle/confetti burst

---

## Phase 7 — Empty & Loading States
> **Status: [ ] Not started**

Every empty or loading screen needs to feel designed.

### Empty States Needed
| Screen | Icon | Message | CTA |
|---|---|---|---|
| No events on /events | Calendar icon | "No events yet" | — |
| Search no results | Search icon | "No events match your filters" | Clear filters |
| Dashboard no bookings | Ticket icon | "You haven't registered for any events" | Browse events |
| Organiser no events | Sparkles icon | "You haven't created any events" | Create event |

### Skeleton States
- [ ] Event card skeleton (image placeholder + lines)
- [ ] Navbar session skeleton
- [ ] Dashboard event list skeleton
- [ ] Notification dropdown skeleton

---

## Phase 8 — Micro-interactions & Motion
> **Status: [ ] Not started**

Purposeful motion that makes the app feel alive.

### Add
- [ ] Page transition fade (subtle opacity on route change)
- [ ] Tag chip toggle: scale bounce on select
- [ ] Notification bell: shake animation on new notification
- [ ] Button press: subtle scale-down on active
- [ ] Card entrance: staggered fade-in on grid load
- [ ] Toast entrance: slide + fade from bottom

### Rules
- Max duration: `300ms`
- Prefer `transform` and `opacity` (GPU-accelerated)
- Respect `prefers-reduced-motion`

---

## Phase 9 — Mobile Experience
> **Status: [ ] Not started**

### Fix
- [ ] Navbar: hamburger menu for mobile
- [ ] Search filters: stack vertically on mobile, scrollable tag chips
- [ ] Event card grid: single column on mobile with full-width cards
- [ ] Dashboard: tab bar at bottom on mobile
- [ ] Forms: full-width inputs, larger touch targets (`min-h-[44px]`)
- [ ] Notification dropdown: full-width on mobile

### Check
- [ ] All touch targets ≥ 44x44px
- [ ] No horizontal scroll on any page
- [ ] Modals/dropdowns don't overflow viewport

---

## Phase 10 — Component System Cleanup
> **Status: [ ] Not started**

Extract patterns that have emerged from feature work.

### Create
- [ ] `<Badge>` — mode, status, tags (colour variants)
- [ ] `<Button>` — primary, secondary, destructive, ghost variants
- [ ] `<EmptyState>` — icon + message + optional CTA
- [ ] `<PageHeader>` — title + subtitle
- [ ] `<AvailabilityBar>` — slot fill indicator

### Audit
- [ ] Remove duplicate Tailwind class patterns
- [ ] Consolidate card styles under `.event-card` in globals.css
- [ ] Ensure all interactive elements have consistent hover/focus states

---

## Completed
> Move items here as they ship.

- [x] Participant dashboard (upcoming/past tabs)
- [x] Organiser dashboard (edit/delete with icon overlay)
- [x] Notification system (bell, unread badge, 30-day TTL)
- [x] Search + filters on /events (typeahead, date, location, mode, tags)
- [x] Edit event page (repurposed CreateEventForm)
- [x] Delete event with cascade booking cleanup
- [x] Fix bg-clip-text bottom clipping on h1
- [x] Router cache fix for CreateEventForm success toast

---

## Notes
- Update this file at the start and end of each phase
- Phases can overlap — no strict sequential order required
- Always mobile-test before marking a phase complete
- Keep Prism background — it anchors the futuristic identity
