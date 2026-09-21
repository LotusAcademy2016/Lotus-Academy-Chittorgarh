# Lotus Academy — School Calendar

## Files
```
calendar.html   ← the public calendar (this is what you link from your nav)
admin.html      ← private admin panel (add/edit/delete dates) — do NOT link this from your public nav
images/         ← photos referenced by the calendar
README.md
```

## Upload to GitHub Pages
Upload all of the above to your repo, alongside your existing `index.html`, `about.html`, etc. Nothing else needed — no build step.

---

## Part 1 — One-time Firebase setup (for the admin panel)

The admin panel needs somewhere to store the events you add so that **everyone** who visits the public calendar sees them — a static GitHub Pages site can't do that on its own, so we use Firebase (Google's free backend). This is a one-time setup; after this, adding events is just filling a form.

1. **Create a Firebase project**
   Go to [console.firebase.google.com](https://console.firebase.google.com) → "Add project" → give it any name (e.g. `lotus-academy-calendar`) → finish the wizard (you can skip Google Analytics).

2. **Register a Web App**
   In the project overview, click the `</>` (Web) icon → give it a nickname → "Register app". Firebase will show you a `firebaseConfig` object that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "lotus-academy-calendar.firebaseapp.com",
     projectId: "lotus-academy-calendar",
     storageBucket: "lotus-academy-calendar.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   Copy this whole object.

3. **Paste the config into BOTH files**
   - In `calendar.html`, search for `const firebaseConfig = {` and replace the placeholder object with the one you copied.
   - In `admin.html`, do the same — search for `const firebaseConfig = {` and paste the identical object.

4. **Turn on Authentication**
   In the Firebase console: **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**.
   Then go to the **Users** tab → **Add user** → enter your own email and a password. This is your admin login — there is no public sign-up page, so only people you personally give this email/password to can log in.

5. **Turn on Firestore Database**
   **Build → Firestore Database → Create database → Start in production mode** (pick any region close to you).

6. **Set security rules**
   In Firestore → **Rules** tab, replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /events/{eventId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /vacations/{vacId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   This means: **anyone visiting the calendar can read** the events (so the public calendar works), but **only a logged-in user can add/edit/delete** them — that's you. Click **Publish**.

7. **Reload both pages**
   Open `admin.html`, log in with the email/password from step 4, and you're set. Open `calendar.html` — it will silently pick up anything you add.

That's it — steps 1–6 are one-time. After this, you never touch Firebase again; you just use the admin panel.

---

## Part 2 — Using the admin panel

Open `admin.html` (e.g. `https://yoursite.github.io/Lotus-Academy/admin.html`) and log in.

- **Add / Update a Date** — pick a date, a category (Holiday / Exam / Activity / School Event / Reminder / Emergency Holiday), a name, and an optional description. Saving a date that already has an entry (even a built-in default one) replaces it — this is how you correct a wrong default date too.
- **Add a Vacation Block** — for multi-day breaks; every day in the range is marked red on the calendar.
- Both sections below the forms list everything you've added, with a **Delete** button.
- On the public calendar, **clicking any date** shows its name, category, and description (if you added one) right below the calendar grid.

Since `admin.html` isn't linked from your site's navigation, casual visitors won't stumble onto it — but it's still protected by a real login either way, so it's safe even if someone finds the URL.

---

## Part 3 — Editing everything else

- **Header/footer placeholders** — search `calendar.html` for `[School Address Placeholder...]`, phone, email, website text and replace directly.
- **Built-in dates** — the `holidays`, `specialEvents`, `examDays`, etc. arrays near the top of the `<script>` block in `calendar.html` are the defaults every visitor sees before you add anything in the admin panel. Several festival dates are marked `approx — UPDATE` because they follow the lunar calendar and shift yearly — verify against the current year's official list, or simply override them from the admin panel instead of editing code.
- **`vacations` / `diwaliVacation`** — Winter/Summer vacation dates and the configurable Diwali vacation length, same as before.
- **`MONTHS`** — theme, quote, notice text, principal's message, co-curricular card content, and gallery image paths per month.
- **Current month** — the calendar automatically scrolls to whichever month matches today's date when it loads; no setup needed.

## Images required
Drop these into `/images` (same filenames as before): `logo.png`, and `july1.jpg`…`july3.jpg` through `june1.jpg`…`june3.jpg` for each month.
