Here is the `DESIGN.md` specification for ZeBridge, mapping the structural inspiration from the provided SaaS design to a precise, modern aesthetic tailored for an AI tooling platform.

---

# ZeBridge Design Specification

## 1. Design Philosophy

ZeBridge employs a modern, minimalist SaaS aesthetic. The design language focuses on high contrast, clean typography, and seamless transitions to communicate speed, security, and cutting-edge AI integration. The layout utilizes atmospheric gradients and glassmorphism to create depth without relying on heavy shadows or cluttered borders.

## 2. Typography

The typography system prioritizes legibility, especially for technical terms, CLI commands, and dashboard metrics, while maintaining a highly polished corporate identity.

* **Primary Font (Headings & UI):** `Geist` or `Inter`. These sans-serif typefaces provide the clean, geometric structure required for a modern tech platform.
* **Secondary Font (Body & Subtitles):** `Satoshi`. Excellent for readable, slightly wider body copy.
* **Monospace Font (Code & CLI):** `Geist Mono` or `JetBrains Mono`. Used for all terminal previews, API endpoints, and MCP configurations.

## 3. Color Palette

The color system merges a professional foundation with vibrant, tech-forward accents, drawing directly from the spatial gradient style of the inspiration while maintaining a grounded, authoritative feel.

* **Background / Atmosphere:** Deep Blue to Navy gradients.
* `#0B0F19` (Deepest Navy) transitioning into `#1A233A`.


* **Primary Accent (The "Highlight" Color):** A vibrant, glowing green or electric teal to mirror the highlighted "System" block in the inspiration.
* `#4ADE80` (Vibrant Green) or `#38BDF8` (Electric Light Blue).


* **Surface / Cards:** Semi-transparent white or ultra-light gray for dashboard elements overlaying the dark gradient.
* `rgba(255, 255, 255, 0.95)` for solid dashboard backgrounds.


* **Text Colors:**
* Primary Text (Dark UI): `#FFFFFF`
* Secondary Text (Dark UI): `#94A3B8` (Slate)
* Primary Text (Light Cards): `#0F172A` (Dark Slate)



## 4. Visual Identity Elements

* **Logo:** A flat, minimalist vector logo. Clean lines without complex gradients in the mark itself to ensure it scales perfectly down to favicon or CLI icon sizes.
* **Iconography:** Line-based, consistent stroke weights (e.g., 1.5px to 2px). Functional and unembellished.
* **Shapes:** Generous border radiuses on main container cards (e.g., `24px` for the main dashboard preview), tighter radiuses on buttons and pill tags (e.g., `8px` or fully rounded `999px`).

## 5. Landing Page Architecture

The core layout structure maps the inspiration image to the specific needs of the ZeBridge product.

### Top Promo Banner

* **Style:** Thin, full-width colored bar at the absolute top.
* **Content:** "🎁 Secure your AI agents — Try ZeBridge free today"

### Navigation (Header)

* **Layout:** Floating, transparent background.
* **Left:** ZeBridge Logo (Flat Vector).
* **Center Links:** `Protocols`, `Supported Agents`, `Documentation`, `Pricing`, `About Zeppelin Labs`.
* **Right Auth:** `Sign In` (Text link), `Sign Up` (Solid white button with dark text).

### Hero Section

* **Pre-heading Pill:** A fully rounded badge with a subtle border and icon: `[Cloud Icon] Secure Model Context Protocol`.
* **Main Headline:** Massive, bold `Geist` text.
* *Example:* "Universal Tooling for"
* *Highlight Element:* "**AI Agents**" (Placed inside a solid accent-colored block with rounded corners, exactly like the "System" highlight in the inspiration).


* **Subheadline:** "Instead of generating temporary scripts, empower Claude, Codex, and Gemini to securely perform real-world tasks through a standardized interface."

### Trust / Integration Banner

* **Title:** "Seamlessly integrates with"
* **Logos:** Flat, monochrome, or subtly glowing logos of supported technologies: *Claude Code, Cursor, Windsurf, Gemini, REST, MCP.*

### The "App Preview" Window

* **Container:** A glassmorphic or solid, softly shadowed card emerging from the bottom of the hero gradient.
* **Content:** Instead of fleet statistics, this card showcases the ZeBridge web dashboard.
* **Left Sidebar:** Dark navy, showing menu items: `Dashboard`, `Active Agents`, `Tool Registry`, `Audit Logs`.
* **Main Area:** Light UI showing an active stream of an AI agent executing a secure task (e.g., "Agent 'Cursor' invoked tool 'Database_Query' - Status: Success").
* **Top Bar of Preview:** Search bar, User Profile, and an `Export Audit` button.



## 6. Interaction & Motion

* **Hover States:** Navigation links and buttons should have a crisp, fast color transition (150ms ease-in-out).
* **Scroll Reveal:** The dashboard preview card should gently slide up and fade in as the user scrolls down the page, emphasizing the transition from the "concept" (the hero text) to the "product" (the interface).