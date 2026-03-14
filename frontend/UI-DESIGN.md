# UI Design Documentation

## Neo-Brutalism Theme

The CryptoToINR app uses a **neo-brutalism** design aesthetic with a strict **black and white** color palette. This creates a bold, modern, and highly readable interface reminiscent of UPI apps.

### Design Principles

#### 1. Color Palette
- **Black (#000000)**: Primary actions, borders, text
- **White (#FFFFFF)**: Background, secondary buttons
- **NO gradients, NO grays** (except in rare cases)

#### 2. Typography
- **Font Weight**: Only use `font-black` (900) or `font-bold` (700)
- **Text Transform**: UPPERCASE for headings and buttons
- **Font Size Scale**:
  - Hero: `text-7xl` (72px)
  - H1: `text-5xl` (48px)
  - H2: `text-3xl` (30px)
  - H3: `text-2xl` (24px)
  - Body: `text-lg` (18px) for important, `text-base` (16px) default

#### 3. Borders
- **Always** 4px thick: `border-4`
- **Always** black: `border-black`
- **Never** rounded corners (except on landing page for branding)

#### 4. Shadows
Neo-brutalist "hard shadows" using offset box-shadow:
```css
/* Small shadow */
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]

/* Medium shadow */
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]

/* Large shadow */
shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]

/* Extra large */
shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
```

#### 5. Hover Effects
```css
/* Remove shadow and translate to create "press" effect */
hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]
```

#### 6. Buttons

**Primary Button (Black)**
```tsx
<button className="px-8 py-5 bg-black text-white border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all">
  BUTTON TEXT
</button>
```

**Secondary Button (White)**
```tsx
<button className="px-8 py-5 bg-white text-black border-4 border-black font-black text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all">
  BUTTON TEXT
</button>
```

#### 7. Cards
```tsx
<div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
  {/* Content */}
</div>
```

#### 8. Input Fields
```tsx
<input
  type="text"
  className="w-full p-4 border-4 border-black font-bold text-xl focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
/>
```

### Layout Structure

#### Navigation Bar
- Fixed at top
- 4px black bottom border
- Logo on left, actions on right
- No dropdown menus (keep it simple)

#### Main Content
- Max width: `max-w-2xl` for forms, `max-w-6xl` for grids
- Padding: `px-6 py-12`
- Container: `container mx-auto`

#### Grid Layouts
- Generally use 2 or 3 columns on desktop
- Always include gap: `gap-6` or `gap-8`
- Mobile-first: default to single column, then `md:grid-cols-2`

### Component Patterns

#### Progress Indicator (Steps)
```tsx
<div className="flex gap-4 mb-12">
  <div className={`flex-1 h-3 border-4 border-black ${step >= 1 ? "bg-black" : "bg-white"}`}></div>
  <div className={`flex-1 h-3 border-4 border-black ${step >= 2 ? "bg-black" : "bg-white"}`}></div>
  <div className={`flex-1 h-3 border-4 border-black ${step >= 3 ? "bg-black" : "bg-white"}`}></div>
</div>
```

#### Stat Card
```tsx
<div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
  <div className="text-3xl font-black mb-2">1.8%</div>
  <div className="font-bold">TOTAL FEES</div>
</div>
```

#### Selection Card (Toggle)
```tsx
<button
  onClick={() => setSelected('item')}
  className={`p-6 border-4 border-black font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all ${
    selected === 'item' ? "bg-black text-white" : "bg-white text-black"
  }`}
>
  {/* Content */}
</button>
```

### Spacing System

Use Tailwind's spacing scale consistently:
- **Extra small gap**: `gap-2` (8px)
- **Small gap**: `gap-4` (16px)
- **Medium gap**: `gap-6` (24px)
- **Large gap**: `gap-8` (32px)
- **Section spacing**: `mb-12` or `mb-16` (48-64px)

### Responsive Breakpoints

- `sm`: 640px - rarely used
- `md`: 768px - main breakpoint (2-col grids)
- `lg`: 1024px - larger layouts
- `xl`: 1280px - rarely needed

### Animation

Keep animations minimal and fast:
```css
transition-all  /* Use for hover effects */
```

Avoid:
- Long animations (>300ms)
- Complex transitions
- Excessive motion

### Accessibility

- All interactive elements have 4px borders (high contrast)
- Text is always black on white or white on black (WCAG AAA)
- Font sizes are large (`text-lg` minimum for body)
- Focus states use shadow instead of outline
- No icons without text labels

### File Structure

```
app/
├── page.tsx                 # Landing page
├── payment/page.tsx         # Pay with crypto flow
├── remittance/page.tsx      # Send forex flow
├── invest/page.tsx          # Buy crypto/investments
├── dashboard/page.tsx       # User dashboard
└── globals.css              # Global styles
```

### DO's and DON'Ts

#### DO:
- ✅ Use `font-black` for all headings
- ✅ Use `border-4` for all borders
- ✅ Use hard shadows (`shadow-[Xpx_Xpx_0px_0px_rgba(0,0,0,1)]`)
- ✅ Make buttons chunky (`px-8 py-5`)
- ✅ Use UPPERCASE for button text
- ✅ Keep it simple and bold

#### DON'T:
- ❌ Use colors other than black/white
- ❌ Use gradients
- ❌ Use thin borders (1px, 2px)
- ❌ Use rounded corners on cards/inputs
- ❌ Use soft shadows or blur
- ❌ Make tiny clickable areas
- ❌ Use lowercase for headings/buttons

### Inspiration

This design takes inspiration from:
- **UPI apps**: PhonePe, Google Pay (clean, simple, bold)
- **Neo-brutalism**: Gumroad, Super, Linear
- **Web3 apps**: Uniswap, Zora, Mirror

The goal is to make crypto payments feel as simple and trustworthy as UPI while maintaining a modern, bold aesthetic.

## Testing the UI

Run the dev server:
```bash
cd frontend
npm run dev
```

Visit:
- `/` - Landing page
- `/payment` - Crypto payment flow
- `/remittance` - Forex remittance flow
- `/invest` - Buy crypto
- `/dashboard` - User dashboard

All pages are fully responsive and work on mobile/tablet/desktop.
