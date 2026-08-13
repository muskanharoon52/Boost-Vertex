# Boost Vertex — React Front End

This package contains the completed Boost Vertex Figma recreation as a React/Vite front end. The implementation lives under `client/`, with the page source in `client/src/pages/Home.tsx`, the responsive visual system in `client/src/index.css`, and the exported Figma assets in `client/public/`.

## Run locally in VS Code

Open this folder in VS Code, open the integrated terminal, and run:

```bash
npm install --include=dev
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). This archive uses npm commands only.

## Production build

```bash
npm run check
npm run build
npm run preview
```

The project is front-end focused and does not require environment variables for the visual recreation. Form, CTA, and Fast Track controls currently expose semantic interaction boundaries so they can be connected to a backend later. The project also includes `client/src/services/`, shared API types, `backend/` integration documentation, and `docs/env.example` for the future service layer.

## Frontend/backend-ready structure

The React page remains under `client/`. Browser-side requests should go through `client/src/services/` instead of being placed directly in components. Shared payload contracts live in `client/src/types/`, while `backend/` documents the future API, integrations, and persistence boundaries without adding a backend dependency to the current visual package.

To point the future frontend at an API server, copy `docs/env.example` to `.env.local` and set:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

See `docs/architecture.md` and `backend/api/README.md` for the planned routes and folder responsibilities.

## Main files

| File | Purpose |
| --- | --- |
| `client/src/pages/Home.tsx` | React page markup, interaction state, and section reveal observer |
| `client/src/index.css` | Figma-matched layout, colors, typography, responsive rules, hover states, and motion |
| `client/src/App.tsx` | App entry and page shell |
| `client/index.html` | Font imports, title, and document metadata |
| `client/public/` | Local Figma-exported SVG, WebP, and PNG assets |
| `package.json` | Local development and build scripts |
| `client/src/services/` | Future backend/API request adapters |
| `client/src/types/` | Shared frontend request/response contracts |
| `backend/` | Future backend/API structure and route documentation |
