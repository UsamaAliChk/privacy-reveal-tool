# Confidentiality Control

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

Build an interactive 6-field financial disclosure form demo that allows users to mark individual fields as confidential (so they are omitted from external export/filing).

Key features to include:
1. Six realistic form fields (e.g. Entity Name, Total Revenue, Operating Expenses, Executive Compensation, R&D Investment, Net Income).
2. Clean, intuitive confidentiality toggles for each field:
   - Clear visual status indicating whether each field is "Public" or "Confidential" (with shield/lock icons, subtle highlight/tint, and helper tooltips/badges).
   - Instant inline feedback when toggled.
3. Interactive switcher or showcase letting the user compare the 3 design treatments:
   - Header inline toggle switch
   - In-field trailing lock icon
   - Structured table / bulk-selection review view
4. Live Preview panel showing real-time impact:
   - Full Internal View (all 6 fields visible)
   - Public Export View (confidential fields redacted or omitted with clear counts)
   - Summary bar (e.g. "4 fields public, 2 marked confidential").
5. Modern, accessible UI with clean typography, responsive layout, and toast notifications.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://privacy-reveal-tool.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a083178d-380a-491c-bc39-89b3511efaa6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
