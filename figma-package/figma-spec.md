Figma Spec — Frames & Interactions

Overview

This document maps the frames, components, and interactions to build the Figma file for the portfolio.

Frames (desktop master 1440px)

1. 01-Hero (1440 x 1024)
   - Layers: Background (animated particles), Mid-layer abstract shapes, Foreground content.
   - Content: Large "Tuhin Sarkar" display type, tagline, CTAs, social icons.
   - Interaction: Parallax for background layers; social icons reveal labels on hover.

2. 02-About (1440 x 900)
   - Content: Short bio, location, school card, interactive timeline (horizontal scroll on scroll/drag).
   - Interaction: Timeline nodes expand on hover with micro-animations.

3. 03-Education (1440 x 800)
   - Grid of cards with badges; each card flips or expands to reveal details.

4. 04-Projects (1440 x 1200)
   - Masonry grid + carousel; project cards with hover tilt and reveal actions.
   - Project detail overlay component (modal) with live link button.

5. 05-Publications (1440 x 900)
   - Journal layout: vertical cards with hover abstracts; click opens publication detail.

6. 06-Events (1440 x 800)
   - Timeline cards with roles and achievements.

7. 07-Art Gallery (1440 x 1000)
   - Full-bleed scrollable gallery with annotations on hover.

8. 08-Blog (1440 x 900)
   - Clean list with featured article on top.

9. 09-Contact (1440 x 700)
   - Contact form, donate CTA, footer with minimal nav.

Components

- Header (fixed): logo, minimal nav, hamburger for mobile.
- SocialIcon: vector icon + hover label.
- ProjectCard: image, title, tags, reveal actions.
- PublicationCard: title, DOI badge, hover abstract.
- TimelineNode: date, short title, expandable details.
- Modal: overlay, content, close.

Interaction Map (high level)

- Page load: Fade-in name, staggered tagline and CTAs.
- Scroll: Soft parallax; sections snap to center on scroll container (optional).
- ProjectCard hover: translateY(-6px), shadow intensify, show action buttons.
- Publication hover: slide-up abstract, DOI and download reveal.

Prototyping Tips

- Use Auto Layout for cards and responsive constraints.
- Create components with variants for default/hover/active states.
- Use Smart Animate for modal transitions and micro-interactions.

Exporting

- Export SVG placeholders at 2x and 1x for retina and web use.

Suggested Plugins

- Anima (for advanced micro-interactions)
- Motion
- Smart Animate helpers
- Figmotion

Interaction durations and easing in tokens (see design-tokens.md).
