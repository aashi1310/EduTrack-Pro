# EduTrack Pro — Frontend Design System & UI Specification

> **Design System Version:** 2.0  
> **Target Framework:** React 18 & Tailwind CSS 3  
> **Iconography:** Lucide React  
> **Typography:** Inter (Google Fonts) with system fallbacks  
> **Design Philosophy:** Clean, dense, data-first institutional SaaS with high contrast, crisp borders, and purposeful accent states.

---

## 1. Color Palette

EduTrack Pro uses a distinct palette designed for readability during long administrative and evaluation sessions. It combines deep maritime navies for navigation chrome, clean slate neutrals for backgrounds, crisp white surfaces for cards, and vibrant royal blue for active focal points.

### 1.1 Navigation & Brand Colors

| Token Name | Tailwind Class | Hex Value | Role / Usage |
|---|---|---|---|
| **Sidebar Navy** | `bg-[#0F1F46]` / `navy-950` | `#0F1F46` | Primary sidebar background; anchor of visual hierarchy |
| **Primary Navy** | `text-[#172554]` / `navy-900` | `#172554` | Primary brand heading color, modal accents, badge text |
| **Dark Navy Footer** | `bg-[#0A1633]` | `#0A1633` | Sidebar user profile footer & dark accents |
| **Slate Navy** | `bg-[#1E3A8A]` / `navy-800` | `#1E3A8A` | Sidebar borders, active states, avatar rings |
| **Royal Blue** | `bg-[#2563EB]` / `brand-blue` | `#2563EB` | Primary CTA buttons, active sidebar item, focus rings |
| **Light Blue** | `bg-[#EFF6FF]` / `brand-light` | `#EFF6FF` | Active row tints, icon background containers |
| **Blue Gradient** | `from-[#2563EB] to-[#3B82F6]` | `#2563EB` → `#3B82F6` | Brand logo badge gradient |

### 1.2 Surface & Neutral Palette

| Token Name | Tailwind Class | Hex Value | Role / Usage |
|---|---|---|---|
| **Canvas Background** | `bg-[#F1F5F9]` / `brand-bg` | `#F1F5F9` | App-wide main background behind cards and tables |
| **Card Surface** | `bg-white` / `brand-card` | `#FFFFFF` | Primary content panels, tables, dialogs, dropdowns |
| **Table Head Surface** | `bg-[#F8FAFC]` | `#F8FAFC` | Table headers, modal footer, toolbar containers |
| **Primary Text** | `text-[#0F172A]` / `brand-text` | `#0F172A` | Highest-contrast body text, headings, table cell data |
| **Muted Text** | `text-[#64748B]` / `brand-muted`| `#64748B` | Secondary labels, breadcrumbs, table headers, subtitles |
| **Tertiary / Slate** | `text-slate-400` | `#94A3B8` | Icons, placeholders, subtle borders, disabled icons |
| **Primary Border** | `border-[#E2E8F0]` / `brand-border`| `#E2E8F0` | Default card borders, table dividers, navbar border |
| **Input Border** | `border-[#CBD5E1]` | `#CBD5E1` | Form inputs, search fields, button borders |

### 1.3 Semantic & Status Colors

| State | Background Tint | Border | Text Color | Associated Entities |
|---|---|---|---|---|
| **Success / Active** | `bg-emerald-50` (`#ECFDF5`) | `border-emerald-200` (`#A7F3D0`) | `text-emerald-700` (`#047857`) | `Active`, `Open`, `Published`, `Enrolled`, `Completed`, `Normal` attendance (≥ 75%) |
| **Warning / Pending** | `bg-amber-50` (`#FFFBEB`) | `border-amber-200` (`#FDE68A`) | `text-amber-700` (`#B45309`) | `Draft`, `Pending`, `Late` attendance, attendance (60%–74.9%) |
| **Danger / Shortage** | `bg-rose-50` (`#FEF2F2`) | `border-rose-200` (`#FECACA`) | `text-rose-700` (`#BE123C`) | `Suspended`, `Closed`, `Cancelled`, `Failed`, `Dropped`, `Absent`, Attendance Shortage (< 75%) |
| **Info / Graduated** | `bg-blue-50` (`#EFF6FF`) | `border-blue-200` (`#BFDBFE`) | `text-blue-700` (`#1D4ED8`) | `Graduated`, `Excused` attendance, Term badges |
| **Withdrawn / Special**| `bg-purple-50` (`#FAF5FF`)| `border-purple-200` (`#E9D5FF`)| `text-purple-700` (`#6B21A8`)| `Withdrawn` enrollment |

---

## 2. Typography

The design system standardizes on **Inter** with fallbacks to system fonts (`Inter, system-ui, -apple-system, sans-serif`). The typographic scale enforces a dense information hierarchy suitable for operational dashboards.

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Typographic Scale

| Scale Role | Font Size | Weight | Line Height | Letter Spacing | CSS / Tailwind | Sample Use Case |
|---|---|---|---|---|---|---|
| **Display Stat** | `26px` | 700 (Bold) | `1.15` | `-0.025em` | `text-[26px] font-bold tracking-tight text-[#0F172A]` | `StatCard` value number |
| **Page Title (h1)**| `24px` | 700 (Bold) | `1.25` | `-0.025em` | `text-[24px] font-bold tracking-tight text-[#0F172A]` | `PageHeader` title |
| **Section Title (h2)**| `18px`| 600 (Semibold)| `1.3` | `-0.015em` | `text-[18px] font-semibold text-[#0F172A]` | Card group headings |
| **Modal / Card Title (h3)**| `15px`| 600 (Semibold)| `1.4` | `0` | `text-[15px] font-semibold text-[#0F172A]` | Modal header, `ChartCard` header |
| **Base Body / Cell** | `13px` | 400 (Regular) | `1.5` | `0` | `text-[13px] text-[#0F172A]` | Table cell data, descriptions, forms |
| **Control / Subtext**| `12px` | 500 (Medium) | `1.4` | `0` | `text-[12px] text-[#64748B]` | Pagination, button text, subtitles |
| **Micro / Header** | `11px` | 600 (Semibold)| `1.2` | `+0.05em` | `text-[11px] font-semibold uppercase tracking-wider text-[#64748B]` | Table column headers, stat titles |
| **Badge Mini** | `10px` | 700 (Bold) | `1` | `+0.05em` | `text-[10px] font-bold uppercase tracking-wider` | Notification pill, Shortage flag |

---

## 3. Layout Structure & Grid

EduTrack Pro implements a fixed viewport shell where the primary chrome stays anchored while inner page content scrolls independently.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              VIEWPORT                                  │
│ ┌───────────────┬────────────────────────────────────────────────────┐ │
│ │               │ NAVBAR (Fixed top: 0, h: 68px, left: 245px/76px)   │ │
│ │               ├────────────────────────────────────────────────────┤ │
│ │               │                                                    │ │
│ │ SIDEBAR       │ MAIN CONTENT CONTAINER                             │ │
│ │ (Fixed left)  │ (pt-[68px], pl-[245px]/pl-[76px])                  │ │
│ │               │                                                    │ │
│ │ Width:        │ ┌────────────────────────────────────────────────┐ │ │
│ │ 245px (open)  │ │ max-w-7xl mx-auto p-6                          │ │ │
│ │ 76px (shut)   │ │                                                │ │ │
│ │               │ │ [ PageHeader ]                                 │ │ │
│ │               │ │ [ StatCards Grid (1 to 4 cols) ]               │ │ │
│ │               │ │ [ DataTable / Charts Panel ]                   │ │ │
│ │               │ └────────────────────────────────────────────────┘ │ │
│ └───────────────┴────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Layout Dimensional Specifications
- **Sidebar Width (Expanded):** `245px` (`w-[245px]`).
- **Sidebar Width (Collapsed):** `76px` (`w-[76px]`).
- **Sidebar Transition:** `transition-all duration-300 ease-in-out`.
- **Navbar Height:** `68px` (`h-[68px]`).
- **Navbar Offset:** Dynamically adjusts: `left-[245px]` when sidebar is open; `left-[76px]` when collapsed.
- **Content Padding:** `pt-[68px]` top offset matching navbar; `p-6` (`24px`) inner breathing room.
- **Content Max-Width:** `max-w-7xl` (`80rem` / `1280px`) centered with `mx-auto`.

---

## 4. Component Inventory & API Specifications

All reusable UI components are located in `client/src/components/common/` and `client/src/components/layout/`.

### 4.1 `StatCard`
Displays an aggregate operational KPI with optional trend indicators and color schemes.
- **Source:** `client/src/components/common/StatCard.jsx`
- **Props:**
  - `title` *(string, required)*: Label for metric (e.g. `"Total Students"`).
  - `value` *(string|number, required)*: Formatted value (e.g. `"1,248"` or `"88.4%"`).
  - `icon` *(LucideIcon, optional)*: Lucide icon component to display in colored badge.
  - `trend` *(object `{ value: string, isPositive: boolean }`, optional)*: Displays green arrow up or red arrow down with trend text.
  - `trendLabel` *(string, optional)*: Explanatory footer text (e.g. `"vs. previous term"`).
  - `color` *(enum `'blue'|'navy'|'green'|'purple'|'amber'`, default `'blue'`)*: Icon background and border scheme.
- **Example Usage:**
```jsx
<StatCard
  title="Total Students"
  value="1,240"
  icon={Users}
  trend={{ value: "+8.2%", isPositive: true }}
  trendLabel="Active matriculated enrollment"
  color="blue"
/>
```

---

### 4.2 `Modal` & `ConfirmationDialog`
High-contrast accessible dialog overlays with backdrop blur and escape key listener.
- **Source:** `client/src/components/common/Modal.jsx`
- **Modal Props:**
  - `isOpen` *(boolean, required)*: Visibility flag.
  - `onClose` *(function, required)*: Dismiss handler.
  - `title` *(string, required)*: Dialog header text.
  - `children` *(ReactNode, required)*: Dialog body content.
  - `maxWidth` *(string, default `'max-w-lg'`)*: Tailwind width constraint (`'max-w-md'`, `'max-w-xl'`, `'max-w-4xl'`).
  - `footer` *(ReactNode, optional)*: Action button row rendered in soft `#F8FAFC` footer.
- **ConfirmationDialog Props:**
  - `isOpen`, `onClose`, `onConfirm` *(required)*
  - `title` *(string, default `'Confirm Action'`)*
  - `message` *(string)*: Body warning text.
  - `confirmLabel` *(string, default `'Confirm'`)*
  - `cancelLabel` *(string, default `'Cancel'`)*
  - `isDanger` *(boolean, default `false`)*: Renders red destructive confirm button.
  - `loading` *(boolean, default `false`)*: Disables buttons and renders `"Processing..."`.

---

### 4.3 `DataTable`
The central administrative workhorse with integrated search, custom filters, column sorting, pagination, and CSV export.
- **Source:** `client/src/components/common/DataTable.jsx`
- **Props:**
  - `columns` *(Array of `{ header: string, accessor: string, sortable?: boolean, render?: (val, row) => ReactNode, className?: string }`)*
  - `data` *(Array of objects)*: Records array.
  - `loading` *(boolean, default `false`)*: Shows loading spinner.
  - `emptyMessage` *(string)*: Message displayed if data length is 0.
  - `search` *(string)*: Current search query value.
  - `onSearchChange` *(function `(query) => void`)*: Search input change callback.
  - `searchPlaceholder` *(string, default `'Search records...'`)*
  - `filterSlot` *(ReactNode)*: Slot for dropdown filter controls.
  - `onExport` *(function)*: Export button trigger callback.
  - `pagination` *(object `{ page: number, limit: number, total: number, totalPages: number }`)*
  - `onPageChange` *(function `(newPage) => void`)*
  - `sortBy` *(string)*: Currently sorted column accessor.
  - `sortOrder` *(enum `'asc'|'desc'`)*
  - `onSort` *(function `(accessor) => void`)*
  - `actions` *(ReactNode)*: Action button slot (e.g. `+ Add Student`).

---

### 4.4 `PageHeader` & `ChartCard`
- **Source:** `client/src/components/common/PageHeader.jsx`
- **PageHeader Props:**
  - `title` *(string, required)*: Top h1 page title.
  - `subtitle` *(string, optional)*: Subtitle context.
  - `actions` *(ReactNode, optional)*: Top-right button cluster.
- **ChartCard Props:**
  - `title` *(string, required)*
  - `subtitle` *(string, optional)*
  - `children` *(ReactNode)*: Chart element (e.g., Recharts component).
  - `actions` *(ReactNode, optional)*: Chart filter pills / dropdowns.

---

### 4.5 `StatusBadge`, `AttendanceBadge` & `GradeBadge`
- **Source:** `client/src/components/common/StatusBadge.jsx`
- **StatusBadge:**
  - `status` *(string)*: Automatically resolves palette for statuses like `Active`, `Draft`, `Published`, `Shortage`, etc. Includes a 6px status dot indicator.
- **AttendanceBadge:**
  - `percentage` *(number|string)*: Renders percentage value colored green (≥ 75%), amber (60%–74.9%), or red (< 60%).
  - `showWarning` *(boolean, default `true`)*: Appends a high-visibility `"SHORTAGE"` pill when percentage < 75%.
- **GradeBadge:**
  - `grade` *(string)*: Renders letter grade (`A+`, `A`, `B`, `C`, `D`, `F`) with distinctive color-coded borders.

---

### 4.6 `LoadingSpinner` & `EmptyState`
- **Source:** `client/src/components/common/EmptyState.jsx`
- **LoadingSpinner:**
  - `text` *(string)*: Custom message accompanying the dual-ring blue spinner.
  - `fullHeight` *(boolean, default `false`)*: Sets `min-h-[400px]` for page-level fallbacks.
- **EmptyState:**
  - `title` *(string, default `'No records found'`)*
  - `message` *(string)*
  - `actionButton` *(ReactNode, optional)*: e.g. `"Clear Filters"` button.
  - `icon` *(LucideIcon, default `Inbox`)*

---

## 5. UI Elements & Form Styles

### 5.1 Button Variants

```jsx
// Primary Action Button (Brand Blue)
<button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors duration-150">
  <Plus className="w-4 h-4" /> Add Record
</button>

// Secondary / Outlined Button
<button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#CBD5E1] text-[12px] font-medium rounded-lg shadow-sm transition-colors">
  <Download className="w-4 h-4 text-slate-500" /> Export CSV
</button>

// Destructive Button
<button className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
  <Trash2 className="w-4 h-4" /> Delete
</button>

// Ghost / Icon Button
<button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
  <X className="w-5 h-5" />
</button>
```

### 5.2 Form Inputs & Controls

```jsx
// Text Input / Search
<div className="space-y-1">
  <label className="text-[12px] font-semibold text-[#0F172A]">Student Roll Number</label>
  <input
    type="text"
    placeholder="e.g. CS2026001"
    className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
  />
</div>

// Select Dropdown
<select className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all">
  <option value="">All Departments</option>
  <option value="1">Computer Science & Engineering</option>
</select>
```

### 5.3 Data Table Row Styles

```css
/* Table Header */
.table-header {
  @apply bg-[#F8FAFC] text-[#64748B] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E2E8F0] px-4 py-3 text-left;
}

/* Table Body Cell */
.table-cell {
  @apply px-4 py-3 text-[13px] text-[#0F172A] border-b border-[#F1F5F9] whitespace-nowrap;
}

/* Table Hover Effect */
.table-row-hover {
  @apply hover:bg-[#F8FAFC] transition-colors duration-150;
}
```

---

## 6. Shadows, Elevation & Animations

| Elevation Layer | Tailwind Utility | CSS Value | Used On |
|---|---|---|---|
| **Base Card** | `shadow-card` | `0 1px 3px rgba(15,23,42,0.05), 0 1px 2px -1px rgba(15,23,42,0.05)` | StatCards, DataTables, ChartCards |
| **Hover Card**| `shadow-card-hover` | `0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.05)` | Interactive StatCards on mouseover |
| **Dropdown / Popover** | `shadow-dropdown` | `0 10px 15px -3px rgba(15,23,42,0.1), 0 4px 6px -4px rgba(15,23,42,0.05)` | Navbar notification menu, user profile popover |
| **Modal Dialog** | `shadow-2xl` | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | Centered dialog windows |

### Custom Scrollbar & Toast Keyframe Animations
```css
/* High-density Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #F1F5F9;
}
::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

/* Toast Slide-In Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-in {
  animation: slideIn 0.2s ease-out forwards;
}
```

---

## 7. Responsive Breakpoints

| Breakpoint | Minimum Width | System Behavior |
|---|---|---|
| **`sm`** | `640px` | Table toolbar stacks search & actions vertically below 640px, inline above |
| **`md`** | `768px` | Active Term pill surfaces in Navbar; Login page splits into two-column layout |
| **`lg`** | `1024px` | Analytics and dashboard metric cards expand from 2 columns to 4 columns |
| **`xl`** | `1280px` | Max-width boundary `max-w-7xl` stabilizes center container |
