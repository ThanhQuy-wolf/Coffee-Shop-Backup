---
name: ui-ux-testing
description:
  Automated visual regression testing and UI/UX analysis for web applications.
  Use this skill whenever developers mention "test this UI", "visual
  regression", "test the UI", "check this interface", "UI testing", or want to
  create automated tests for web pages. Analyzes URLs and generates
  comprehensive test strategies including Playwright/Cypress test scripts,
  manual testing checklists, visual regression detection, and detailed reports
  with findings and recommendations.
compatibility:
  tools: Claude in Chrome browser automation
  frameworks: Playwright, Cypress, Selenium
---

# UI/UX Testing Skill

This skill helps developers create automated visual regression tests and
comprehensive UI/UX testing strategies for web applications.

## Overview

When a developer asks you to test a UI or create visual regression tests, this
skill guides you through:

1. **Analyzing the target URL** - Inspect the web page structure and components
2. **Generating test strategies** - Create both automated and manual testing
   approaches
3. **Writing test code** - Generate Playwright/Cypress test scripts or Selenium
   code
4. **Creating test checklists** - Manual testing steps for visual regression and
   UX flows
5. **Generating reports** - Detailed findings, issues, and recommendations in
   markdown/HTML

## When to Trigger

Trigger this skill when the user:

- Provides a URL and asks to "test this UI"
- Requests "visual regression testing" for a web page
- Wants to "check accessibility" or test a component
- Asks to "create automated tests" for a UI
- Wants a "testing strategy" or "test plan" for a web application
- Mentions QA, testing, or validation of UI components

## Workflow

### Step 1: Inspect the Target URL

Use Claude in Chrome to:

- Navigate to the provided URL
- Take screenshots of different viewport sizes (desktop, tablet, mobile)
- Inspect the DOM structure using `read_page` tool
- Identify key components, interactive elements, and critical flows
- Note responsive behavior and CSS properties

### Step 2: Create a Test Strategy

Based on your inspection, identify:

- **Visual elements** to regression test (buttons, forms, headers, layouts)
- **Interactive flows** to test (hover states, click handlers, form submission)
- **Responsive breakpoints** to validate (mobile, tablet, desktop)
- **Accessibility concerns** (ARIA labels, color contrast, keyboard navigation)
- **Critical user paths** to validate (common workflows)

### Step 3: Generate Test Code

**For Automated Testing (Choose one or more):**

#### Playwright (Recommended)

```javascript
// Example structure
import { expect, test } from "@playwright/test";

test("visual regression - homepage", async ({ page }) => {
  await page.goto("https://example.com");

  // Capture baseline screenshot
  await expect(page).toHaveScreenshot("homepage.png");

  // Test interactive elements
  await page.hover("button.primary");
  await expect(page).toHaveScreenshot("button-hover.png");
});

test("responsive layout - mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("https://example.com");
  await expect(page).toHaveScreenshot("mobile-layout.png");
});
```

#### Cypress

```javascript
describe("Visual Regression Tests", () => {
  beforeEach(() => {
    cy.visit("https://example.com");
  });

  it("captures baseline screenshot", () => {
    cy.screenshot("homepage");
    cy.get('[data-testid="header"]').should("be.visible");
  });

  it("tests button hover state", () => {
    cy.get("button.primary").trigger("mouseenter");
    cy.screenshot("button-hover-state");
  });
});
```

#### Selenium

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from PIL import Image

driver = webdriver.Chrome()
driver.get('https://example.com')

# Capture screenshot
driver.save_screenshot('homepage.png')

# Test responsive
driver.set_window_size(375, 812)
driver.save_screenshot('mobile-view.png')
```

### Step 4: Create Manual Testing Checklist

Generate a checklist including:

- [ ] **Visual Consistency**
  - [ ] All elements render correctly at 1920x1080
  - [ ] All elements render correctly at 1366x768
  - [ ] All elements render correctly at 768x1024 (tablet)
  - [ ] All elements render correctly at 375x667 (mobile)
  - [ ] Colors match design specifications
  - [ ] Typography renders correctly (font families, sizes, weights)
  - [ ] Images load and display at correct aspect ratios

- [ ] **Responsive Behavior**
  - [ ] Layout adapts correctly on mobile (no horizontal scroll)
  - [ ] Navigation collapses/expands appropriately
  - [ ] Form inputs are touch-friendly (min 44x44px)
  - [ ] Content reflows without overlapping

- [ ] **Interactive Elements**
  - [ ] All buttons are clickable and have hover states
  - [ ] Form inputs accept user input
  - [ ] Dropdowns open/close correctly
  - [ ] Links are underlined and properly colored

- [ ] **Accessibility**
  - [ ] Keyboard navigation works (Tab key)
  - [ ] Color contrast meets WCAG AA standards
  - [ ] Images have alt text
  - [ ] Form labels are associated with inputs

- [ ] **Critical User Paths**
  - [ ] [Specific path 1]: [Steps and expected result]
  - [ ] [Specific path 2]: [Steps and expected result]

### Step 5: Generate Test Report

Create an HTML/Markdown report with:

```markdown
# UI/UX Testing Report

## Executive Summary

- URL tested: [URL]
- Viewports tested: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- Testing date: [Date]
- Total issues found: [Count]

## Issues Found

### Critical (Breaks functionality)

1. **Issue Title**
   - Severity: Critical
   - Location: [Element/Component]
   - Steps to reproduce: [Steps]
   - Expected: [What should happen]
   - Actual: [What actually happens]
   - Screenshot: [If applicable]

### Major (Significant visual/UX impact)

1. **Issue Title**
   - Severity: Major
   - Location: [Element/Component]
   - Impact: [User impact]

### Minor (Polish/optimization)

1. **Issue Title**
   - Severity: Minor
   - Location: [Element/Component]
   - Recommendation: [Suggestion]

## Visual Regression Analysis

### Desktop (1920x1080)

- [List observations]
- [List changes from baseline if available]

### Tablet (768x1024)

- [List observations]
- [Responsive issues found]

### Mobile (375x667)

- [List observations]
- [Mobile-specific issues]

## Accessibility Assessment

| Element   | Issue   | WCAG Level | Recommendation |
| --------- | ------- | ---------- | -------------- |
| [Element] | [Issue] | [AA/AAA]   | [Fix]          |

## Recommendations

1. **High Priority**
   - [Recommendation with rationale]

2. **Medium Priority**
   - [Recommendation with rationale]

3. **Low Priority**
   - [Recommendation with rationale]

## Test Coverage Summary

- Automated tests needed: [Count and types]
- Manual test cases: [Count]
- Estimated testing effort: [Time estimate]
- Regression risk: [High/Medium/Low]

---

Generated using UI/UX Testing Skill
```

## Output Options

Based on what the developer needs, generate:

1. **Test Code Only** - Playwright/Cypress/Selenium scripts ready to integrate
2. **Testing Strategy** - Comprehensive checklist and manual test plan
3. **Full Report** - Screenshots, findings, issues, and automated test code
4. **All of the above** - Complete testing package

## Best Practices

- **Multiple viewports:** Always test at least mobile (375px), tablet (768px),
  and desktop (1920px)
- **Visual baselines:** Save baseline screenshots before making changes
- **Critical paths:** Prioritize testing main user workflows first
- **Accessibility first:** Include WCAG AA compliance checks
- **Clear assertions:** Make test assertions explicit and meaningful
- **Maintainability:** Use data attributes (data-testid) for reliable element
  selection

## Example: Complete Testing Session

1. Developer provides URL: "https://myapp.com/dashboard"
2. You inspect the page (screenshots, DOM, responsive behavior)
3. You identify:
   - Dashboard header with navigation
   - Data table with sorting/filtering
   - Form for creating items
   - Mobile menu collapse
4. You generate:
   - Playwright tests for visual regression
   - Manual testing checklist
   - HTML report with findings
5. Developer receives complete testing artifact ready to use

## Tips for Success

- Take screenshots at each viewport to catch responsive issues
- Test interactive states (hover, focus, active, disabled)
- Verify critical user journeys end-to-end
- Include accessibility testing automatically
- Provide both automated (code) and manual (checklist) approaches
- Make reports actionable with clear severity levels and recommendations

---

**Last Updated:** 2024 **Skill Version:** 1.0
