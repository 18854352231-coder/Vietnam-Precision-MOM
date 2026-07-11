# Vietnam MOM System Design System (Vercel-Inspired Light Mode)

## 1. Visual Theme & Atmosphere
- **Mood**: Clean, high-contrast, and precise. "Architectural clarity."
- **Density**: Comfortable but data-focused.
- **Philosophy**: Use pure white surfaces, sharp borders, and intentional whitespace to define structure. Avoid heavy shadows; use thin 1px lines.

## 2. Color Palette & Roles
### Core Surfaces
- `background-primary`: `#ffffff` (Pure white)
- `background-secondary`: `#fafafa` (Lightest gray for sidebars/sections)
- `background-tertiary`: `#eaeaea` (For hover states/active items)

### Typography
- `text-primary`: `#000000` (Pure black for headings/primary text)
- `text-secondary`: `#666666` (Muted gray for descriptions/labels)
- `text-tertiary`: `#999999` (Light gray for disabled/placeholders)

### Accents & Semantics
- `accent-primary`: `#000000` (Black is the primary action color)
- `accent-success`: `#0070f3` (Vercel blue for "Active", "Normal")
- `accent-warning`: `#f5a623` (Orange for "Expiring")
- `accent-danger`: `#ee0000` (Red for "Expired", "Error")

### Borders & Elevation
- `border-subtle`: `#eaeaea` (Light gray 1px line)
- `border-strong`: `#333333` (Darker for focus states)
- `elevation-card`: `0 2px 4px rgba(0, 0, 0, 0.05)`

## 3. Typography Rules
- **Primary Font**: `Geist`, `Inter`, `-apple-system`, sans-serif.
- **Scale**:
  - `H1`: 24px / 1.2 / 600
  - `Body`: 14px / 1.5 / 400
  - `Code`: `monospace`

## 4. Component Stylings
### Buttons
- **Primary**: Background `#000000`, text `#ffffff`, border-radius `6px`.
- **Secondary**: Background `#ffffff`, text `#000000`, border `1px solid #eaeaea`.

### Cards
- Border-radius: `8px`.
- Border: `1px solid #eaeaea`.
- Background: `#ffffff`.

### Inputs
- Background: `#ffffff`.
- Border: `1px solid #eaeaea`.
- Focus: Border `#000000`.
