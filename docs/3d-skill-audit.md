# 3D and UI skill audit

**Requested source:** [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)

The repository was cloned and inspected at commit `1da73febff0c3e1dfefc07f8a5ef8f7d1dfdb6cd`. Its root includes Claude-oriented skill files and plugin bundles; duplicated skill listings in the prompt resolve to **22 unique skills**. Every listed skill was inventoried by name and source path. The implementation-specific skill documents, references and examples were read for the selected stack; alternative engines and authoring tools were assessed for applicability. The original Claude commands and agents were not invoked or represented as native Codex commands.

## Individual skills

All 22 names are present in the active Codex global skill catalog. The GitHub clone was an audit source only: no skills were copied from it into this project. None of the 22 are project-local under `.agents/skills/` in this workspace. Source paths below are the upstream repository's `.claude/skills/<name>/SKILL.md` files.

| Skill | Codex catalog / project install | Relevance and disposition |
|---|---|---|
| `threejs-webgl` | Global: available; project-local: no | Used. Geometry, materials, lighting/shadows, render cost and disposal guidance informed the globe scene. |
| `react-three-fiber` | Global: available; project-local: no | Used. R3F lifecycle, `useFrame` mutation, controls, lazy rendering and cleanup guidance informed the hero/story canvases. |
| `gsap-scrolltrigger` | Global: available; project-local: no | Used. ScrollTrigger progress binding, lifecycle context cleanup and reduced-motion considerations informed the narrative. |
| `motion-framer` | Global: available; project-local: no | Reviewed. Alternative React animation layer; not added because GSAP already handles the required scroll scene and duplicate animation systems were unnecessary. |
| `lightweight-3d-effects` | Global: available; project-local: no | Reviewed. Useful for lightweight decorative 3D, but the request calls for a genuine Three.js scene; not used as a substitute. |
| `babylonjs-engine` | Global: available; project-local: no | Reviewed. Alternative engine; not adopted because the existing site is React and Three.js/R3F fit the brief. |
| `playcanvas-engine` | Global: available; project-local: no | Reviewed. Alternative runtime/editor path; no need to add a second 3D engine. |
| `aframe-webxr` | Global: available; project-local: no | Reviewed. WebXR was outside the requested browser experience; not adopted. |
| `locomotive-scroll` | Global: available; project-local: no | Reviewed. Smooth-scroll system was not added; native scrolling avoids competing with ScrollTrigger and accessibility preferences. |
| `barba-js` | Global: available; project-local: no | Reviewed. Page-transition framework was not needed for this Next.js App Router site. |
| `react-spring-physics` | Global: available; project-local: no | Reviewed. Alternative physics animation; not added alongside GSAP. |
| `animejs` | Global: available; project-local: no | Reviewed. Alternative animation engine; not added alongside GSAP. |
| `lottie-animations` | Global: available; project-local: no | Reviewed. No authored vector animation asset was needed; not added. |
| `spline-interactive` | Global: available; project-local: no | Reviewed. External scene-authoring workflow not required; bespoke R3F geometry keeps the scene integrated and code-owned. |
| `rive-interactive` | Global: available; project-local: no | Reviewed. State-machine vector animation not needed for the 3D globe or service interaction. |
| `pixijs-2d` | Global: available; project-local: no | Reviewed. 2D renderer is not appropriate for the required real 3D hero. |
| `modern-web-design` | Global: available; project-local: no | Used. Responsive hierarchy, accessibility and performance references informed the interface review and contrast adjustments. |
| `animated-component-libraries` | Global: available; project-local: no | Reviewed. No registry animation components were needed; kept interactions bespoke and limited. |
| `scroll-reveal-libraries` | Global: available; project-local: no | Reviewed. Reveal-only animations do not satisfy the requested 3D scroll progression; not used. |
| `blender-web-pipeline` | Global: available; project-local: no | Reviewed. No Blender asset pipeline was necessary for the procedural globe. |
| `substance-3d-texturing` | Global: available; project-local: no | Reviewed. No external texture painting or PBR asset was needed. |
| `web3d-integration-patterns` | Global: available; project-local: no | Used. Integration guidance informed the division between R3F scene animation and GSAP's scroll-progress control, cleanup and motion preferences. |

Each source file can be opened at `https://github.com/freshtechbro/claudedesignskills/blob/main/.claude/skills/<skill-name>/SKILL.md` by substituting the row's exact skill name. The source also includes mirrored `.factory/skills` and plugin-individual copies; these were not treated as separate skills.

## Requested bundles

All five directories exist under `plugins/bundles/`. The bundle README/manifest structure, skill references, scripts, examples and command definitions were inspected where present. Bundle contents are authoring guidance; their Claude command files are not executable as Codex slash commands.

| Bundle | Source | Inspection and use |
|---|---|---|
| `core-3d-animation` | [Bundle directory](https://github.com/freshtechbro/claudedesignskills/tree/main/plugins/bundles/core-3d-animation) | Inspected Three.js, R3F and GSAP skill references, examples and scripts. Applied stack-relevant scene, lifecycle and scroll guidance. The Babylon/Motion alternatives were not installed. |
| `extended-3d-scroll` | [Bundle directory](https://github.com/freshtechbro/claudedesignskills/tree/main/plugins/bundles/extended-3d-scroll) | Inspected bundle skills/commands and evaluated scroll/engine options. Native scrolling plus GSAP was selected; other engines/effects were not added. |
| `animation-components` | [Bundle directory](https://github.com/freshtechbro/claudedesignskills/tree/main/plugins/bundles/animation-components) | Inspected bundle membership and component/animation guidance. No extra animation library was required. |
| `authoring-motion` | [Bundle directory](https://github.com/freshtechbro/claudedesignskills/tree/main/plugins/bundles/authoring-motion) | Inspected bundle membership and the authoring pipeline purpose. No external authoring asset was needed. |
| `meta-skills` | [Bundle directory](https://github.com/freshtechbro/claudedesignskills/tree/main/plugins/bundles/meta-skills) | Read the modern-web-design and web3d integration guidance, including accessibility/performance and integration references. Applied the relevant guidance; did not run Claude-specific commands. |

## Codex skills used

- Global `threejs-webgl`, `react-three-fiber`, `gsap-scrolltrigger`, `modern-web-design`, and `web3d-integration-patterns` guidance informed the new scene and responsive story.
- The workspace's existing `.agents/skills` design guidance (`ui-ux-pro-max`, `ui-styling`, `design-system`) informed the visual audit. No fictitious skills were created and no upstream slash commands were claimed as active.
- Dependencies actually installed for the implementation: `@react-three/fiber`, `@react-three/drei`, and `gsap`; the existing `three` dependency was retained. Motion/Framer, other renderers, and scroll libraries were not added because they would duplicate the selected stack or solve a different requirement.

## Follow-up redesign skill pass — 2026-10-24

- `karpathy-guidelines` was found in the actual global catalog and its installed `SKILL.md` was read. The requested `andrej-karpathy-multi` name was not present, so it was not claimed or invoked. Applied the available guideline's root-cause-first investigation and focused-change approach.
- `frontend-design` and the workspace `ui-ux-pro-max` skill instructions were read and applied to the palette, responsive compositions and custom portfolio panels. The workspace also exposes `design-system`, `ui-styling`, and related design instructions; the semantic tokens follow their established project guidance.
- Three.js/R3F implementation guidance was applied again for the NASA-textured Earth sphere, material setup, geographic route geometry, marker interaction and asset lifecycle. The source texture and attribution are recorded under `public/textures/README.md`.
- The design brief contained `/skills` as a suggested discovery command; Codex exposes skills through its runtime catalog, and `/skills` is not a shell command. No pretend invocation or new skill installation was made.

## Source limits

Network access worked and the requested public GitHub repository was available. Skill content is authored for Claude Code (with Factory mirrors), so Codex-compatible implementation guidance was applied from the available skill documents and source references; commands that target Claude were intentionally not executed. The upstream repository was cloned under `/tmp` for inspection and is not part of the website deliverable.
