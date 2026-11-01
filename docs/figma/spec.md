# Figma spec

Read from the Figma file through the Figma MCP on 2026-11-01. Frame "Desktop - 2"
(node `1:56`), 1366 × 1457 px. It is the only frame: there is no mobile layout.
The render is in `desktop.png`, and the add icon is in `icon-add.svg`.

## Tokens (Figma variables)

| Name | Value | Used for |
|---|---|---|
| Primary/Primary | `#6324C6` | header, footer, active filter, filter border, search button |
| Primary/Primary-Light1 | `#774DC5` | genre chips |
| Feedback/Success | `#01ADA6` | score above 80 |
| Feedback/Warning | `#FFB800` | score 50 to 80, "ANIME" in the logo, "Ver mais" button |
| Feedback/Danger | `#E92151` | score below 50 |
| Gray/Light1 | `#C4CAD4` | search field border |
| Gray/Gray | `#A7B0BE` | search placeholder |
| Gray/Light2 | `#E2E5E9` | chip and score text |
| White | `#FFFFFF` | page background, text on purple |

Font: **Mulish** (Regular 400, SemiBold 600, Bold 700). Line height "normal".
- H3/Bold: 24 px, 700 (card title)
- H4/Semibold: 20 px, 600 ("Ver mais")

## Layout

Page content is one centered column, 24 px gap between blocks.

- **Header**: 68 px tall, `#6324C6`. Logo "BUSC" white + "ANIME" `#FFB800`, Mulish
  Regular 40 px, centered. The logo is text, not an image.
- **Filters**: one row, centered, 19 px gap. Each button is 32 px tall, radius 4,
  Mulish SemiBold 14 px, horizontal padding about 17 to 23 px.
  - Active: background `#6324C6`, text white.
  - Inactive: background white, 1 px border `#6324C6`, text `#6324C6`.
  - Order: All Formats, TV Show, Movie, TV Short, Special, OVA, ONA, Music.
- **Search**: centered row 1012 px wide, 10 px gap.
  - Field: 916 × 38, white, 1 px border `#C4CAD4`, radius 4, Mulish Regular 14 px,
    left padding 10 px, placeholder "Digite algo aqui..." in `#A7B0BE`.
  - Button "Buscar": 86 × 38, `#6324C6`, radius 4, white Mulish SemiBold 14 px.
- **Grid**: 1316 px wide (25 px side margin), 4 columns of 317 px, gap 21 px between
  rows and 16 px between columns. 12 cards per page.
- **Card**: 317 × 270, radius 8.
  - Cover image `object-fit: cover`, with an overlay
    `linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.17) 105%)`.
  - Content starts 28 px from the left and 23 px from the top, 261 px wide,
    11 px gap between title and chips.
  - Title: Mulish Bold 24 px, white. Long titles end in "..." (3 lines max in the
    design: "Shingeki no Kyojin: The Final Season - Kanketsu...").
  - Genre chips: up to 3, 11 px gap, padding 3 × 8, radius 4, `#774DC5`, Mulish
    Regular 12 px, text `#E2E5E9`.
  - Score badge: bottom right, about 8 px from the right and 11 px from the bottom,
    padding 3 × 8, radius 4, Mulish Regular 24 px, text `#E2E5E9`, shown as "80%".
- **"Ver mais"**: full grid width (1316), 48 px tall, `#FFB800`, radius 8. The add icon
  (24 px) and "Ver mais" in white Mulish SemiBold 20 px, centered.
- **Footer**: 54 px tall, `#6324C6`. Logo at 24 px and "TODOS OS DIREITOS RESERVADOS"
  at 10 px below it, white, centered.

## Issues found in the design

1. **Score 80 is green in the design.** The "Zom 100" card shows 80% with
   `#01ADA6` (Success). The brief says 50 to 80 is yellow. All other cards follow the
   brief (48 red; 70, 78, 79 yellow; 81 and up green).
2. **Low color contrast** (WCAG AA asks 4.5:1 for normal text, 3:1 for large text):
   - Score text `#E2E5E9` on `#FFB800`: about 1.4:1. Fails.
   - Score text `#E2E5E9` on `#01ADA6`: about 2.2:1. Fails.
   - Score text `#E2E5E9` on `#E92151`: about 3.5:1. Passes for large text only.
   - "Ver mais" white on `#FFB800`: about 1.7:1. Fails.
   - Placeholder `#A7B0BE` on white: about 2.2:1. Fails.
3. **Missing states**: loading, empty result, error, null score, and any layout below
   1366 px.
