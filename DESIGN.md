# Design System

## Overview

A3Distributors uses a **custom CSS architecture** with component-scoped styling, responsive design patterns, and a data-driven color system. No CSS framework (Tailwind) — pure CSS with semantic naming conventions.

---

## Design Architecture

### Styling Approach
- **Framework**: Custom CSS (no Tailwind or Bootstrap)
- **Organization**: Scoped CSS files per component (e.g., `BlogPost.css`, `AdminLayout.css`)
- **Pattern**: CSS Grid/Flexbox for layouts
- **Responsive**: Mobile-first breakpoints with media queries

### Component Structure
```
src/
├── components/          # Public-facing UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Products.jsx
│   ├── BlogListing.jsx
│   └── [component].css
├── admin/              # Admin dashboard interface
│   ├── AdminLayout.jsx
│   ├── Sidebar.jsx
│   ├── TopHeader.jsx
│   └── admin.css
└── styles/            # Global styles
    ├── blogListing.css
    ├── blogPost.css
    └── [page].css
```

---

## Color Palette

### Brand Colors
Defined in `src/data/siteConfig.js` and `products.json`:

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary Brand | `#0099CC` | Product highlights, CTAs |
| Admin Dark | `#0f172a` to `#1e293b` | Sidebar gradient |
| Admin Light | `#f0f2f5` | Content background |
| Success | `#10b981` | Confirmations |
| Warning | `#f59e0b` | Alerts |
| Error | `#ef4444` | Errors |

### Product Category Colors
Stored in `products.json` — each product has a `color` property:
```json
{
  "id": "bisleri",
  "name": "Bisleri",
  "color": "#0099CC"
}
```

---

## Typography

### Font Family
- **Default**: System fonts (no custom imports in current CSS)
- **Fallback**: Sans-serif stack

### Sizing
- **Body**: Base 16px
- **Headings**: Hierarchical scaling (h1, h2, h3)
- **Admin**: 14px for dense tables/lists

### Font Weights
- Regular: 400
- Medium: 500
- Bold: 700

---

## Spacing System

### Standardized Margins & Padding
- **Micro**: 8px (internal component spacing)
- **Small**: 16px (standard padding)
- **Medium**: 24px (section spacing)
- **Large**: 32px (major section gaps)
- **XLarge**: 48px+ (full-page margins)

---

## Components

### Public-Facing Components
| Component | Purpose | CSS File |
|-----------|---------|----------|
| **Navbar** | Top navigation with menu | Scoped in Navbar.jsx |
| **Footer** | Site footer | Scoped in Footer.jsx |
| **Hero** | Landing page hero banner | Scoped in Hero.jsx |
| **Blog Listing** | Blog post grid | `blogListing.css` |
| **Blog Post** | Individual blog article | `blogPost.css` |
| **Products** | Product showcase cards | Scoped in Products.jsx |
| **Contact Form** | Lead capture form | Scoped in Contact.jsx |
| **Quotation Modal** | Bulk order dialog | QuotationModal.jsx |

### Admin Components
| Component | Purpose | Features |
|-----------|---------|----------|
| **Sidebar** | Navigation menu | Collapsible, icons (Lucide), responsive mobile state |
| **TopHeader** | Admin header | User menu, breadcrumbs |
| **Modal** | Generic dialog | Reusable overlay component |
| **Toast** | Notifications | Success, error, info messages |
| **ExportButtons** | Data export | CSV/XLSX download via xlsx library |
| **DataTable** | Admin lists | Sortable, paginated rows |

---

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Patterns
- Sidebar collapses to hamburger menu on mobile
- Single-column layouts
- Touch-friendly button sizing (44px minimum)
- Stack forms vertically

### Admin Responsive Features
- Sidebar can be collapsed to icon-only view
- Tables scroll horizontally on mobile
- Modal dialogs full-screen on mobile

---

## Animations & Transitions

### Sidebar Collapse
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover States
- Button scale: `transform: scale(1.02)`
- Link underline: Fade-in opacity
- Card elevation: `box-shadow` changes on hover

### Loading States
- Skeleton screens (optional)
- Spinner icon (Lucide React)
- Disabled button states

---

## Icons

### Icon Library
- **Primary**: Lucide React icons
- **Secondary**: React Icons (fallback)

### Usage Examples
```jsx
import { Menu, X, ChevronDown } from 'lucide-react';
```

### Common Icons
- Navigation: Menu, X, ChevronDown, ChevronRight
- Actions: Edit, Trash, Plus, Download, Upload
- Status: Check, AlertCircle, Info, Clock

---

## Forms & Input States

### Input Styling
- **Default**: Border gray, background white
- **Focus**: Border primary color (#0099CC), outline none
- **Error**: Border red (#ef4444), error text below
- **Disabled**: Background light gray, cursor not-allowed

### Button States
- **Default**: Background primary color, white text
- **Hover**: Darken background by 10%
- **Active/Pressed**: Darken further, slight scale down
- **Disabled**: Gray background, reduced opacity

### Form Layout
- **Max-width**: 600px for single-column forms
- **Label margin**: 8px below label, 4px below input
- **Error message**: Small text (12px) in red below input

---

## Admin Dashboard Styling

### Layout Grid
- **Main**: `display: grid; grid-template-columns: auto 1fr;`
- **Sidebar**: Fixed width (240px default, 80px when collapsed)
- **Content**: Scrollable main area with padding

### Color Scheme (Dark Mode)
- **Background**: `#f0f2f5` (light gray)
- **Sidebar**: Linear gradient `#0f172a → #1e293b` (dark slate)
- **Text**: Dark text on light bg, white text on dark bg
- **Cards**: White background with subtle shadows

### Table Styling
- **Headers**: Colored background (usually primary)
- **Rows**: Alternating light gray background
- **Hover**: Highlight row on hover
- **Density**: Compact spacing for many rows

---

## Accessibility

### Color Contrast
- Minimum 4.5:1 for text on backgrounds
- Tested for WCAG AA compliance

### Focus Management
- Visible focus rings (not removed)
- Keyboard navigation support
- Skip links for main content

### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Form inputs with associated labels
- Image alt text

---

## CSS Features in Use

### Grid Layouts
```css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

### Flexbox Patterns
```css
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Responsive Images
```css
img {
  max-width: 100%;
  height: auto;
}
```

---

## SEO & Meta Styling

### Open Graph Images
- Dimensions: 1200x630px
- Format: WebP or PNG
- Location: `public/imgs/`

### Meta Tags Component
- Dynamically injected via `SEO.jsx`
- Structured data (JSON-LD) for rich snippets

---

## Dark Mode Considerations

The admin panel already uses dark sidebar (`#0f172a`). For potential full dark mode:
- Modify CSS variables or add `.dark-mode` class
- Update color palette for night viewing
- Adjust contrast ratios accordingly

---

## Future Enhancements

- [ ] CSS variable system for theming
- [ ] Storybook documentation for components
- [ ] Component library documentation
- [ ] Design tokens export (Figma → CSS)
- [ ] Accessibility audit (WCAG AAA)
