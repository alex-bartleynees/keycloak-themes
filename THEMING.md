# Keycloak theming with Keycloakify

This repo builds **Keycloak login themes** as a React + Vite project ([Keycloakify](https://keycloakify.dev) v11) and compiles them into a single theme **JAR**. One JAR can hold **multiple named themes** — one per product that shares our single Keycloak instance (`identity.alexbartleynees.com`), so each product gets its own branded login page while the underlying Keycloak stays vanilla.

- **Theme = per product** (e.g. `dopamine-kick`, `product-feedback`), not per realm. We only have two realms (`development`, `production`); the product a user logs into is selected by the **client's** login theme.
- **Styling is CSS-only** here. We keep Keycloak's default page components (`DefaultPage` + `Template`) and layer a per-theme stylesheet on top. No per-page React overrides are needed for brand matching.

---

## Repo layout

```
vite.config.ts              # declares the theme names (the themeName array)
src/login/
  KcPage.tsx                # entry: imports the theme CSS, renders DefaultPage for every page
  KcPageStory.tsx           # Storybook helper (createKcPageStory) — don't edit
  KcContext.ts, i18n.ts     # generated glue — don't edit
  dopamine-kick.css         # ← the brand layer for the dopamine-kick theme
  pages/*.stories.tsx       # Storybook stories used to preview pages offline
dist_keycloak/              # build output (gitignored): the theme JARs
```

## How a build works

`yarn build-keycloak-theme` runs `vite build` then `keycloakify build`, producing two JARs in `dist_keycloak/`:

| JAR | Use for |
| --- | --- |
| `keycloak-theme-for-kc-all-other-versions.jar` | **Keycloak 26.x — this is the one we deploy** |
| `keycloak-theme-for-kc-22-to-25.jar` | Keycloak 22–25 (not us) |

Each JAR contains **all** themes declared in `vite.config.ts` under `theme/<name>/login/…`.

### Running the build (NixOS)

This repo has a `flake.nix` providing Node, Yarn, Maven and a JDK (Keycloakify packages the JAR via Maven). With direnv it's automatic on `cd`; otherwise:

```bash
nix develop --command yarn install
nix develop --command yarn build-keycloak-theme
```

---

## Previewing with Storybook

Storybook renders every login page **offline** (no running Keycloak) so you can tune CSS fast:

```bash
nix develop --command yarn storybook   # http://localhost:6006
```

Stories live in `src/login/pages/*.stories.tsx` and are built from the `createKcPageStory` helper. The starter ships **without** any stories, so if Storybook looks empty, you just need to add story files (see the recipe below). You can pass a partial `kcContext` to a story to render specific states — e.g. the login page with an error banner:

```tsx
export const WithLoginError: Story = {
    render: () => (
        <KcPageStory kcContext={{ message: { type: "error", summary: "Invalid username or password." } }} />
    )
};
```

---

## Recipe: add a new product theme

Say you're adding `product-feedback`.

1. **Register the theme name** in `vite.config.ts`:
   ```ts
   themeName: ["dopamine-kick", "product-feedback"]
   ```

2. **Add its stylesheet** `src/login/product-feedback.css`. Easiest start: copy `dopamine-kick.css` and swap the `--dk-*` brand tokens (colours, gradient, font, radius) to match that app's `src/styles/theme.css`.

3. **Load the right CSS per theme** in `src/login/KcPage.tsx`. Important: Keycloakify builds a **single JS bundle shared by all themes** in the project, so a plain `import "./x.css"` at the top of `KcPage.tsx` loads that stylesheet for *every* theme. Because brand rules target the same selectors (`body`, cards, buttons…), statically importing two brand stylesheets makes the last one win for everyone. Instead, load by `kcContext.themeName`:
   ```tsx
   // top of KcPage.tsx
   import.meta.glob("./*.css"); // let Vite see all theme css files
   // inside KcPage, before render:
   useEffect(() => {
       import(`./${kcContext.themeName}.css`);
   }, [kcContext.themeName]);
   ```
   Or, if you prefer static imports, **scope each stylesheet** under a theme wrapper (e.g. prefix every rule with `body[class*="dopamine-kick"]`) so they can't collide.

   > **This switch is already made** (as of the `coffee-journal` theme, 2026-08-04): `KcPage.tsx` uses `import.meta.glob("./*.css")` + a `useEffect` that loads `./${kcContext.themeName}.css`. Both `dopamine-kick.css` and `coffee-journal.css` now load conditionally; there is no static brand `import` at the top of `KcPage.tsx` any more. New themes just drop in a `<name>.css` and get picked up automatically.

4. **Add stories** so you can preview it — create `src/login/pages/*.stories.tsx` for the pages you care about (login, register, reset). Copy an existing story and change the `pageId`/`title`. Valid `pageId`s are the Keycloak template names, e.g. `login.ftl`, `register.ftl`, `login-reset-password.ftl`, `login-update-password.ftl`, `info.ftl`, `error.ftl`.

5. **Build** — `yarn build-keycloak-theme` now emits both themes in the same JAR.

6. **Deploy + activate** (below).

---

## Common brand tweaks (learned so far)

These live in the theme's CSS. Keycloak renders default PatternFly markup; you override the visible surfaces.

- **Hide the realm name header** — Keycloak shows the realm display name (`development`/`production`) above the card in `#kc-header`. Those are infra names, not product branding, so:
  ```css
  #kc-header { display: none; }
  ```
- **Hide the language selector** — the locale dropdown (`#kc-locale`, shown when >1 language is enabled):
  ```css
  #kc-locale { display: none; }
  ```
- **Page background / card / inputs / primary button / links** — see the labelled sections in `dopamine-kick.css`; they target both `.pf-v5-c-*` (PatternFly 5) and legacy `.pf-c-*` selectors.
- **Browser tab title** still uses the realm name (`document.title` from `realm.displayName`) — that's not CSS. Change it via a realm display name in Keycloak admin or a `Template` override if it matters.

---

## Deploying to Keycloak

Our Keycloak is a vanilla `quay.io/keycloak/keycloak:26.4.7` StatefulSet deployed from the **portfolio-cluster** GitOps repo (`components/applications/workloads/keycloak/keycloak.yaml`), with no theme volume. To ship a theme, bake it into a custom image:

```dockerfile
FROM quay.io/keycloak/keycloak:26.4.7 AS builder
COPY keycloak-theme-for-kc-all-other-versions.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build
```

Then bump the `image:` tag in the portfolio-cluster Keycloak manifest.

## Activating a theme

In the Keycloak admin console, point each product at its theme:

- **Per client (preferred here):** the client → **Advanced** → **Login Theme** → `dopamine-kick`. This is what gives each product its own look even though they share a realm.
- **Per realm:** Realm settings → **Themes** → Login theme — applies to every client in the realm (use only if a realm is dedicated to one product).

---

## References

- Keycloakify docs — https://docs.keycloakify.dev
- Multiple themes in one project — https://docs.keycloakify.dev/theme-variants
- Storybook stories — https://docs.keycloakify.dev/testing-your-theme (Storybook section)
