# How to turn on comments (Giscus)

Comments on your episode pages use **Giscus**, which stores comments as
GitHub Discussions on your repository. Until you complete these steps, the
comment box is simply hidden — nothing looks broken.

## One-time setup (about 5 minutes)

1. **Push your site to a public GitHub repository.**
   Your `digital lizard` folder is a git repo but has no GitHub remote yet.
   Create a repo at https://github.com/new (e.g. `digital-lizard`), then run,
   from the `digital lizard` folder:

   ```
   git remote add origin https://github.com/YOUR-USERNAME/digital-lizard.git
   git push -u origin main
   ```

2. **Enable Discussions** on that repo:
   Repo → Settings → General → Features → check "Discussions".

3. **Install the giscus app** on that repo:
   https://github.com/apps/giscus → Install → choose your repository.

4. **Create the discussion category** (Repo → Discussions → New category).
   Use the **Announcements** type (recommended: only you and giscus can open
   discussions; readers can still reply). Name it "Announcements" or "Comments".

5. **Get your IDs** from https://giscus.app :
   - type your repo (e.g. `YOUR-USERNAME/digital-lizard`) in the Repository box
   - pick your category in "Discussion Category"
   - the page generates a script tag containing `data-repo-id` and
     `data-category-id` — copy those two values.

6. **Fill in the config** in `assets/app.js`, near the bottom:

   ```
   var GISCUS = {
     repo: "YOUR-USERNAME/digital-lizard",
     repoId: "R_...",          // from giscus.app
     category: "Announcements",
     categoryId: "DIC_..."    // from giscus.app
   };
   ```

   Save, redeploy — comments appear on all 40 episode pages automatically.
   `data-mapping` is "pathname", so each episode gets its own discussion thread.
   The comment box follows the reader's Light/Dark theme automatically.

## Why this setup?

The old version had a copy of the giscus script with placeholder values
(`USERNAME/REPO`) inside all 40 episode pages. Now there is **one config in
one file** — no more editing 40 pages. The security headers (`_headers`)
already allow giscus.app, so no other change is needed.
