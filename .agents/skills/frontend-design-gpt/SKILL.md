---
name: frontend-design-gpt
description: Create distinctive, production-grade frontend interfaces with high design quality, specifically tuned for GPT models. Use this skill when asked to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that actively counteracts GPT's default aesthetic tendencies.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid GPT's characteristic design defaults. Implement real working code with strong aesthetic intention and creative discipline.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context, then actively reject GPT's defaults and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. Commit to one and execute it with precision.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: GPT's natural output is safe, predictable, and structurally identical across projects. The antidote is intentionality — every color, font, spacing, and layout choice must have a reason. Bold maximalism and refined minimalism both work; generic does not.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: GPT defaults to Inter, Roboto, or system fonts — never use these. Choose fonts that are beautiful, distinctive, and contextually appropriate. Always pair a characterful display font with a refined body font. The font choice should feel like it was picked by a designer who understood the project, not selected from a list of safe options.

- **Color & Theme**: GPT defaults to purple-on-white gradients or muted gray corporate palettes, especially `#6366f1` indigo — avoid these entirely. Commit to one dominant color and build the entire palette around it using tints, shades, and transparencies. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Use CSS variables for full consistency.

- **Composition Against Boxes**: GPT's most persistent failure is wrapping every element in a card: `border-radius + box-shadow + padding + background` applied universally. This produces a soulless dashboard aesthetic. Instead, use whitespace, typographic hierarchy, single-side borders, and background color shifts to separate content. Reserve visual containers only for genuinely interactive elements like inputs or modals.

- **Layout**: GPT defaults to symmetric 3- or 4-column grids for everything. Break this entirely — use asymmetric proportions, deliberate size contrast between elements, overlapping layers, and grid-breaking moments. Design the page as a composition, not a stack of equal-weight sections. One dramatic typographic anchor, one full-viewport moment, or one element that defies the container creates more impact than six identical columns.

- **Motion**: GPT's default animation is `opacity 0→1 + translateY(20px→0)` applied uniformly to every element. This is the most overused animation pattern in AI-generated UI. Use instead: clip-path text reveals, blur-to-sharp transitions, scale-from-center entrances, staggered character animations for headlines, or horizontal slides for panels. Prioritize CSS-only solutions for HTML. One well-orchestrated page-load sequence creates more delight than scattered identical micro-interactions.

- **Backgrounds & Visual Details**: Never default to a flat solid color. Create atmosphere and depth through gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, or grain overlays. The background should feel intentional, not like the absence of a design decision.

NEVER produce GPT's characteristic aesthetic signature: Inter or Roboto as the only font, purple gradients on white, uniform rounded cards for all content, symmetric multi-column grids as the primary structure, and `translateY + opacity` as the only animation. These patterns make the output immediately identifiable as undesigned AI output.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different font personalities, and distinct aesthetic directions. No two designs should feel the same.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate animations and layered effects. Minimalist designs need restraint, precision, and obsessive attention to spacing and typography. Elegance comes from executing the vision well, not from adding decorative elements to a GPT-default layout.

The goal is not to decorate a generic structure — it is to design something a person would remember.
