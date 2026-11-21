# Taste boundary

- Invoke the installed Taste Skill only when designing `/`, the public landing/marketing hero (`app/page.tsx` and landing-only components).
- Use real, licensed photography, optimized and responsively sized. Keep a clear primary CTA above the fold at a 375px mobile viewport, with no login before value.
- Never invoke Taste for `/app`, `/metrics`, their components, or shared layouts/styles that would restyle those surfaces. Keep product and metrics UI functional, fast, and consistent with the existing shell.
- Check whether Taste is installed; if missing, say so and ask before installing anything. Do not invent a skill path or read the excluded `.taste-skill/` directory to bypass permissions.
