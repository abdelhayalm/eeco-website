# eeco

**Empowering evolutionary ecosystems.** A creative agency and movement founded by Hapi.

A responsive, self-contained website in English, Brazilian Portuguese and Egyptian Arabic. Its story connects the agency’s strategy, brand and digital work with Carmen, Alquimia and Kemet.

## Project structure

- `source/template.html` — semantic markup with readable English fallback.
- `source/style.css` — brand palette, shared control styles, responsive layouts, RTL and reduced-motion support.
- `source/copy.json` — all three languages, metadata and accessibility labels.
- `source/main.js` — language switching, scroll-triggered reveals, active-section navigation and keyboard-accessible service tabs.
- `source/assets/` — supplied brand assets and locally embedded fonts, including font licenses.
- `build.py` — dependency-free Python builder.
- `dist/index.html` — portable build with embedded assets, fonts and font licenses.

## Build and preview

Run `python3 build.py`, then serve `dist/` with any static web server. The page requires no runtime dependencies, third-party scripts, external font requests or backend.

The GitHub repository also has the identical generated page at `index.html` for hosts that serve from the repository root. The deployment output is `dist/`.

## Brand and content

Solar yellow `#FCBF01`, dark green-black `#111B1E`, plum `#26161F`, navy `#0D203B`, deep blue `#01111D` and alabaster `#FFFFF0` follow the supplied eeco identity. Quicksand is used for Latin text and Noto Sans Arabic for Arabic.

Original logos are preserved. Carmen and eeco use supplied transparent assets. Alquimia and Kemet use CSS multiply blending to eliminate the white background in the rendered page without redrawing or recoloring the source artwork. The light project surfaces are deliberate and required for this blending treatment.

The Carmen project card opens a collection of Siwa salt lamps, with original photographs, the story of their Egyptian origin, natural materials, ambient-light benefits and practical care information. Regeneration is presented as a purpose and ambition. No product certifications, medical benefits, client results or measured environmental impact are claimed.

## Validation

The redesign was reviewed in the browser in all three languages within 320, 390, 768 and 1280px frames, without horizontal document overflow. The mobile interface uses a centered app bar, a native language selector, a fixed four-section navigation dock and compact service tabs. Section numbers and the GitHub footer link have been removed from all languages. On-scroll entrances use the Web Animations API and IntersectionObserver once per element; content remains readable without animation support. Reduced-motion preferences are respected, including changes while the page is open. Desktop project-logo rendering was visually reviewed. The builder checks translation coverage and unresolved assets; anchor targets and JavaScript syntax were also checked.

The site preserves its existing private audience. GitHub is a source copy; this repository does not claim automatic deployment integration.

## Interface refinement — November 2026

The latest pass adds a curved brand stage, a short pointer-triggered emblem gesture, geometric icons in the mobile dock, related-element reveal staggering, a scroll-linked process line, complete Kemet logo containment, and immediate keyboard service switches. See DESIGN.md for the preserved visual system and selected design references. Source and both generated HTML outputs stay in sync.

## Recycla showcase

[Open Recycla in Sites](https://eeco-by-hapi.hapi-alquimias.chatgpt.site/recycla/) · [Open eeco](https://eeco-by-hapi.hapi-alquimias.chatgpt.site)

The Recycla ecosystem card replaces Alquimia and opens the showcase at `/recycla/`. The Kemet card retains its original artwork, logo, copy, layout and destination from the version before the Recycla addition. The new page uses the original logo, palette, system typography and native story illustrations from Recycla-App, source revision `5b80b9b662d7963679ccea4fc28e6cc6c3fba203`. Portuguese previews faithfully adapt three bundled stories. The signed Android 0.5.0 APK includes seven stories and 108 cards offline, defaults to Brazilian Portuguese, and supports persistent PT / EN language switching. Its bundled story catalog was compared with the referenced repository.

`recycla/page.css` and `recycla/page.js` provide the responsive page and keyboard-accessible story previews. `recycla/art/` contains exported original SVG covers and diagrams. The dependency-free build copies the whole Recycla directory into `dist/recycla/`. The eeco project card supports the existing English, Portuguese and Arabic language choices.

![Recycla showcase page](docs/recycla-page-preview.jpg)

## Carmen — Siwa salt lamps

The entire Carmen card opens a native dialog with a 15-photo carousel, previous/next controls, thumbnails, mouse dragging, native touch swiping and keyboard navigation (Left/Right, Home/End, Escape). The gallery does not advance automatically. English, Brazilian Portuguese and Egyptian Arabic include captions, image descriptions, controls, product copy and an enquiry link that carries the selected design into WhatsApp.

The supplied photos are optimized as WebP files in `assets/carmen/`, with small thumbnails. The modal presents origin, materials, ambient-light benefits, facts and care instructions. Health or air-purification benefits are not promised; background sources are linked inside the dialog. Availability and electrical specifications are confirmed by enquiry. The existing Carmen logo and the other project cards are preserved.

## Android 0.5.0 download

Both `/recycla/` and `/Recycla/` open the Recycla page. Download buttons serve the signed APK directly from `/recycla/Recycla-Android.apk?v=0.5.0`. The version query avoids reusing an older cached APK. Source and distribution copies contain the same signed bytes.

The signed release and public verification metadata are retained in [Recycla-App releases/v0.5.0](https://github.com/abdelhayalm/Recycla-App/tree/main/releases/v0.5.0). Signing secrets are kept outside both repositories. Versions up to 0.4.0 have a different signing identity; the page explains the required fresh installation and loss of old local progress.

## eeco materiais video enquiry

The eeco materiais card retains the original eeco logo mask, rounded brand type and pale yellow (#FFFF98). Its native dialog places the supplied 33-second promotional video on the left and the existing enquiry form on the right. Narrow screens stack the video above the form. The MP4 retains its original H.264/AAC streams; fast-start metadata enables progressive playback. It is requested on opening, with preload disabled on the page.

Opening the card requests playback with sound within the visitor’s click gesture. Native playback, volume and fullscreen controls remain available, and clicking the picture toggles play/pause. A translated play button appears if the browser blocks playback. Closing the dialog or hiding the browser tab pauses the video; closing resets it for the next opening. Browsers still control whether sound playback is permitted. The materials form and WhatsApp request remain unchanged except for the Portuguese brand name.

The materials card and enquiry dialog use the owner-supplied transparent `assets/eeco-materiais-logo.png` lockup unchanged.
