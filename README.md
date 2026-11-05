# eeco

**Empowering evolutionary ecosystems.** A creative agency and movement founded by Hapi.

A responsive, self-contained website in English, Brazilian Portuguese and Egyptian Arabic. Its story connects the agency’s strategy, brand and digital work with Carmen, Alquimia and Kemet.

## Project structure

- `source/template.html` — semantic markup with readable English fallback.
- `source/style.css` — brand palette, shared control styles, responsive layouts, RTL and reduced-motion support.
- `source/copy.json` — all three languages, metadata and accessibility labels.
- `source/main.js` — language switching, mobile navigation and keyboard-accessible service tabs.
- `source/assets/` — supplied brand assets and locally embedded fonts, including font licenses.
- `build.py` — dependency-free Python builder.
- `dist/index.html` — portable build with embedded assets, fonts and font licenses.

## Build and preview

Run `python3 build.py`, then serve `dist/` with any static web server. The page requires no runtime dependencies, third-party scripts, external font requests or backend.

The GitHub repository also has the identical generated page at `index.html` for hosts that serve from the repository root. The deployment output is `dist/`.

## Brand and content

Solar yellow `#FCBF01`, dark green-black `#111B1E`, plum `#26161F`, navy `#0D203B`, deep blue `#01111D` and alabaster `#FFFFF0` follow the supplied eeco identity. Quicksand is used for Latin text and Noto Sans Arabic for Arabic.

Original logos are preserved. Carmen and eeco use supplied transparent assets. Alquimia and Kemet use CSS multiply blending to eliminate the white background in the rendered page without redrawing or recoloring the source artwork. The light project surfaces are deliberate and required for this blending treatment.

Carmen is described as developing organic, nature-inspired health and personal-care products for a healthier lifestyle in the city, according to the founder’s brief. Regeneration is presented as a purpose and ambition. No product certifications, medical benefits, client results or measured environmental impact are claimed.

## Validation

The redesign was reviewed in the browser in all three languages within 320, 390, 768 and 1280px frames, without horizontal document overflow. Mobile menu opening/closing, Escape focus return, service-tab selection, keyboard navigation and selection preservation across language changes were verified. Desktop project-logo rendering was visually reviewed. The builder checks translation coverage and unresolved assets; anchor targets and JavaScript syntax were also checked.

The site preserves its existing private audience. GitHub is a source copy; this repository does not claim automatic deployment integration.
