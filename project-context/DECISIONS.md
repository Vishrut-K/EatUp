# EatUp — Architecture & Technical Decisions (ADR)

## ADR-001: Technology Stack Constraint Compliance
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** Project evaluation requires raw HTML5, CSS3, Vanilla JS, and Browser LocalStorage. Absolutely no frameworks, CSS libraries, build tools, or backend.
- **Decision:** All interactivity will be built using modern native Vanilla JS (ES Modules / standard script tags). CSS will use native CSS custom properties (variables), CSS Grid, and Flexbox for responsive layouts without Tailwind or Bootstrap.
- **Consequences:** Easy for evaluators to review, zero installation/build steps, instant loading on any browser.

## ADR-002: Single-Page Application (SPA) via State & View Switching
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** The application has distinct zones: Landing Page, Login/Signup, Main Ordering View, Restaurant Menu View, Checkout, and Order History. Using multiple separate `.html` files can cause state loss (unless constantly rehydrating and syncing query params/localStorage) and jarring page flickers during an evaluation demo.
- **Decision:** Implement a clean, single-page view architecture within `index.html`. Active views are toggled cleanly via CSS classes / data attributes (e.g. `data-view="landing"`, `data-view="app"`, `data-view="restaurant"`, `data-view="orders"`), while modals handle quick interactions (like Auth modal or Quick Cart drawer/modal). The URL hash (e.g. `#/`, `#/explore`, `#/restaurant/:id`, `#/orders`) will sync with the view state so browser back/forward buttons work naturally.
- **Alternatives Rejected:**
  - *Multiple HTML files (`login.html`, `app.html`, etc.):* Causes frequent page reloads and disconnects smooth animations and cart persistence verification during live evaluator demos.

## ADR-003: LocalStorage Schema and Fail-Safe Seeding
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** Evaluators need to test login, add to cart, and checkout immediately without mandatory complex manual account registration.
- **Decision:**
  - Create a dedicated `storage.js` helper module that manages structured keys:
    - `eatup_users`: Array of user objects `{ id, name, email, password }`.
    - `eatup_session`: Current logged-in user `{ id, name, email }` or `null`.
    - `eatup_cart`: Cart object `{ restaurantId, restaurantName, items: [{ id, name, price, qty, isVeg, image }] }`.
    - `eatup_orders`: Array of historical placed orders.
  - Automatically seed a default demo user (`demo@eatup.com` / `password123`) and a "Quick Demo Login" button on the auth screen.
- **Consequences:** Frictionless evaluation, robust error handling against corrupted storage, easy reset capability.

## ADR-004: Visual Identity and Design System (Superseded by ADR-005)
- **Date:** 2026-10-28
- **Status:** Superseded by ADR-005
- **Context:** Initial design used food orange palette.

## ADR-005: Distinctive Brand Identity & UI Polish (Culinary Jade & Warm Amber)
- **Date:** 2026-10-28
- **Status:** Accepted
- **Context:** Moving away from standard aggregator color schemes (Swiggy orange `#FC8019`, Zomato red `#E23744`) to create a distinctive, upscale, and gourmet visual brand. Eliminating meta college-demo text and awkward UI floaters.
- **Decision:**
  - **New Palette:**
    - Primary Brand: Deep Culinary Jade / Forest Emerald (`#0D7A53`, hover: `#086041`, light: `#EBF7F1`). Evokes freshness, gourmet taste, and premium culinary artistry.
    - Secondary Accent: Warm Sunlit Honey Amber (`#D9822B` / `#E5A93C`).
    - Surface & Background: Warm Alabaster (`#F7FAF8` and `#FFFFFF`).
    - Text: Crisp Charcoal Slate (`#111827`) and Muted Olive-Slate (`#4B5563`).
  - **UI Refinements:**
    - Removed floating badge on hero image for a cleaner, editorial presentation.
    - Set location to prominent North India hub: Connaught Place, Central Delhi & Delhi NCR.
    - Fixed categories carousel cropping by expanding top and bottom container clearance.
    - Replaced all meta/college/evaluation jargon in the user-facing UI with genuine consumer-focused propositions (Hygiene Verified, Lightning Delivery, Curated Excellence).

