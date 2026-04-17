---
name: website-creation-automation
description:
  Automate end-to-end website creation with AI-powered optimization, design, and
  testing. Trigger this skill whenever the user wants to create a new website,
  build a landing page, design a web application, or automatically generate a
  complete website from a description. This skill takes a user's website idea or
  prompt, optimizes it for clarity, designs a modern responsive website, and
  automatically tests it for quality issues. Use this skill for any "create a
  website" or "build a web application" request, including landing pages,
  portfolio sites, e-commerce pages, dashboards, or any web-based project.
compatibility:
  models:
    - claude-sonnet-4-20250514 (design and testing)
    - claude-haiku-4.5-20251001 (bug fixes)
  required_skills:
    - prompt-optimizer
    - frontend-atomic-design
    - ui-ux-testing
---

# Website Creation Automation Skill

An intelligent, end-to-end automation workflow for creating complete, tested
websites from simple prompts.

## What This Skill Does

This skill orchestrates a complete website creation pipeline:

1. **Prompt Optimization** — Takes your website description and optimizes it
   into a detailed, structured prompt
2. **Website Design** — Uses the optimized prompt to design and build a modern,
   responsive website
3. **Automated Testing** — Tests the generated website for visual, interactive,
   and responsive issues
4. **Auto-Fix** — Detects and fixes any issues found during testing

The entire workflow is automated, so you just provide a simple description of
what you want, and the skill handles the rest.

## Core Workflow

### Step 1: Optimize Your Website Prompt

Your initial description (e.g., "Create a portfolio website for a freelance
designer") is passed to the **prompt-optimizer** skill, which:

- Adds specific details about layout, features, and target audience
- Clarifies design preferences and functionality requirements
- Structures the request to guide high-quality website generation
- Returns a detailed, optimized prompt ready for design

**Example transformation:**

```
Input: "Create a portfolio website for a freelance designer"
↓
Output: "Create a modern portfolio website for a freelance graphic designer.
Include: hero section with featured work, project showcase grid (6-8 projects),
about section, services list, client testimonials, contact form, and footer.
Target audience: potential clients and collaborators. Design should be minimalist
with emphasis on visual work. Mobile-responsive. Use modern sans-serif typography
and white space. Include smooth scroll animations."
```

### Step 2: Design the Website

The **frontend-atomic-design** skill uses the optimized prompt to:

- Break down the website into atomic components (atoms, molecules, organisms)
- Create a responsive layout that works on desktop, tablet, and mobile
- Apply modern design patterns using Tailwind CSS
- Build interactive elements and proper semantic HTML
- Generate a complete, production-ready HTML file (or React component)

**Outputs:**

- Full HTML file with embedded CSS and JavaScript
- All assets (icons, fonts) are self-contained
- Responsive design with mobile-first approach
- Accessible markup with semantic HTML5

### Step 3: Test the Website

The **ui-ux-testing** skill performs comprehensive testing:

- Visual regression testing (captures baseline screenshots)
- Responsive layout validation (mobile, tablet, desktop)
- Interactive element testing (buttons, forms, links)
- Accessibility checking (color contrast, keyboard navigation)
- Cross-browser compatibility assessment
- User flow validation

**Testing output includes:**

- Screenshots from multiple viewport sizes
- Detailed findings and issues detected
- Visual regression comparison
- Recommendations for improvements

### Step 4: Auto-Fix Detected Issues

Any issues detected in testing are automatically fixed:

- **Using Haiku 4.5** — A faster model optimized for targeted fixes
- **HTML-only fixes** — Modifications to structure, styling, or interactivity
- **Preserves design intent** — Fixes maintain the original design aesthetic
- **Re-validates** — Quick verification that fixes resolved the issues

**Common fixes include:**

- Correcting responsive behavior issues
- Fixing accessibility problems
- Adjusting spacing, alignment, or colors
- Improving interactive element behavior
- Ensuring all content is properly visible

---

## When to Use This Skill

Use this skill whenever you want to:

- **Create a new website** from scratch based on a description
- **Build a landing page** for a product, service, or event
- **Design a portfolio site** to showcase your work
- **Create an e-commerce page** with product displays
- **Build a dashboard or web app** UI
- **Generate a multi-page website** (returns first page, can iterate)
- **Prototype a website concept** quickly

## How to Trigger This Skill

Simply provide:

1. **Website description** — What kind of website you want (e.g., "e-commerce
   store for handmade jewelry", "SaaS landing page", "restaurant menu website")
2. **Optional details** — Any specific requirements (colors, features, tone,
   audience)

The skill handles everything else automatically.

## Example Usage

**User prompt:** "Create a landing page for a sustainable fashion startup called
EcoStitch. Include a hero section, features of our eco-friendly materials,
pricing plans, customer testimonials, and a newsletter signup."

**Skill processes:**

1. Optimizes prompt with specific design details and layout structure
2. Designs a modern, responsive landing page with all requested sections
3. Tests layout across mobile/tablet/desktop, forms, links, and visual design
4. Fixes any responsive or interactive issues found
5. Returns production-ready HTML file

**Final output:** A complete, tested, bug-free website ready to deploy or
customize further.

---

## Technical Details

### Model Usage

- **Sonnet 4.6** — Used for optimization, design, and testing (high-quality
  complex tasks)
- **Haiku 4.5** — Used for bug fixes only (fast, targeted improvements)

### Skill Integration

This skill coordinates three core skills in sequence:

```
User Prompt
    ↓
[prompt-optimizer] → Optimized Prompt
    ↓
[frontend-atomic-design] → HTML/React Website
    ↓
[ui-ux-testing] → Test Results + Screenshots
    ↓
[Bug Fix Loop] → Fixed HTML/React Website
    ↓
Final Website (Ready to Use)
```

### Output Format

The final website is delivered as:

- **HTML file** — Self-contained with CSS and JavaScript embedded
- **Screenshots** — Before/after testing comparison
- **Test report** — Issues found and fixes applied
- **Deployment ready** — Can be hosted on any static hosting service

---

## Limitations & Notes

- **Single-page output** — Generates one complete page (though can be expanded
  to multi-page)
- **Static by default** — Returns HTML; can generate React components if needed
- **Database-free** — Forms are functional but don't store data without backend
  integration
- **Rapid iteration** — If you want to modify the result, you can iterate by
  running the skill again with updated requirements

---

## Tips for Best Results

1. **Be descriptive** — More detail in your initial prompt leads to better
   results
2. **Specify audience** — Who is this website for? (target customers, users,
   etc.)
3. **Include features** — What should the website do? (e.g., showcase products,
   collect emails, etc.)
4. **Mention style** — Any aesthetic preferences? (minimalist, colorful,
   corporate, playful, etc.)
5. **Test thoroughly** — Review the testing results to ensure the site meets
   your needs

---

## Workflow Diagram

```
START
  ↓
Input: Website Description
  ↓
[Call: prompt-optimizer skill]
  ↓
Receive: Optimized Detailed Prompt
  ↓
[Call: frontend-atomic-design skill]
  ↓
Receive: HTML/React Website Code
  ↓
[Call: ui-ux-testing skill]
  ↓
Receive: Test Results + Issues Found
  ↓
Are there critical issues?
  ├─ YES → [Use Haiku 4.5 to fix] → Re-test
  ├─ NO → Proceed
  ↓
COMPLETE: Return Website + Test Report
```

---

## Future Enhancements

Potential expansions to this skill:

- Multi-page website generation (homepage, about, services, contact, etc.)
- CMS integration (connect to content management systems)
- Backend API scaffolding (Node.js/Express templates)
- SEO optimization (meta tags, structured data, open graph)
- Analytics integration (Google Analytics, Mixpanel)
- E-commerce integration (payment processing, inventory)
