# FixMyKasi: Stitch prompts

These prompts follow Section 14 of the course PRD template (Step 0 and Step 1). Every value comes from [docs/PRD.md](../PRD.md) v0.3, so the designs match the PRD exactly.

## How to use them

1. Open [Stitch](https://stitch.withgoogle.com) and start a new **Web** project called **FixMyKasi**.
2. Paste **Prompt 0** first and check the style guide. Fix anything wrong before you continue.
3. Paste the screen prompts **one at a time**, in order. Check each result against its spec before you move on.
4. For S8 Ward Queue and S9 Ward Dashboard, generate both the phone version (390 x 844) and the desktop version (1440 wide).
5. When every screen is done, paste the **final consistency check** prompt and fix what it finds.
6. Export each screen as a PNG into `docs/designs/`, named like `S01-welcome.png` or `M02-assign-fault.png`, and add the Stitch project link to the README.

**Golden rule:** if Stitch gets something wrong because the PRD was unclear, fix the PRD first (with a change log row), then regenerate the screen.

---

## Prompt 0: Style guide

```text
You are a senior UI designer. Using ONLY the design values and shared components I pasted below, create a one-page style guide for my app "FixMyKasi": colour swatches with hex codes, the text sizes, spacing, buttons (primary, secondary, danger, disabled), text fields (normal, focused, error), cards, header, tab bar or menu, toast, offline banner and empty-state block. Do not design any app screens yet. Do not add colours, fonts or components I did not list.

=== SECTION 9: DESIGN DIRECTION ===
## 9. Design direction

**9.1 Look and brand**

| Item | Our choice |
| --- | --- |
| Look and feel | Official, trustworthy, clear |
| Colour source | The primary colours of the national Coat of Arms (green, brown, gold and orange) with white, as the [GCIS government website guidelines](https://www.gcis.gov.za/guidelines/website/common-look-feel) require for government sites. Values are from the [GCIS Coat of Arms colour palette](https://www.gcis.gov.za/sites/default/files/docs/resourcecentre/guidelines/corpid/3_4.pdf). FixMyKasi is not a government service, so it never shows the Coat of Arms, the national flag or any department's logo. |
| Primary colour | Coat of Arms Green #005D28 (Pantone 349C). Buttons, links, active tabs. White text on it is 8.1:1. |
| Secondary colour | Heritage Brown #531A17 (Pantone 188C). Top header bar and headings. White text on it is 13.7:1. |
| Accent colour | Gold #D8A851 (Pantone 127C). Thin accent lines under the header, icons and highlights. Only dark text #1C1C1C is ever placed on it (7.8:1). Never used for text on white. |
| Urgent label | Orange #EF4718 (Pantone 152C) background with dark text #1C1C1C (4.5:1) and a warning icon |
| Background colour | White #FFFFFF for pages and cards. Warm grey #F8F6F1 for page sections and table stripes. |
| Main text colour | Near-black #1C1C1C. Secondary text #5C5650 (7.2:1 on white). |
| Error / success / warning colours | #B42318 / #1E7B34 / Ochre Brown #87451A (Pantone 146C) |
| Status colours (dot on the chip, with the status name always written) | Received #5C5650 · Viewed #825B32 · Assigned #531A17 · Scheduled #87451A · In progress #B46E12 · Fixed #005D28 · Closed #1C1C1C · Reopened #B42318 |
| Dark mode | No (v1) |
| Font | Inter (Google Fonts) |
| Text sizes | Title 24 px bold · Heading 18 px semibold · Body 16 px regular · Labels and buttons 16 px semibold · Small 13 px regular (minimum 12 px) |
| Spacing unit | 8 px. Gaps are 4, 8, 16, 24 or 32 px. |
| Screen side margin | 16 px on phones, 24 px on tablets, 32 px on desktop |
| Corner radius | Cards 12 px · inputs 8 px · buttons 8 px · chips pill (fully rounded) · photos 8 px |
| Shadows | Soft: cards use 0 1px 3px rgba(16, 24, 40, 0.1) |
| Button height | 48 px |
| Icon set | Lucide, outline, 24 px |
| Logo | Wordmark "FixMyKasi" in Inter bold, Coat of Arms Green #005D28, with a small gold #D8A851 map-pin icon containing a wrench, to the left. No Coat of Arms or government emblem. |
| Images and illustrations | Fault photos from users. Simple flat line illustrations in green, brown and gold for empty states and S1. Initials in a green circle instead of profile pictures. |
| Reference apps | gov.za and national department websites such as Home Affairs, Employment and Labour, and Justice (white pages, Coat of Arms colours, a plain official look). Takealot order tracking (clear step-by-step status timeline). Google Maps (simple pins and place cards). |

**9.2 Tone of voice:** Friendly, clear and respectful, like a helpful neighbour. Short sentences and everyday words. Example: "Fault reported. Your reference number is FMK-2026-00125." rather than "Your service request has been successfully submitted."

**9.3 Platform rules (Web)**
- **Design first:** mobile at 390 × 844 px. S8 and S9 are also designed at 1440 px wide.
- **Phone (under 640 px):** one column, bottom tab bar, main buttons at the bottom within thumb reach, modals as bottom sheets.
- **Tablet (640 to 1024 px):** one column with wider margins, bottom tab bar.
- **Desktop (over 1024 px):** left side menu instead of the tab bar. S4, S7, S8 and S10 show cards in 2 columns, or a table on S8. Modals are centred, 480 px wide.
- **Maximum content width:** 1200 px, centred.
- **Hover and focus:** every clickable element has a hover look (slightly darker) and a visible keyboard focus ring (2 px, primary colour, 2 px gap).

**9.4 Accessibility**
- Body text 16 px. Small text never under 12 px.
- Every text colour above has been chosen to pass 4.5 to 1 on its background. The team checks each one at webaim.org/resources/contrastchecker before Checkpoint 2.
- Everything tappable is at least 44 × 44 px.
- Colour is never used alone: status chips always show the status name, and labels have icons and words.
- Every icon-only button and every image has a text label for screen readers, e.g. photos "Photo of the fault, 1 of 3".
- All screens work with a keyboard only.

---

=== SECTION 8.3: SHARED COMPONENTS ===
**8.3 Shared components**

| Component | Used on | What it contains | How it behaves |
| --- | --- | --- | --- |
| Header | All screens | Heritage Brown #531A17 bar with white back arrow (where there is a previous screen), white title and optional right-side button, with a 3 px gold #D8A851 line underneath | Sticks to the top when scrolling |
| Tab bar | S4 to S11 | Role-based tabs (7.2), each with a Lucide icon and a text label | Active tab uses the primary colour and bold label. On desktop over 1024 px it becomes a left side menu. |
| Primary button | Most screens | Solid primary colour, white 16 px semibold label, 48 px high | Disabled: grey background #D0D5DD, grey text #667085. Loading: spinner replaces the label. |
| Secondary button | S1, S9, S11, M6 | White background, primary colour border and label | Same sizes and states as the primary button |
| Danger button | S11, M5 | Solid error colour, white label | Used only for deleting |
| Text field | All forms | Label above, field, helper or error text below | Normal: grey border. Focused: 2 px primary border. Error: error-colour border, error icon and message below. |
| Fault card | S4, S7, S8, M6 | Thumbnail, fault type, status chip, labels, address and ward, reference number, upvotes, date (S4 spec) | Whole card is tappable |
| Job card | S10 | As in the S10 spec | Card opens S5. "Update" opens M3. |
| Status chip | S4, S5, S7, S8, S10, M3, M6 | Status name in text, with a coloured dot (9.1 status colours) | Never colour alone: the status name is always written |
| Labels | S4, S5, S7, S8, S10 | "Urgent" (warning icon), "Overdue" (clock icon, red), "Delayed" (hourglass icon) | Shown next to the status chip |
| Stat card | S9 | Big number, label, small caption | Overdue card uses the error colour plus an icon |
| Toast | S1, S5, S6, S8, S10, S11 | One line of white text on near-black | Disappears after 3 seconds |
| Confirmation pop-up | M4, M5 | Title, text, one main and one cancel button | Closes on cancel or tap outside (M5 only closes on "Cancel") |
| Empty-state block | S4, S7, S8, S9, S10 | Simple line illustration, message, optional button | Centred in the content area |
| Loading placeholder | S4, S5, S7 to S11 | Grey blocks the shape of the content | Gently pulses |
| Offline banner | All screens | Grey bar: "You're offline. Changes will not be saved." (S6 uses its own text, 8.2) | Shown at the top while offline. Save buttons disabled. |
```

---

## Prompt 1: S1 Welcome

```text
You are a senior UI/UX designer. Design screen "S1 Welcome" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S1 Welcome**
- **Purpose:** Explain FixMyKasi in one sentence and send the user to sign up, log in or browse.
- **Who can open it:** Logged out
- **Comes from / goes to:** App start, S11 Log out or M5 → S1 → S2, S3, S4
- **Layout (top to bottom):**
  1. Language picker, top right: "English", "Afrikaans", "isiZulu", "Sepedi" (BR18)
  2. Logo (9.1), centred
  3. Illustration: a resident pointing a phone at a pothole, with a field team member in a hard hat
  4. Title "Report it. Track it. Get it fixed."
  5. Text "Report potholes, burst pipes, broken streetlights and more, and see who is fixing them."
  6. Primary button "Create account"
  7. Secondary button "Log in"
  8. Text link "Browse faults without an account"
- **Form fields:** None
- **Buttons and links:** "Create account" → S2. "Log in" → S3. "Browse faults without an account" → S4. Language picker → changes all text on the screen immediately.
- **States:**
  - Normal: as above.
  - Empty, Loading and Error: not needed, because this screen loads no data.
  - Offline: offline banner (8.3). Buttons still work.
  - Success: after deleting an account, toast "Your account has been deleted."
- **Sample content:** Language set to isiZulu, title "Bika. Landela. Kulungiswe." (the other languages are added one per PR after English, each checked by a first-language speaker, 13.2).

```

---

## Prompt 2: S2 Sign Up

```text
You are a senior UI/UX designer. Design screen "S2 Sign Up" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S2 Sign Up**
- **Purpose:** Create a resident account.
- **Who can open it:** Logged out
- **Comes from / goes to:** S1 or S3 → S2 → S3
- **Layout:**
  1. Header: back arrow, title "Create account"
  2. Form fields (table below)
  3. Primary button "Create account"
  4. Text "Already have an account?" with link "Log in"
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| Full name | Text | Yes | "e.g. Thandeka Mokoena" | 2 to 60 characters | "Enter your full name." |
| Email | Email | Yes | "you@example.com" | Valid email format, lower-cased | "Enter a valid email address." / "This email already has an account. Log in instead." |
| Phone number | Phone | No | "+27 82 123 4567" | +27 followed by 9 digits | "Enter a South African number, like +27 82 123 4567." |
| Home ward | Dropdown | Yes | "Choose your ward" | One of the wards in reference data | "Choose your ward." |
| Password | Password | Yes | "At least 8 characters" | 8+ characters, at least 1 letter and 1 number, show/hide toggle | "Use at least 8 characters with a letter and a number." |
| I am 18 or older | Checkbox | Yes | Unticked | Must be ticked | "You must be 18 or older to use FixMyKasi." |
| I agree to the Privacy Notice | Checkbox | Yes | Unticked. "Privacy Notice" is a link to M7. | Must be ticked | "Please agree to the Privacy Notice to continue." |

- **Buttons and links:** "Create account" → creates the account → S3 with the banner "Check your email to confirm your account." "Log in" → S3. "Privacy Notice" → M7.
- **States:**
  - Normal: empty form.
  - Empty: not needed, because the form is the content.
  - Loading: "Create account" shows a spinner and is disabled.
  - Error: "Something went wrong. Try again." above the button. The form keeps what the user typed.
  - Offline: offline banner. "Create account" disabled.
  - Success: goes to S3 with the banner above.
- **Sample content:** Thandeka Mokoena, thandeka.m@example.com, +27 82 555 0134, Ward A: Orlando West.

```

---

## Prompt 3: S3 Log In

```text
You are a senior UI/UX designer. Design screen "S3 Log In" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S3 Log In**
- **Purpose:** Log in to any role.
- **Who can open it:** Logged out
- **Comes from / goes to:** S1, S2, S12 or a confirm-email link → S3 → S4 (Resident), S8 (Ward admin), S10 (Field team), M1
- **Layout:**
  1. Header: back arrow, title "Log in"
  2. Banner area for messages ("Check your email to confirm your account.", "Email confirmed. Please log in.", "Password changed. Please log in.")
  3. Email field
  4. Password field with show/hide toggle
  5. Text link "Forgot password?", right-aligned
  6. Primary button "Log in"
  7. Text "New to FixMyKasi?" with link "Create account"
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| Email | Email | Yes | "you@example.com" | Valid email format | "Enter a valid email address." |
| Password | Password | Yes | "Your password" | Not empty | "Enter your password." |

- **Buttons and links:** "Log in" → the user's home screen by role. "Forgot password?" → M1. "Create account" → S2.
- **States:**
  - Normal: empty form, with a banner if one was passed in.
  - Loading: "Log in" shows a spinner and is disabled.
  - Error: "Wrong email or password." / "Too many attempts. Please wait a few minutes and try again." / "Please confirm your email first. Check your inbox." with a "Resend email" link.
  - Offline: offline banner. "Log in" disabled.
  - Success: goes to the role's home screen.
  - Empty: not needed.
- **Sample content:** zanele.k@example.com (ward admin, Ward A).

```

---

## Prompt 4: S4 Fault List

```text
You are a senior UI/UX designer. Design screen "S4 Fault List" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S4 Fault List**
- **Purpose:** Browse, filter, search and map faults.
- **Who can open it:** Everyone
- **Comes from / goes to:** S1, S3 or the Faults tab → S4 → S5, S6
- **Layout:**
  1. Header: logo on the left. On the right: "Log in" button for visitors, nothing for logged-in users.
  2. Search field: placeholder "Search by reference number or street"
  3. Filter row (chips): Ward, Category, Status. Sort dropdown: "Newest" / "Most upvoted" (BR6)
  4. Toggle: "List" / "Map" (Map only once F8 is built)
  5. List of Fault cards (8.3), 20 at a time (BR6), or the map (BR21)
  6. Tab bar (8.3), Faults active
- **Fault card shows, in order:** first photo (square thumbnail, 72 px), fault type in bold, status chip, "Urgent" label if urgent, "Overdue" or "Delayed" label if they apply, street address and ward, reference number, "14 upvotes" ("1 upvote", hidden at 0), date reported ("12 Nov 2026").
- **Form fields:** Search field (text, up to 60 characters).
- **Buttons and links:** Fault card or map pin → S5. Filter chips → open a dropdown list. "Clear filters" → removes all filters. Pull down (phones) or "Refresh" button (desktop) → reloads.
- **States:**
  - Normal: fault cards as above.
  - Empty: "No faults reported yet. Be the first to report one." with primary button "Report a fault" (→ S6, or S3 if logged out). With filters: "No faults match your filters." with "Clear filters".
  - Loading: 3 grey placeholder cards.
  - Loading more: small spinner under the last card.
  - Error: "Something went wrong. Try again." with a "Try again" button.
  - Offline: last loaded faults stay visible, with the offline banner.
  - Success: not needed, because no action is completed here.
- **Sample content:** Faults FMK-2026-00123, FMK-2026-00121 and FMK-2026-00118 from 8.4.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 5: S5 Fault Details

```text
You are a senior UI/UX designer. Design screen "S5 Fault Details" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S5 Fault Details**
- **Purpose:** See one fault, its photos and full status history, and take the actions allowed for my role.
- **Who can open it:** Everyone. Actions depend on role.
- **Comes from / goes to:** S4, S6, S7, S8, S10 or M6 → S5 → M2, M4, back
- **Layout:**
  1. Header: back arrow, title is the reference number, e.g. "FMK-2026-00123"
  2. Photo carousel: the resident's photos. Once F6 is built and the fault is Fixed or Closed, two labelled groups "Before" and "After".
  3. Fault type in bold, status chip, and any "Urgent", "Overdue" or "Delayed" labels
  4. Location: street address, landmark, ward
  5. Description. If translated (F7): the English text with the label "Translated by AI", then "Original (isiZulu):" and the original text. Residents see only the original.
  6. Responsibility block: "Department: Water", "Done by: Municipal team" or "Done by: Contractor", "Contractor: Sample Plumbing Services (Pty) Ltd", "Expected fix date: 18 Nov 2026", "Estimated time to fix: 2 days". Before assignment: "Not assigned yet".
  7. Upvote button: "Affects me too" with the count (BR5)
  8. Status timeline: one row per StatusChange, newest at the top: status, date and time ("12 Nov 2026, 14:05"), and note if any
  9. Role actions (only one of these blocks shows):
     - Reporter, status Fixed: "Is this fault fixed?" with primary button "Yes, it's fixed" and secondary button "No, still a problem"
     - Ward admin of this ward: primary button "Assign" (status Received, Viewed or Reopened) or "Reassign" (Assigned or Scheduled). Text "Municipal reference: JW-778812" if saved. For contractors, the field team contact number.
     - Field team of this fault: primary button "Update status" → M3
  10. Tab bar
- **Form fields:** None on the screen (see M2, M3, M4).
- **Buttons and links:** "Affects me too" → adds or removes an upvote. "Yes, it's fixed" → Closed, toast "Thanks for confirming." "No, still a problem" → M4. "Assign" / "Reassign" → M2. "Update status" → M3. Visitor taps "Affects me too" → S3.
- **States:**
  - Normal: as above.
  - Empty: not needed, because a fault always has at least its Received row in the timeline.
  - Loading: grey photo block and 4 grey lines.
  - Error: "We couldn't load this fault. Try again." with "Try again". A reference number that doesn't exist: "We couldn't find this fault." with "Back to faults".
  - Offline: last loaded details stay visible, offline banner, all action buttons disabled.
  - Success: after reporting, toast "Fault reported. Your reference number is FMK-2026-00125." After assigning, toast "Fault assigned".
- **Sample content:** FMK-2026-00123 from 8.4, with timeline: Received 11 Nov 2026, 07:42 · Viewed 11 Nov 2026, 09:15 · Assigned 11 Nov 2026, 09:30 · Scheduled 12 Nov 2026, 08:00 ("Parts ordered and crew booked").

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 6: S6 Report a Fault

```text
You are a senior UI/UX designer. Design screen "S6 Report a Fault" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S6 Report a Fault**
- **Purpose:** Report a new fault.
- **Who can open it:** Logged in: Resident (verified). Visitors who tap the Report tab go to S3.
- **Comes from / goes to:** Report tab, S4 or S7 → S6 → M6 → S5
- **Layout:**
  1. Header: title "Report a fault"
  2. Emergency notice (yellow box with a warning icon): "If someone's life is in danger, call 10177 or 112 from a cellphone."
  3. Photos: up to 3 photo tiles with "Add photo" (camera or gallery), and the checkbox "It is not safe to take a photo" (BR2)
  4. AI suggestion chip under the photos, once F7 is built (BR20)
  5. Form fields (table below)
  6. Primary button "Next" (checks for similar reports, BR4), which becomes "Submit report" when there are none or the resident chose "No, report a new fault" on M6
  7. Tab bar, Report active
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| Photos | Image upload | Yes, unless "not safe" is ticked | "Add photo" | 1 to 3 photos, BR2 | "Add at least 1 photo." / "This photo is too big or not a supported type. Use a JPG, PNG, HEIC or WebP under 10 MB." |
| Category | Dropdown | Yes | "Choose a category" | One of the 6 categories (10.4) | "Choose a category." |
| Fault type | Dropdown | Yes | "Choose the fault" | Fault types in the chosen category (10.4) | "Choose the fault." |
| This is dangerous | Checkbox | No | Unticked | Ticked and locked for auto urgent fault types (BR19) | None |
| Ward | Dropdown | Yes | Defaults to the resident's home ward | One of the wards | "Choose a ward." |
| Street address | Text | Yes | "e.g. 23 Vilakazi Street, Orlando West" | 5 to 120 characters (BR3) | "Enter the street address." |
| Landmark | Text | No | "e.g. Opposite the Shell garage" | Up to 60 characters | "Keep the landmark under 60 characters." |
| Use my location | Toggle | No | On | Asks the browser for GPS (BR3) | "Location is off. Please type the street address." |
| Description | Text area | Yes | "What is happening, and since when?" | 10 to 500 characters, or 30 to 500 when no photo (BR2, BR17). Character counter "0 / 500". | "Describe the fault in at least 10 characters." |

- **Buttons and links:** "Next" → M6 if similar reports exist, otherwise the button becomes "Submit report". "Submit report" → saves the fault → S5.
- **States:**
  - Normal: empty form with the ward filled in.
  - Empty: not needed, because the form is the content.
  - Loading: "Submit report" shows "Uploading photos…" with a progress bar and is disabled.
  - Error: "Upload failed. Check your connection." with "Try again". Limit reached: "You can report up to 5 faults a day. Please try again tomorrow." The form keeps everything the resident entered.
  - Offline: offline banner "You're offline. Your report will be saved when you're back online." "Submit report" disabled.
  - Success: goes to S5 with the toast "Fault reported. Your reference number is FMK-2026-00125."
- **Sample content:** Photo of water flowing across the road, Clean water → Burst clean water pipe, ticked dangerous (auto urgent), Ward A: Orlando West, "23 Vilakazi Street, Orlando West", landmark "Near the Mandela House", description "Amanzi aphuma epayipini kusukela izolo ekuseni" (isiZulu: water coming out of the pipe since yesterday morning).

```

---

## Prompt 7: S7 My Reports

```text
You are a senior UI/UX designer. Design screen "S7 My Reports" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S7 My Reports**
- **Purpose:** See the faults I reported and their status.
- **Who can open it:** Logged in: Resident
- **Comes from / goes to:** My reports tab → S7 → S5, S6
- **Layout:**
  1. Header: title "My reports"
  2. Tabs: "Open" (not Closed) and "Closed"
  3. List of Fault cards (8.3), newest first. A Fixed fault card also shows "Please confirm the fix" in bold.
  4. Tab bar, My reports active
- **Form fields:** None
- **Buttons and links:** Fault card → S5. "Report a fault" (empty state) → S6.
- **States:**
  - Normal: fault cards.
  - Empty: "You haven't reported any faults yet." with primary button "Report a fault". Closed tab empty: "No closed faults yet."
  - Loading: 3 grey placeholder cards.
  - Error: "Something went wrong. Try again." with "Try again".
  - Offline: last loaded reports stay visible with the offline banner.
  - Success: not needed.
- **Sample content:** Thandeka's faults FMK-2026-00123 (Scheduled) and FMK-2026-00115 (Assigned, Overdue). Nomsa Sithole has no faults and shows the Empty state.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 8: S8 Ward Queue

```text
You are a senior UI/UX designer. Design screen "S8 Ward Queue" for my web app at 390 x 844 (phone), then a second version at 1440 wide (desktop) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S8 Ward Queue**
- **Purpose:** See and manage every fault in my ward.
- **Who can open it:** Logged in: Ward admin
- **Comes from / goes to:** S3, Queue tab or S9 → S8 → S5
- **Layout:**
  1. Header: title "Ward A: Orlando West"
  2. Tabs: "New (2)", "In progress (2)", "Fixed (0)" (BR7)
  3. Filter chips: Category, "Urgent only", "Overdue only"
  4. List of Fault cards (8.3) in BR7 order. On desktop: a table with columns Reference, Fault type, Street address, Upvotes, Status, Due date, Field team.
  5. Tab bar (phones) or side menu (desktop), Queue active
- **Form fields:** None
- **Buttons and links:** Fault card or table row → S5. "Overdue only" chip → shows only overdue faults.
- **States:**
  - Normal: faults in BR7 order.
  - Empty: "New" tab: "No new faults in your ward." Other tabs: "Nothing here right now."
  - Loading: 5 grey placeholder rows.
  - Error: "Something went wrong. Try again." with "Try again".
  - Offline: last loaded list with the offline banner.
  - Success: after assigning, the fault moves to "In progress" with the toast "Fault assigned".
- **Sample content:** Ward A faults from 8.4.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 9: S9 Ward Dashboard

```text
You are a senior UI/UX designer. Design screen "S9 Ward Dashboard" for my web app at 390 x 844 (phone), then a second version at 1440 wide (desktop) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S9 Ward Dashboard**
- **Purpose:** See my ward's figures at a glance.
- **Who can open it:** Logged in: Ward admin
- **Comes from / goes to:** Dashboard tab → S9 → S8
- **Layout:**
  1. Header: title "Ward dashboard", subtitle "Ward A: Orlando West"
  2. Three stat cards (8.3): "Open faults" 4, "Overdue faults" 1 (red text and icon), "Average time to fix" "5.0 days" with "Last 30 days" underneath (BR15)
  3. Bar list "Open faults by category": one row per category with its name, a bar and the count
  4. Secondary button "View overdue faults"
  5. Tab bar or side menu, Dashboard active
- **Form fields:** None
- **Buttons and links:** "View overdue faults" → S8 with "Overdue only" on.
- **States:**
  - Normal: as above.
  - Empty: Open faults 0: "No open faults in your ward. Well done!" Average time to fix with no data: "No data" and "No faults fixed in the last 30 days."
  - Loading: 3 grey stat cards.
  - Error: "Something went wrong. Try again." with "Try again".
  - Offline: last loaded figures with the offline banner and "Last updated 12 Nov 2026, 10:15".
  - Success: not needed.
- **Sample content:** Ward A: Open 4, Overdue 1, Average 5.0 days. By category: Clean water 1, Electricity 3, Roads 0, Sewer 0, Waste 0, Public spaces 0.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 10: S10 My Jobs

```text
You are a senior UI/UX designer. Design screen "S10 My Jobs" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S10 My Jobs**
- **Purpose:** See and update the faults assigned to my field team.
- **Who can open it:** Logged in: Field team
- **Comes from / goes to:** S3 or My jobs tab → S10 → S5, M3
- **Layout:**
  1. Header: title "My jobs", subtitle with the field team name, e.g. "Sample Plumbing Services (Pty) Ltd"
  2. Tabs: "To do" (Assigned, Scheduled, In progress) and "Done" (Fixed, Closed)
  3. List of Job cards (8.3), ordered by due date, soonest first. Overdue jobs at the top.
  4. Tab bar, My jobs active
- **Job card shows, in order:** first photo, fault type in bold, status chip, "Urgent" / "Overdue" / "Delayed" labels, street address and landmark, "Due 18 Nov 2026", button "Update".
- **Form fields:** None
- **Buttons and links:** Job card → S5. "Update" → M3.
- **States:**
  - Normal: job cards.
  - Empty: "No jobs assigned to your team right now."
  - Loading: 3 grey placeholder cards.
  - Error: "Something went wrong. Try again." with "Try again".
  - Offline: last loaded jobs with the offline banner. "Update" disabled.
  - Success: after M3, toast "Status updated".
- **Sample content:** Kagiso's team: FMK-2026-00123 (Scheduled, due 18 Nov 2026).

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 11: S11 Profile and Settings

```text
You are a senior UI/UX designer. Design screen "S11 Profile and Settings" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S11 Profile and Settings**
- **Purpose:** Edit my profile, change language, log out, delete my account, read the Privacy Notice.
- **Who can open it:** Logged in: any role
- **Comes from / goes to:** Profile tab → S11 → S1, M5, M7
- **Layout:**
  1. Header: title "Profile"
  2. Initials circle (64 px) and full name, email (not editable), role label ("Resident", "Ward admin" or "Field team")
  3. Form fields (table below) and primary button "Save changes"
  4. Link "Privacy Notice"
  5. Secondary button "Log out"
  6. Danger button "Delete account" (Residents only. Staff accounts are removed by the admin.)
  7. Tab bar, Profile active
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| Full name | Text | Yes | "Your full name" | 2 to 60 characters | "Enter your full name." |
| Phone number | Phone | No | "+27 82 123 4567" | +27 followed by 9 digits | "Enter a South African number, like +27 82 123 4567." |
| Home ward | Dropdown | Yes (Residents only) | Current ward | One of the wards | "Choose your ward." |
| Language | Dropdown | Yes | Current language | English, Afrikaans, isiZulu, Sepedi (BR18) | None |

- **Buttons and links:** "Save changes" → saves, toast "Profile saved". "Privacy Notice" → M7. "Log out" → S1. "Delete account" → M5.
- **States:**
  - Normal: filled form.
  - Empty: not needed.
  - Loading: grey lines while the profile loads. "Save changes" shows a spinner while saving.
  - Error: "Something went wrong. Try again." Form keeps the user's changes.
  - Offline: offline banner, "Save changes" disabled.
  - Success: toast "Profile saved".
- **Sample content:** Thandeka Mokoena, thandeka.m@example.com, Resident, +27 82 555 0134, Ward A: Orlando West, isiZulu.

```

---

## Prompt 12: S12 Set New Password

```text
You are a senior UI/UX designer. Design screen "S12 Set New Password" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**S12 Set New Password**
- **Purpose:** Choose a new password after opening a reset link.
- **Who can open it:** Anyone with a valid reset link
- **Comes from / goes to:** Reset email → S12 → S3
- **Layout:**
  1. Header: title "Choose a new password"
  2. New password field with show/hide toggle
  3. Confirm password field with show/hide toggle
  4. Primary button "Save password"
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| New password | Password | Yes | "At least 8 characters" | 8+ characters, 1 letter and 1 number | "Use at least 8 characters with a letter and a number." |
| Confirm password | Password | Yes | "Type it again" | Must match | "The passwords don't match." |

- **Buttons and links:** "Save password" → S3 with "Password changed. Please log in." "Send new link" (expired state) → M1.
- **States:**
  - Normal: empty form.
  - Empty: not needed.
  - Loading: "Save password" shows a spinner.
  - Error: expired or used link: "This link has expired. Request a new one." with "Send new link". Other: "Something went wrong. Try again."
  - Offline: offline banner, button disabled.
  - Success: S3 with the banner above.
- **Sample content:** Not needed, because the screen holds only password fields.

```

---

## Prompt 13: M1 Forgot Password

```text
You are a senior UI/UX designer. Design screen "M1 Forgot Password" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M1 Forgot Password**
- **Purpose:** Ask for a password reset link.
- **Who can open it:** Logged out
- **Comes from / goes to:** S3 → M1 → S3 (close), email → S12
- **Layout:** Title "Reset your password". Text "Enter your email and we'll send you a link to choose a new password." Email field. Primary button "Send link". Text button "Cancel".
- **Form fields:** Email (email, required, placeholder "you@example.com", error "Enter a valid email address.")
- **Buttons and links:** "Send link" → shows "If this email has an account, we've sent a reset link." and the button changes to "Done" (closes M1). "Cancel" → closes M1.
- **States:** Loading: spinner on "Send link". Error: "Something went wrong. Try again." Offline: "Send link" disabled with the offline banner. Success: message above. Normal and Empty: empty form.
- **Sample content:** thandeka.m@example.com

```

---

## Prompt 14: M2 Assign Fault

```text
You are a senior UI/UX designer. Design screen "M2 Assign Fault" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M2 Assign Fault**
- **Purpose:** Assign a fault to a field team with a due date.
- **Who can open it:** Logged in: Ward admin of the fault's ward
- **Comes from / goes to:** S5 → M2 → S5
- **Layout:** Title "Assign FMK-2026-00123". Fault summary line "Burst clean water pipe, 23 Vilakazi Street". Form fields. Primary button "Assign" ("Reassign" when already assigned). Text button "Cancel".
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| Field team | Dropdown | Yes | "Choose a field team" | Only teams whose category matches (BR8). Each option shows the name and "Municipal team" or "Contractor". | "Choose a field team." |
| Expected fix date | Date | Yes | "DD MMM YYYY" | Today to 90 days from today (BR8) | "Choose a date within the next 90 days." |
| Estimated time to fix (days) | Number | Yes | "e.g. 2" | Whole number, 1 to 90 | "Enter a number of days from 1 to 90." |
| Municipal reference number | Text | No | "e.g. JW-778812" | Up to 30 characters | "Keep this under 30 characters." |
| Note to field team | Text area | No | "Anything the team should know" | Up to 200 characters | "Keep the note under 200 characters." |

- **Buttons and links:** "Assign" → saves, status Assigned → S5 with the toast "Fault assigned". "Cancel" → closes M2.
- **States:** Normal: empty form. Empty: no matching field teams: "No field teams for Clean water yet. Ask the admin to add one." Loading: spinner on "Assign". Error: "Something went wrong. Try again." / "You can only manage faults in your ward." Offline: "Assign" disabled with the offline banner. Success: toast above.
- **Sample content:** Field team "Sample Plumbing Services (Pty) Ltd (Contractor)", 18 Nov 2026, 2 days, JW-778812.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 15: M3 Update Status

```text
You are a senior UI/UX designer. Design screen "M3 Update Status" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M3 Update Status**
- **Purpose:** Change a job's status, mark it delayed, or mark it Fixed with after photos.
- **Who can open it:** Logged in: Field team assigned to the fault
- **Comes from / goes to:** S10 or S5 → M3 → S10 or S5
- **Layout:** Title "Update FMK-2026-00123". Current status chip. Radio list of the next allowed statuses (10.3): "Scheduled", "In progress", "Fixed". Checkbox "Mark as delayed". Fields appear based on the choice (below). Primary button "Save". Text button "Cancel".
- **Form fields:**

| Field label | Type | Required? | Placeholder text | Rules | Error message (exact text) |
| --- | --- | --- | --- | --- | --- |
| New status | Radio list | Yes, unless only "Mark as delayed" is ticked | None | Allowed changes only (10.3) | "Choose a new status." |
| Note | Text area | No | "e.g. Parts ordered and crew booked" | Up to 200 characters | "Keep the note under 200 characters." |
| Delay reason | Text area | Yes if delayed | "Why is it delayed?" | 10 to 200 characters (BR12) | "Explain the delay in at least 10 characters." |
| New expected fix date | Date | Yes if delayed | "DD MMM YYYY" | After the current date, within 90 days (BR12) | "Choose a later date within the next 90 days." |
| After photos | Image upload | Yes if Fixed (F6) | "Add photo" | 1 to 3 photos, BR2 file rules (BR13) | "Add at least 1 after photo." |

- **Buttons and links:** "Save" → saves → closes M3, toast "Status updated". "Cancel" → closes M3.
- **States:** Normal: as above. Empty: not needed. Loading: "Save" shows a spinner, or "Uploading photos…" for after photos. Error: "Something went wrong. Try again." / "You can only update faults assigned to your team." Offline: "Save" disabled with the offline banner. Success: toast above.
- **Sample content:** Status "In progress", note "Crew on site, road dug up".

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 16: M4 Reopen Fault

```text
You are a senior UI/UX designer. Design screen "M4 Reopen Fault" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M4 Reopen Fault**
- **Purpose:** Tell the ward admin the fault is not fixed.
- **Who can open it:** Logged in: Resident who reported the fault, status Fixed
- **Comes from / goes to:** S5 → M4 → S5
- **Layout:** Title "Still a problem?" Text "Tell us what's still wrong. The ward admin will look at it again." Reason field. Primary button "Reopen". Text button "Cancel".
- **Form fields:** Reason (text area, required, placeholder "e.g. Water is still leaking at the same spot", 10 to 200 characters, error "Tell us what's still wrong in at least 10 characters.")
- **Buttons and links:** "Reopen" → status Reopened → S5 with toast "Fault reopened". "Cancel" → closes M4.
- **States:** Loading: spinner on "Reopen". Error: "Something went wrong. Try again." Offline: "Reopen" disabled. Success: toast above. Normal and Empty: empty reason field.
- **Sample content:** "Water is still leaking at the same spot."

```

---

## Prompt 17: M5 Delete Account

```text
You are a senior UI/UX designer. Design screen "M5 Delete Account" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M5 Delete Account**
- **Purpose:** Confirm account deletion.
- **Who can open it:** Logged in: Resident
- **Comes from / goes to:** S11 → M5 → S1 or S11
- **Layout:** Title "Delete your account?" Text "This deletes your login, profile and upvotes straight away. Faults you reported stay public without your name, because neighbours rely on them. This can't be undone." Danger button "Delete my account". Secondary button "Cancel".
- **Form fields:** None
- **Buttons and links:** "Delete my account" → deletes → S1 with toast "Your account has been deleted." "Cancel" → closes M5.
- **States:** Loading: spinner on the danger button. Error: "Something went wrong. Try again." Offline: danger button disabled. Success: as above. Normal: as above. Empty: not needed.
- **Sample content:** Not needed.

```

---

## Prompt 18: M6 Similar Reports

```text
You are a senior UI/UX designer. Design screen "M6 Similar Reports" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M6 Similar Reports**
- **Purpose:** Let the resident upvote an existing fault instead of reporting it again.
- **Who can open it:** Logged in: Resident, from S6 when BR4 finds matches
- **Comes from / goes to:** S6 → M6 → S5 or S6
- **Layout:** Title "Is this the same fault?" Text "These faults were reported near you. If one of them is yours, upvote it instead of reporting it again." Up to 5 Fault cards (8.3) with the distance ("80 m away"), each with the button "Upvote instead". Secondary button "No, report a new fault".
- **Form fields:** None
- **Buttons and links:** "Upvote instead" → upvote saved → S5 for that fault with toast "Thanks, your upvote was added." "No, report a new fault" → back to S6 with "Submit report" showing.
- **States:** Normal: fault cards. Empty: not shown when there are no matches (BR4). Loading: 2 grey placeholder cards. Error: "We couldn't check for similar faults." with "Continue reporting" (back to S6). Offline: not reached, because "Next" is disabled offline. Success: as above.
- **Sample content:** FMK-2026-00123, Burst clean water pipe, 80 m away, Scheduled, 14 upvotes.

=== SAMPLE DATA (PRD Section 8.4, use where relevant) ===
**8.4 Sample data set** (used on every screen and in the seed data, 10.4). All names, wards, field teams and companies are fictional test data.

**Wards (City of Johannesburg, test data):** Ward A: Orlando West · Ward B: Diepkloof · Ward C: Braamfontein

**Users**

| Name | Role | Email | Ward / field team | Language |
| --- | --- | --- | --- | --- |
| Thandeka Mokoena | Resident | thandeka.m@example.com | Ward A | isiZulu |
| Lerato Dlamini | Resident | lerato.d@example.com | Ward B | English |
| Johan Botha | Resident | johan.b@example.com | Ward C | Afrikaans |
| Nomsa Sithole | Resident (no reports, for empty states) | nomsa.s@example.com | Ward A | Sepedi |
| Zanele Khumalo | Ward admin | zanele.k@example.com | Ward A | English |
| Kagiso Molefe | Field team | kagiso.m@example.com | Sample Plumbing Services (Pty) Ltd | English |

**Field teams:** Municipal water team (Municipal, Clean water) · Sample Plumbing Services (Pty) Ltd (Contractor, Clean water) · Municipal sewer team (Municipal, Sewer) · Municipal roads team (Municipal, Roads) · Sample Electrical Works (Pty) Ltd (Contractor, Electricity)

**Faults** (ward admin view; "today" in the demo is 12 Nov 2026)

| Reference | Fault type | Location | Status | Field team | Due date | Upvotes | Reporter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FMK-2026-00123 | Burst clean water pipe (urgent) | 23 Vilakazi Street, Orlando West, Ward A | Scheduled | Sample Plumbing Services (Pty) Ltd | 18 Nov 2026 (2 days) | 14 | Thandeka |
| FMK-2026-00121 | Faulty streetlight | Corner of Moema and Vilakazi Street, Ward A | Received | Not assigned | None | 6 | Lerato |
| FMK-2026-00118 | Pothole | 14 Jorissen Street, Braamfontein, Ward C | In progress | Municipal roads team | 20 Nov 2026 (5 days) | 3 | Johan |
| FMK-2026-00115 | Faulty high-mast light | Near Orlando West Clinic, Ward A | Assigned, Overdue | Sample Electrical Works (Pty) Ltd | 10 Nov 2026 (3 days) | 22 | Thandeka |
| FMK-2026-00109 | Blocked manhole | 8 Moroka Street, Diepkloof, Ward B | Fixed on 7 Nov 2026, awaiting confirmation | Municipal sewer team | 9 Nov 2026 (2 days) | 9 | Lerato |

For the Ward A dashboard (T-US11-1), the seed data also includes one Closed Ward A fault fixed 5 days after it was reported, and Ward A's open faults are FMK-2026-00123, FMK-2026-00121, FMK-2026-00115 and one Electricity fault "Streetlight flickering" (Viewed).
```

---

## Prompt 19: M7 Privacy Notice

```text
You are a senior UI/UX designer. Design screen "M7 Privacy Notice" for my web app at 390 x 844 (phone) px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec below. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.
- This is a pop-up (modal; a bottom sheet on phones, centred 480 px wide on desktop) shown over its parent screen, which is dimmed behind it.

APP CONTEXT (FixMyKasi)
FixMyKasi is a mobile-first web app for South African residents to report community faults (potholes, burst pipes, broken streetlights), see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed.
Primary user: residents aged 18 to 65 in City of Johannesburg townships and suburbs, on Android phones with prepaid data, medium tech comfort.
Other users: ward admins (municipal staff, often on a laptop) and field teams (municipal teams or contractors, on a phone).

DESIGN (use exactly, add nothing)
- Colours: primary Coat of Arms Green #005D28 (buttons, links, active tabs); Heritage Brown #531A17 (header bar, headings); Gold #D8A851 (3 px line under the header, icons, highlights; only dark text #1C1C1C on it, never gold text on white); Orange #EF4718 with dark text for the "Urgent" label; page and card background #FFFFFF; section background #F8F6F1; text #1C1C1C; secondary text #5C5650; error #B42318; success #1E7B34; warning #87451A.
- Status chip dot colours (always with the status name written): Received #5C5650, Viewed #825B32, Assigned #531A17, Scheduled #87451A, In progress #B46E12, Fixed #005D28, Closed #1C1C1C, Reopened #B42318.
- Font Inter. Title 24 px bold, heading 18 px semibold, body 16 px, labels and buttons 16 px semibold, small 13 px.
- 8 px spacing unit, 16 px side margin on phones. Corner radius: cards 12 px, inputs and buttons 8 px, chips fully rounded. Button height 48 px. Soft card shadow. Lucide outline icons, 24 px.
- Header: Heritage Brown bar, white title and white back arrow, 3 px gold line underneath.
- Logo: wordmark "FixMyKasi" in Inter bold, Coat of Arms Green, with a small gold map-pin icon containing a wrench. Never use the national Coat of Arms, the flag or any government logo.
- Tone: friendly, clear, respectful. Everything tappable is at least 44 x 44 px. Colour is never the only signal.
Tab bar (bottom on phones, left side menu on desktop over 1024 px), by role:
- Visitor: Faults, Log in
- Resident: Faults, Report, My reports, Profile
- Ward admin: Queue, Dashboard, Faults, Profile
- Field team: My jobs, Faults, Profile

=== SCREEN SPEC (PRD Section 8.2) ===
**M7 Privacy Notice**
- **Purpose:** Explain what we collect, why, who sees it and how to delete it.
- **Who can open it:** Everyone
- **Comes from / goes to:** S2 or S11 → M7 → back
- **Layout:** Title "Privacy Notice". Sections: "What we collect" (12.4 table in plain words), "Why we need it", "Who can see it", "Where it is stored" (including that the database is outside South Africa, 12.4), "How long we keep it", "How to delete your account" (S11 → Delete account). Text "Questions? Email privacy@fixmykasi.example". Primary button "Close".
- **Form fields:** None
- **Buttons and links:** "Close" → closes M7.
- **States:** Normal only. The text is part of the app, so Empty, Loading, Error and Offline are not needed. Success: not needed.
- **Sample content:** "We collect your name, email and, if you choose, your phone number, so you can log in and report faults."

```

---

## Final consistency check

```text
Compare all screens and list every inconsistency in colour, spacing, text size, labels, header or tab bar. Also list every "TODO" box you added.
```
