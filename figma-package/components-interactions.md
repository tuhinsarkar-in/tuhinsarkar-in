Components & Interaction Spec — Tuhin Sarkar Portfolio

Purpose

Detailed component definitions, variants, and interaction mapping to implement the Figma file.

Global Layout

- Desktop frame: 1440px width, content container 1180px centered.
- Grid: 12-column grid, 24px gutters.
- Auto Layout orientation: vertical stacks for sections with 104px gaps.

Header

- Variants: default / scrolled
- Elements: left: monogram "TS" mark; center: nav (About, Work, Publications, Gallery, Blog, Contact); right: social icons (compact)
- Interaction: on scroll -> header reduces to 64px height, background blur, logo scales to 0.9.

Hero

- Layers: background particles (SVG, set as top layer with mask), abstract shapes (3 vector layers), foreground text block.
- Text block: Display name (Playfair Display, 96-120px), tagline (Inter, 20-22px), primary CTA "Explore" (accent), secondary CTA "Contact".
- Social vertical: floating social icons with hover labels.
- Interaction: on load staggered fade-in: name (0ms), tagline (140ms), CTAs (260ms). On mouse move: slight parallax (background translate 0-12px). Social icons reveal on hover.

ProjectCard

- Size: flexible, min width 340px
- Layers: image (placeholder), meta row (title, tags), hover actions (View, Live)
- Variants: default, hover, selected
- Hover interaction: elevation +6px translateY(-6px), show action buttons with fade and slight upward translate. Use Smart Animate.
- Click interaction: open ProjectDetail modal.

ProjectDetail (Modal)

- Layout: centered overlay (max-width 980px), large screenshot, description column, metadata (roles, tech stack), links (Live, Repo), close button.
- Motion: overlay fade-in (220ms), content scale from 0.98 to 1 with Smart Animate.

PublicationCard

- Layout: vertical compact card; thumbnail, title, authors, DOI badge.
- Hover: reveal abstract strip with slide-up (220ms). Buttons: Download, DOI link.

TimelineNode

- Layout: circular node + side panel
- Interaction: on hover expand side panel; on click pin details in a persistent right rail.

ArtGallery Tile

- Layout: full-bleed tiles, masonry grouping
- Hover: show title and small annotation; clicking expands a lightbox with annotations and playback for trailers.

Contact Form

- Fields: name, email, subject, message
- Micro-interactions: floating labels, subtle input focus glow, success state animation (checkmark burst)

Micro-interactions & Motion

- Use consistent easing and durations from design-tokens.md.
- Accessibility: reduce-motion variant for users who prefer reduced motion.

Spacing & Typography

- Provide explicit token sizes for headings and body for desktop/tablet/mobile.

Prototype mappings (Figma)

- Use component variants for hover/active states and prototype connections for interactions:
  - ProjectCard.default -> on hover -> ProjectCard.hover (Smart Animate)
  - ProjectCard.default -> on click -> ProjectDetail (Open Overlay)
  - PublicationCard.default -> on hover -> PublicationCard.hover

Notes

- Keep components atomic and reusable; build library page with component instances for quick replacement.
- Use the SVG placeholders in /assets/ to lay out the frames quickly.
