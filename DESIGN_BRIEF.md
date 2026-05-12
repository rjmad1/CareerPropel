# Design Brief: CareerPropel - AI-Native Career Management Platform

**Version:** 1.0  
**Last Updated:** May 8, 2026  
**Target Tool:** Figma / Adobe XD / Design Studio  
**Deliverable:** Fully designed screens with components, states, and interactions documented

---

## 📋 Table of Contents

1. Design System Guidelines
2. Color Palette & Typography
3. Component Specifications
4. Screen-by-Screen Design Brief
5. Interaction & Animation Guidelines
6. Responsive Design Requirements
7. Accessibility Standards
8. Design Assets & Deliverables

---

## 1️⃣ Design System Guidelines

### 1.1 Design Philosophy

**CareerPropel** should feel like an intelligent operations dashboard, combining the simplicity of **Trello**, the speed of **Linear**, the flexibility of **Notion**, and the operational transparency of **Monday.com**.

**Key Design Principles:**
- **Operational Clarity**: Information hierarchy that shows what matters most at a glance
- **Reduced Cognitive Load**: Minimize decisions; provide smart defaults and suggestions
- **Visual Feedback**: Every action has visible, reassuring feedback
- **Consistency**: Unified component language across all screens
- **Accessibility First**: WCAG 2.1 AA compliant; keyboard navigation throughout
- **Mobile-Responsive**: Works seamlessly on 375px to 4K displays

---

## 2️⃣ Color Palette & Typography

### 2.1 Color System

**Primary Colors** (Operational Visibility)
- **Brand Blue**: #2563EB (CTAs, active states, primary interactions)
- **Accent Blue**: #1E40AF (Hover, focus states)
- **Dark Blue**: #1E3A8A (Text on light backgrounds)

**Semantic Colors** (Pipeline Stages)
- **Sourced**: #9CA3AF (Gray - beginning)
- **Interested**: #3B82F6 (Blue - engagement)
- **Resume Tailoring**: #A78BFA (Purple - preparation)
- **Applied**: #6366F1 (Indigo - action taken)
- **Recruiter Screen**: #06B6D4 (Cyan - communication)
- **Hiring Manager**: #14B8A6 (Teal - advancement)
- **Technical Interview**: #10B981 (Green - skills validation)
- **System Design**: #059669 (Emerald - complexity)
- **Behavioral**: #84CC16 (Lime - people fit)
- **Final Round**: #EAB308 (Yellow - final push)
- **Offer**: #F97316 (Orange - success)
- **Negotiation**: #EF4444 (Red - negotiating)
- **Rejected**: #64748B (Slate - ended)
- **Archived**: #A1A1A1 (Zinc - historical)

**Status Colors**
- **Success**: #10B981 (Green - positive outcomes)
- **Warning**: #F59E0B (Amber - caution needed)
- **Error**: #EF4444 (Red - critical issues)
- **Info**: #3B82F6 (Blue - notifications)
- **Muted**: #6B7280 (Gray - secondary info)

**Neutral Palette**
- **White**: #FFFFFF
- **Light Gray**: #F9FAFB
- **Gray 100**: #F3F4F6
- **Gray 200**: #E5E7EB
- **Gray 300**: #D1D5DB
- **Gray 500**: #6B7280
- **Gray 700**: #374151
- **Gray 900**: #111827 (Primary text)
- **Black**: #000000

### 2.2 Typography

**Font Stack**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Heading Hierarchy**
- **H1** (Page Title): 32px / 40px, Weight 700, Letter-spacing -0.02em
- **H2** (Section Title): 24px / 32px, Weight 700, Letter-spacing -0.01em
- **H3** (Subsection): 20px / 28px, Weight 600, Letter-spacing -0.005em
- **H4** (Card Title): 16px / 24px, Weight 600
- **H5** (Small Title): 14px / 20px, Weight 600

**Body Text**
- **Large**: 16px / 24px, Weight 400 (Card descriptions)
- **Regular**: 14px / 20px, Weight 400 (Body text, form inputs)
- **Small**: 12px / 16px, Weight 400 (Captions, help text)
- **Tiny**: 11px / 16px, Weight 400 (Badges, timestamps)

---

## 3️⃣ Component Specifications

### 3.1 Button Component

**States**: Default, Hover, Active, Disabled, Loading

**Variants**:
1. **Primary Button** (CTA)
   - Background: #2563EB
   - Text: White
   - Border: None
   - Padding: 10px 16px (md size)
   - Border Radius: 8px
   - Height: 40px

2. **Secondary Button** (Alternative)
   - Background: #E5E7EB
   - Text: #111827
   - Padding: 10px 16px
   - Border Radius: 8px
   - Height: 40px

3. **Danger Button** (Destructive)
   - Background: #EF4444
   - Text: White
   - Padding: 10px 16px
   - Border Radius: 8px
   - Height: 40px

4. **Ghost Button** (Subtle)
   - Background: Transparent
   - Text: #374151
   - Border: 1px solid #D1D5DB
   - Padding: 10px 16px
   - Border Radius: 8px
   - Height: 40px

**Sizes**: Small (32px), Medium (40px), Large (48px)

### 3.2 Card Component

- **Border**: 1px solid #E5E7EB
- **Background**: White
- **Border Radius**: 8px
- **Shadow**: 0px 1px 2px rgba(0,0,0,0.05)
- **Hover Shadow**: 0px 4px 6px rgba(0,0,0,0.1)
- **Padding**: 16px (default)
- **Transitions**: All 200ms ease

### 3.3 Input Field

- **Height**: 40px
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 8px
- **Padding**: 0 12px
- **Font Size**: 14px
- **Focus State**: Border #2563EB, Ring 2px #3B82F6 with 4px offset
- **Error State**: Border #EF4444, Text #DC2626
- **Label**: 14px / 20px, Weight 500, Color #374151

### 3.4 Kanban Card (Job Card)

**Dimensions**: 320px width, auto height

**Structure**:
- **Header** (16px padding):
  - Job Title: 16px / 24px, Weight 600, Color #111827
  - Company: 14px / 20px, Weight 400, Color #6B7280
  
- **Match Score Badge**:
  - Background: #DBEAFE
  - Text: #1E40AF
  - Border Radius: 12px
  - Padding: 4px 8px
  - Font: 12px / 16px, Weight 600

- **Footer** (12px padding):
  - Salary Range: 12px / 16px, Color #6B7280

---

## 4️⃣ Screen Specifications

### Screen 1: Job Applications Board (Main Kanban)

**Purpose**: Main view showing all job applications in Kanban/swimlane format

**Layout**:
- **Sidebar** (Width: 256px)
  - Background: White with border-right
  - Navigation items: 8 main sections
  - Logo area with padding

- **Header** (Height: 60px)
  - Left: Page title + subtitle
  - Right: "+ New Job" button + settings icon
  - Background: White with bottom border

- **Main Content** (Kanban Board)
  - Background: #F9FAFB
  - 14 swimlanes displayed horizontally
  - Each swimlane: 320px width
  - Gap between swimlanes: 24px
  - Horizontal scroll with scroll indicators

- **Right Panel** (Width: 384px, conditional)
  - Job details when a job is selected
  - Border-left: 1px #E5E7EB
  - Sticky header with close button

### Screen 2: Profile Editor

**Layout**: Tab-based interface with 5 sections
- **Tabs**: Profile | Resume | Skills | Achievements | Documents
- **Form Layout**: 2-column on desktop, 1-column on mobile
- **Sections**: Basic Info, Career Summary, Preferences, etc.
- **Actions**: Save / Cancel buttons at bottom

### Screen 3: Interview Prep Workspace

**Layout**: 6-tab vertical interface
- **Tabs**: Company Intelligence | Role Breakdown | STAR Stories | Technical Prep | System Design | Mock Interview
- **Content Area**: Generous padding (32px)
- **Cards**: Section-based organization
- **CTA**: Prominent AI buttons (Mock Interview, Download Prep)

### Screen 4: Analytics Dashboard

**Layout**: Grid-based with responsive cards
- **Section 1**: Pipeline Funnel (full width)
- **Section 2**: Key Metrics (4-column grid)
  - Total Applications
  - Interview Conversion Rate
  - Offers Received
  - Offer Acceptance Rate
- **Section 3**: Performance by Company (table)
- **Section 4**: Skill Demand (bar chart)
- **Section 5**: Application Timeline (line chart)

### Screen 5: Job Detail Panel

**Dimensions**: 384px width (right sidebar)

**Sections** (in order):
1. Header (Sticky): Job title, company, close button
2. Match Score: Percentage with visual bar
3. Salary Info: Range, currency
4. Job Description: Expandable text
5. Timeline: Application history with dates
6. Actions: Move stage, archive, apply buttons
7. Notes: User notes section

---

## 5️⃣ Interaction & Animation Guidelines

### 5.1 Transitions

- **Default Duration**: 200ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design ease-out)
- **Kanban Cards**: Spring animation for natural motion

### 5.2 Hover States

- **Buttons**: 5% darker background, shadow increase
- **Cards**: Shadow increase, 2px lift (translateY -2px)
- **Links**: Color change to #1E40AF, underline appears
- **Nav Items**: Background color change, left border highlight

### 5.3 Loading States

- **Button Loading**: Spinner icon + disabled state, text opacity 50%
- **Content Loading**: Skeleton screens matching layout
- **Kanban Loading**: Skeleton cards in each swimlane

### 5.4 Drag & Drop

- **Drag Start**: Card opacity 70%, show drag handle
- **Over Target**: Target swimlane highlight with 2px border #2563EB
- **Drop**: Smooth movement (200ms)
- **Cancel**: Return to original position (150ms)

---

## 6️⃣ Responsive Design

### Breakpoints

- **Desktop**: 1440px+ (Sidebar visible, right panel visible)
- **Laptop**: 1024px - 1439px (Sidebar collapsible)
- **Tablet**: 768px - 1023px (Sidebar modal, right panel modal)
- **Mobile**: 375px - 767px (Bottom navigation, single swimlane view)

### Mobile-Specific (375px - 767px)

- Sidebar: Hidden, accessible via hamburger menu
- Kanban: Single swimlane visible with horizontal scroll
- Buttons: 48px height (touch-friendly)
- Padding: 16px (relaxed spacing)
- Modals: Full screen or 95% width

---

## 7️⃣ Accessibility Standards

### WCAG 2.1 AA Compliance

**Color & Contrast**
- Text contrast ratio ≥ 4.5:1 for normal text
- Text contrast ratio ≥ 3:1 for large text (18pt+)
- Don't rely on color alone (use icons + labels)

**Interactive Elements**
- Minimum touch target: 44px × 44px (mobile)
- Focus visible indicator: 2px ring with 4px offset
- Logical focus order (left-to-right, top-to-bottom)

**Forms**
- Label associated with each input (for attribute)
- Error messages linked to field (aria-describedby)
- Required fields: Asterisk + aria-required="true"

**ARIA Labels**
- Buttons with icons: aria-label or visually hidden text
- Modals: aria-modal="true", role="dialog"
- Loading: aria-busy="true", aria-label="Loading..."

---

## 8️⃣ Design Assets & Deliverables

### From Designer Expected

1. **Figma/XD Design File**
   - All 5 screens with responsive variations
   - Component library (reusable elements)
   - Design system file
   - Interaction/animation specs
   - Developer annotations

2. **Component Specs Document**
   - Button variants with states
   - Form field specifications
   - Card layouts
   - Modal patterns
   - Badge specifications

3. **Color Guide**
   - Hex codes for all colors
   - Usage guidelines
   - Accessibility checklist

4. **Icon Set** (SVG)
   - 24+ core icons
   - Consistent style
   - All states (default, hover, active, disabled)

5. **Responsive Designs**
   - Desktop (1440px)
   - Tablet (768px)
   - Mobile (375px)

---

## 🎨 Design Inspiration

**Visual References**:
- Trello (Card-based Kanban)
- Linear (Minimal, fast, keyboard-friendly)
- Notion (Flexible layouts)
- Monday.com (Operational dashboards)
- GitHub (Clean data presentation)

---

## ✅ Design Handoff Checklist

Before giving to developers:

- [ ] All 5 main screens designed with multiple states
- [ ] Color palette validated for accessibility
- [ ] Typography scale applied consistently
- [ ] Components have all states (default, hover, active, disabled, loading, error)
- [ ] Responsive designs for 3 breakpoints
- [ ] Interactions/animations documented
- [ ] Icons created or sourced (SVG format)
- [ ] Design file organized with clear naming
- [ ] Developer annotations complete
- [ ] Component library created
- [ ] Spacing/sizing grid applied (8px system)
- [ ] Accessibility reviewed (contrast, labels, focus states)

---

**Next Steps**: Share this design brief with your designer (or design tool) and they can create pixel-perfect designs following these specifications.