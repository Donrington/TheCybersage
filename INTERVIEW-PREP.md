<div align="center">

# TeamBoard — Interview Walkthrough

**Read this like a script.** It's written the way you'd actually say it out loud,
not like documentation. Talk through it top to bottom in ~5-8 minutes, then let
them steer with questions.

</div>

---

## 1. The 30-second pitch (say this first)

> "TeamBoard is a small work-management app — sign up, create projects, break each
> project into tasks, and drag tasks across To Do, In Progress, and Done. It was a
> full-stack assessment: React frontend, NestJS backend, MongoDB database, and the
> brief was explicit that they're grading my *technical decisions and system design
> thinking*, not how many features I crammed in. So I want to walk you through the
> decisions, not just the feature list — and then the real problems I hit getting it
> into production, because that's honestly where I learned the most."

That last sentence is your hook — it signals you're not just going to recite a
feature list, and it sets up section 4 (the good part).

---

## 2. What it actually is

Say it simply first, then add the technical layer:

- **In plain terms:** it's like a mini Trello/Jira. You log in, you see your
  projects, you open one and see a three-column task board, you drag cards between
  columns.
- **Under the hood:** React + Vite on the frontend (`frontend/`), NestJS on the
  backend (`backend/`), MongoDB Atlas as the database, and one shared TypeScript
  package (`shared/src/index.ts`) that both sides import so the data shapes can't
  silently drift apart between frontend and backend.
- **It's live**, not just running on my laptop — deployed frontend and backend on
  Vercel, talking to a real Atlas cluster. (`docs/09-deployment.md` has the full
  config and story if you want to point to it.)

**Folder map, if they ask "how is this organized":**
```
TeamBoard/
├── backend/      NestJS API — one folder per feature
│   └── src/
│       ├── auth/       signup, login, JWT
│       ├── users/      profile + settings
│       ├── projects/   project CRUD
│       ├── tasks/      task CRUD + board state
│       ├── config/     env validation (Joi)
│       └── common/     shared filters/decorators/pipes
├── frontend/     Vite + React SPA — same feature-first layout
│   └── src/features/  auth/ projects/ tasks/ settings/
├── shared/       @teamboard/shared — the types both sides import
├── docs/         00-10, one doc per build milestone
└── README.md     setup + architecture write-up
```

---

## 3. The architecture pitch — the one sentence to nail

This is the sentence they're most likely to ask you to expand on, so know it cold:

> "It's a **modular monolith** — one single deployable app today, but built with the
> internal seams that would let any piece become its own microservice later, without
> rewriting anything."

If they ask "what does that mean concretely," you have three real, specific answers
— not hand-waving:

1. **Projects and tasks reference each other by ID, not nested inside each other.**
   Look at `backend/src/tasks/schemas/task.schema.ts` — a task stores its project's
   ID, not a copy of the project (same idea in
   `backend/src/projects/schemas/project.schema.ts` for the owning user). That
   sounds small, but it's the actual difference between "could become
   microservices" being a true statement versus just a buzzword — you can't split
   an embedded document across two databases later, but you can split two
   referenced collections.
2. **Every module is auth / projects / tasks, each with the same shape:** open
   `backend/src/tasks/` and you'll see `tasks.controller.ts` (only translates HTTP
   into a function call), `tasks.service.ts` (every actual rule lives here),
   `tasks.module.ts` (wires it together), `dto/` (validated input shapes),
   `schemas/` (the Mongoose model). `backend/src/projects/` and
   `backend/src/auth/` repeat the exact same pattern. The controller never
   contains logic — so if "tasks" ever needed to become its own service, the logic
   is already sitting behind one clean interface, not tangled through a
   controller.
3. **One shared types package** — `shared/src/index.ts` — defines every object
   that crosses the network: User, Project, Task, all the request/response
   shapes. Both `backend/` and `frontend/src/services/api.ts` /
   `frontend/src/features/*/[...].api.ts` import from it. If I change a field
   name on the backend and forget the frontend, it's a compile error, not a bug
   someone finds in production.

---

## 4. The decisions worth defending out loud

Frame these as "here's why I made this call, and here's the trade-off I accepted" —
that's what shows judgment instead of just Googling an answer.

| They ask... | You say... | Where it lives |
|---|---|---|
| "Why MongoDB and not Postgres?" | "It was specified in the brief, so I didn't spend energy re-litigating a fixed requirement — I put my design effort into the things that were actually left open, like how the data relates and how the modules are boundaried." | `instructions.md` (the brief itself) |
| "Why build your own auth instead of Auth0/Clerk?" | "Because that's the exact skill this assessment is testing. A hosted provider would have hidden the part they wanted to see — so I built it myself: bcrypt for hashing, JWT for sessions, Passport guards on protected routes." | `backend/src/auth/auth.service.ts`, `backend/src/auth/strategies/jwt.strategy.ts`, `backend/src/auth/guards/jwt-auth.guard.ts` |
| "Why JWT in localStorage instead of a cookie?" | "Frontend and backend are on different origins, so a Bearer token is the simplest thing that's actually correct there. I'll say honestly — it's technically readable by an injected script, so it's not the hardened choice. If frontend and backend ever shared a domain, an httpOnly cookie would be the upgrade." | `frontend/src/features/auth/AuthContext.tsx`, `frontend/src/services/api.ts` (attaches the token to every request) |
| "How do you know one user can't see another user's data?" | "Every single query is scoped by the user ID pulled from the verified JWT — never trusted from anything the client sends in the request body. And when someone requests a project they don't own, they get a 404, not a 403 — so a hostile client can't even confirm the resource exists." | `backend/src/projects/projects.service.ts` / `backend/src/tasks/tasks.service.ts` — same `NotFoundException` pattern in both, and `backend/src/common/decorators/current-user.decorator.ts` is how the controller gets the verified user ID in the first place |
| "What happens when you delete a project?" | "Cascade delete — its tasks go with it. That's enforced in the service layer, not left to the database or the frontend to clean up." | `backend/src/projects/projects.service.ts` (the delete method) |

---

## 5. The challenges — this is the section that actually impresses people

Anyone can say "I built a CRUD app." What's worth walking through slowly is what
broke and how you found it — it shows how you actually debug, which is most of the
job. Tell it as a story, in order, because it *was* a chain of five things.

*Everything in this section is written up in full in `docs/09-deployment.md` —
that's the file to have open (or pull up on screen) while you tell this story.*

### Setup: the calm before the storm
> "Everything built cleanly. Unit tests passed. I ran it locally end-to-end against
> the real database and it worked perfectly. Then I deployed it — and every single
> request to the live API just... hung. No error. No response. Not even a log line.
> That gap between 'builds clean' and 'works in production' turned out to be the
> most instructive part of the whole project."

### Problem 1 — the monorepo install broke silently
- **What happened:** the build failed trying to find `@teamboard/shared` — a
  package that only exists locally in my own repo, not on npm.
- **Why:** my `vercel.json` used an older, legacy config format. That format quietly
  skips Vercel's normal "install the whole workspace" step and just runs `npm
  install` in isolation — so it could never find a package that isn't published.
- **Fix:** switched to the modern, minimal `rewrites`-based config, which lets
  Vercel's proper monorepo-aware install run.
- **File:** `backend/vercel.json` — that's the whole config, only a few lines.

### Problem 2 — a security feature blocking my own app
- **What happened:** after fixing the install, requests still didn't return anything.
- **Why:** Vercel has a "Deployment Protection" setting — basically an SSO wall in
  front of every deployment by default on team accounts. It was silently rejecting
  every request before it even reached my code.
- **Fix:** turned it off in project settings. Small thing, but worth mentioning
  because it's the kind of platform default that has nothing to do with your code
  and everything to do with knowing the platform.
- **File:** nothing in the repo — this one's a Vercel dashboard setting, noted in
  `docs/09-deployment.md` step 6 so it doesn't get forgotten on a redeploy.

### Problem 3 — the database didn't know the server existed
- **What happened:** requests were still hanging.
- **Why:** MongoDB Atlas has an allow-list of IPs that can connect. Vercel's
  serverless functions don't have one fixed IP — they run from a rotating pool — so
  Atlas was silently refusing the connection attempt until it timed out.
- **Fix:** opened Atlas's network access to allow any IP. That's not a security hole
  by itself — the database still requires the real username and password — it just
  controls *which networks* are even allowed to try.
- **File:** Atlas dashboard setting again, not a repo file. The connection string
  it applies to is `MONGODB_URI` — set locally in `backend/.env`, and as a Vercel
  env var in production (shape documented in `backend/.env.example`).

### Problem 4 — the real bug, and it was actually two bugs stacked together
> "This is the one I'm proudest of finding, because there was no error message at
> all to follow — I had to build my way to the answer."

- **The method:** instead of guessing, I deployed a stripped-down, bare-bones
  version of the server that tested one hypothesis at a time — just a database
  connection, then just config loading, then just the framework's own boot sequence
  — and watched which ones responded instantly versus which ones hung. That narrowed
  it down step by step instead of guessing at a stack trace that didn't exist.
- **Bug 4a:** I'd set an environment variable using a shell command that appended an
  invisible trailing newline character to the value. So instead of `production`, the
  app actually saw `production\n`. My validation library rejected that as an invalid
  value — and because that validation happens *during startup*, inside an async step
  the framework has to wait on, the rejection never turned into a clean error. It just
  made the entire app hang while booting, forever. One invisible character.
  **File:** `backend/src/config/env.validation.ts` — the Joi schema that rejected it
  (now widened with `.unknown(true)` too, since hosting platforms inject their own
  vars).
- **Bug 4b:** once that was fixed, a *different*, real error appeared for the first
  time — a mismatch between two major versions of Express (the underlying HTTP
  library) that had gotten out of sync during an earlier framework upgrade. Bumped
  the dependency, pinned it in one place so it can't drift again.
  **File:** `backend/package.json` (the `express` version + the root `package.json`
  `overrides` block that pins it tree-wide) and `backend/api/index.ts` (where the
  Express instance is actually created and handed to Nest's adapter).
- **The lesson I'd actually say out loud:** "When something fails with zero
  information, the move isn't to guess harder — it's to shrink the system until you
  can see which half is broken, then shrink again."

### Problem 5 — the cosmetic one that still had a real consequence
- **What happened:** everything above was fixed, but a tester reported seeing a
  completely different app — not TeamBoard at all.
- **Why:** the plain domain name I expected (`teamboard-web.vercel.app`) was already
  taken by a *completely unrelated project on someone else's Vercel account* — that
  namespace is global, not scoped to your account. Vercel had silently assigned mine
  a suffixed domain instead, and I'd been pointing my CORS configuration at the wrong
  one the whole time.
- **Fix:** checked the project list for the actual assigned domain, updated the
  CORS setting to match, redeployed, verified a real cross-origin request from the
  actual frontend succeeded.
- **File:** the `CORS_ORIGIN` env var on the `teamboard-api` Vercel project (not
  stored in the repo — it's a deploy-time secret); the fix is written up in
  `README.md` and `docs/09-deployment.md`.

### How to close this section
> "None of those five were things I could have caught by writing more unit tests —
> they only show up once real infrastructure is involved. That's exactly why I think
> it was worth deploying for real instead of stopping at 'it works on localhost.'"

---

## 6. Smaller but genuinely useful things to mention if there's time

- **Config fails loudly, on purpose.** If a required environment variable is
  missing, the app refuses to start with a clear message — instead of booting fine
  and failing mysteriously three requests later.
  **File:** `backend/src/config/env.validation.ts`, wired in via
  `backend/src/app.module.ts`.
- **Cascading, security-conscious details in the smaller features:** I added a
  Settings page after the initial build (change name, upload a profile photo, delete
  account). Email is deliberately not editable — and that's enforced on the server,
  not just hidden in the UI, so even a hand-crafted request trying to sneak an email
  change through gets rejected.
  **File:** `frontend/src/features/settings/SettingsPage.tsx` (the UI),
  `backend/src/users/users.controller.ts` + `users.service.ts` (server-side
  rejection), `backend/src/users/dto/update-profile.dto.ts` /
  `dto/delete-account.dto.ts` (the validated shapes — notice `email` isn't a field
  on the update DTO at all).
- **Profile photo uploads go straight from the browser to Cloudinary**, using an
  "unsigned" upload preset — meaning no secret API key ever has to sit in my
  frontend or backend code for that feature.
  **File:** `frontend/src/features/settings/cloudinary.ts`.
- **Testing:** a handful of backend unit tests targeted specifically at the
  highest-risk behaviors — password handling and cross-user ownership checks —
  because those are the kind of bug that becomes a security hole, not just a typo.
  Plus a full Postman collection and a scripted 17-check smoke test that runs against
  the real live deployment: signup, duplicate-email rejection, login, bad-login
  rejection, full CRUD, one user being blocked from another user's data, cascade
  delete.
  **File:** `backend/test/auth.service.spec.ts` and
  `backend/test/tasks.service.spec.ts`; the smoke suite and Postman collection are
  referenced from `docs/08-testing-postman.md`.

---

## 7. If they only remember five sentences you said

1. "MongoDB was a fixed requirement, so I spent my actual design freedom on the data
   model and module boundaries instead."
2. "Projects and tasks reference each other by ID — that's the concrete difference
   between claiming it could become microservices and actually structuring it that
   way."
3. "I built the auth myself instead of using a hosted provider, because that's the
   part actually being evaluated here."
4. "One shared file defines every piece of data crossing the network, so frontend
   and backend literally cannot silently drift apart."
5. "The deployment didn't just work — I hit five stacked, unrelated problems with
   zero error messages, and found each one by shrinking the system down until I could
   see which half was broken."

---

## 8. Questions they might throw at you — quick answers

- **"What would you do differently with more time?"** — Move JWT out of
  localStorage into an httpOnly cookie if frontend/backend ever shared a domain;
  add refresh tokens instead of one long-lived token; consider a message queue if
  task updates needed to fan out to other services.
- **"How would this actually split into microservices?"** — Auth, Projects, and
  Tasks are already separate NestJS modules with their own services and schemas.
  The real work would be replacing direct in-process calls between them with an
  API/queue boundary — the logic itself wouldn't need to change, because it's
  already isolated behind each service's interface.
- **"What was the hardest bug?"** — Problem 4 above (the invisible newline). Point
  out *why* it was hard: it produced no error at all, just an infinite hang, and the
  actual root cause was a single invisible character in an environment variable.
