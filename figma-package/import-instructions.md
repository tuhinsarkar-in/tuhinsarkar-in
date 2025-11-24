How to import the package into Figma

1. Open Figma and create a new file.
2. Create a top-level page named "Design System" and set up Color Styles and Text Styles using `design-tokens.md`.
3. Create a 1440px frame for the desktop master. Use 1180px as the centered content width inside constraints.
4. Import SVGs from `assets/` via File → Place Image or drag-and-drop.
5. Build components:
   - Header: Use Auto Layout horizontally with logo, nav, and social icons. Create variants for default and scrolled.
   - ProjectCard: Create component with Auto Layout, image, meta row, and action buttons hidden in the default variant. Create hover/selected variants.
6. Prototype interactions:
   - For hover states, create component variants and in Prototype mode link hover to the hover variant with Smart Animate.
   - For modals, link click to "Open overlay" and choose "Manual" close with Smart Animate.
7. Parallax:
   - Use three stacked layers in the background. On the prototype page, set them to move by different Y offsets on scroll via Smart Animate or Figmotion.
8. Export:
   - Right-click any SVG → Export; for web use @2x and @1x.

Suggested Figma plugins

- Motion
- Figmotion
- Anima
- Content Reel (for sample text)

Tips

- Keep animations subtle and test in "Present" mode.
- Use variants to avoid creating many duplicate frames for hover/active.
