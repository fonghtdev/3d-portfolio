# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server with `--host` for local/network testing.
- `npm run build` — run TypeScript project build checks, then create the production Vite bundle.
- `npm run lint` — run ESLint across the project.
- `npm run preview` — serve the production build locally after `npm run build`.

There is currently no configured test runner or test script in `package.json`, so there is no repository-specific command for running all tests or a single test file yet.

## Architecture

This is a React 18 + TypeScript + Vite single-page 3D portfolio. `src/main.tsx` renders `App`, and `src/App.tsx` wraps the app in `LoadingProvider` while lazy-loading both the main page composition and the character scene.

`src/components/MainContainer.tsx` is the page shell. It mounts persistent UI (`Cursor`, `Navbar`, `SocialIcons`), then composes the one-page sections in order: `Landing`, `About`, `WhatIDo`, `Career`, `Work`, desktop-only `TechStack`, and `Contact`. It also controls the desktop breakpoint at `window.innerWidth > 1024`; the character scene is rendered globally on desktop and inside the landing section on smaller screens.

Loading and intro animation are coupled. `LoadingProvider` owns the global loading state and renders `Loading` until the 3D character pipeline reports completion. `Loading` uses `setProgress()` to animate the percent display, then dynamically imports `initialFX()` from `src/components/utils/initialFX.ts`, which unpauses the GSAP `ScrollSmoother`, restores page scrolling, and starts the landing/nav intro animations.

Smooth scrolling is initialized in `src/components/Navbar.tsx`. It registers GSAP `ScrollSmoother`/`ScrollTrigger`, exports the module-level `smoother`, pauses it during loading, and intercepts nav link clicks on desktop to scroll to section anchors. Code that uses `smoother` assumes `Navbar` has mounted first.

Most scroll/text animation behavior lives in `src/components/utils/`. `splitText.ts` registers GSAP `SplitText`, `ScrollTrigger`, and `ScrollSmoother` for `.para` and `.title` elements, while `GsapScroll.ts` drives the character/camera timelines and section transitions. Many timelines target CSS class names directly, so class renames in TSX must be coordinated with both CSS and GSAP selectors.

The main character scene in `src/components/Character/Scene.tsx` uses imperative Three.js, not React Three Fiber. `utils/character.ts` decrypts `/models/character.enc?v=2` using Web Crypto, loads it with `GLTFLoader` and the Draco decoder in `public/draco/`, compiles it against the renderer/camera/scene, then starts character and page scroll timelines. Supporting utilities handle lighting/HDR environment setup, resize timeline refresh, mouse/touch head tracking, and filtered animation clips using bone lists from `src/data/boneData.ts`.

`src/components/TechStack.tsx` is separate from the main character scene and uses React Three Fiber with Rapier physics. It is lazy-loaded only on desktop and activates its physics behavior based on scroll position after the Work section.

Static assets are served from `public/`. Key runtime assets include `public/models/character.enc`, `public/models/char_enviorment.hdr`, `public/draco/`, and images used by Work/TechStack. The README notes this project uses the standard `gsap` package rather than `gsap-trial`.
