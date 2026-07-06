---
name: ZCR useColors fix
description: How to safely access dark palette in useColors hook when colors object has a non-palette key (radius).
---

## The rule

Use direct property access in `useColors()`, not a full-object cast:

```ts
// GOOD
const palette = scheme === 'dark' && colors.dark ? colors.dark : colors.light;

// BAD — TS2352: radius key is not typeof colors.light
const palette = scheme === 'dark' && 'dark' in colors
  ? (colors as Record<string, typeof colors.light>).dark
  : colors.light;
```

**Why:** `colors` has a `radius: number` key alongside `light` and `dark`. Casting the whole object to `Record<string, typeof colors.light>` fails because `radius` is `number`, not `typeof colors.light`. Direct access sidesteps the cast entirely.

**How to apply:** Any time a new project adds non-palette keys (radius, spacing, etc.) to the colors constant alongside light/dark palettes, use direct property access in the hook, not a generic Record cast.
