# Gallery "Add Picture" — Setup Guide (100% free, no card needed)

This gives you a real, secure way to add and delete gallery photos
directly from the live site. Everything used here — Firebase
Authentication, Firebase Firestore, and Cloudinary — has a permanent
free tier that does **not** require a credit card.

**Why not just a password in the code?** Because anyone can read a
website's code (right-click → "View Page Source"), a password hidden
there isn't real security. So the password is checked by Firebase
instead, on Google's servers, where it can't be read by visitors.

**One honest limitation of the free-without-card route:** "Delete"
removes a photo from your website permanently — but the original file
may still sit in your free Cloudinary account afterwards (it doesn't
cost anything extra; you can clear it anytime from Cloudinary's own
dashboard if you ever want to). This is the trade-off for avoiding a
card entirely — worth knowing, not a bug.

---

## Your admin password

```
quKQnCD#IDH&o2P6
```

Keep this somewhere safe (e.g. a note on your phone) and only share it
with people you trust to add/remove photos. You can change it any time
later from the Firebase console (Authentication → Users → ⋮ → Reset
password) without needing me or any code changes.

---

## Part 1 — Firebase (password login + photo list)

### Step 1.1 — Create the project
1. Go to **console.firebase.google.com** and sign in with any Google account
2. **Add project** → name it `lotus-academy` → keep default options → **Create project**

### Step 1.2 — Turn on Firestore (stores the list of photos + year labels)
1. Left sidebar → **Firestore Database** (it may or may not sit under a "Build" heading — doesn't matter, just click it)
2. **Create database** → **Start in production mode** → pick any location → **Enable**

### Step 1.3 — Turn on password login
1. Left sidebar → **Authentication** → **Get started**
2. Click **Email/Password** → toggle **Enable** → **Save**
3. Go to the **Users** tab → **Add user**
4. Email: `admin@lotusacademy.local`
   Password: `quKQnCD#IDH&o2P6` (the one above)
5. **Add user**

*(This "email" isn't a real inbox — it's just an internal username so
the website only ever asks you for one password.)*

### Step 1.4 — Lock down Firestore's rules
Firestore Database → **Rules** tab → delete everything there and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albumYears/{album} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /photos/{photoId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
      allow update: if false;
    }
  }
}
```

Click **Publish**. This means: anyone can *view* the gallery, but only
someone logged in with your password can add or remove a photo.

### Step 1.5 — Get your website's connection details
1. ⚙️ gear icon (top left) → **Project settings**
2. Scroll to **"Your apps"** → click **`</>`** (Web icon)
3. Nickname it anything → **Register app**
4. You'll see a code block — copy these 4 values (ignore the rest):
   `apiKey`, `authDomain`, `projectId`, `appId`

---

## Part 2 — Cloudinary (photo storage — free, no card)

### Step 2.1 — Sign up
1. Go to **cloudinary.com** → **Sign up free**
2. You can sign up with Google/GitHub or email — no payment details asked anywhere

### Step 2.2 — Note your Cloud Name
Right on your Cloudinary dashboard homepage, you'll see **"Cloud name"**
near the top — copy it (short, like `dxyz1234`).

### Step 2.3 — Create an "unsigned" upload preset
This lets your website upload photos without needing a hidden secret key.
1. Click the ⚙️ **Settings** icon → **Upload** tab
2. Scroll to **"Upload presets"** → **Add upload preset**
3. Set **Signing Mode** to **Unsigned**
4. (Recommended) Under **Upload Manipulations**, restrict **Allowed formats**
   to `jpg,png,webp` and set a reasonable **Max file size** (e.g. 10 MB) —
   this keeps random strangers from misusing the upload link
5. **Save** — note the **preset name** shown (e.g. `ml_default` or
   whatever you typed)

---

## Part 3 — Put your values into the website

1. Unzip the website folder → open `assets/js/gallery-admin.js` in Notepad
2. Near the top, replace these placeholders with your real values:

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  appId: "PASTE_YOUR_APP_ID",
};
...
const CLOUDINARY_CLOUD_NAME = "PASTE_YOUR_CLOUDINARY_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "PASTE_YOUR_UPLOAD_PRESET_NAME";
```

3. Save the file, re-zip the `school-site` folder, and re-upload it to
   your hosting the same way you have been doing

---

## How it works day-to-day

- Gallery page → **"Admin Login"** near the top → enter the password
- Every album shows a dashed **"+ Add Picture"** tile at the end —
  click it, pick a photo, done. It appears instantly for every visitor,
  and the album's year label updates itself automatically.
- While logged in, every uploaded photo shows a small **✕** to remove
  it from the website (confirmation prompt first).
- **Logout** when done, or it stays logged in on that browser until you do.

## Notes

- Cloudinary's free plan (25 credits/month — each credit ≈ 1GB) is far
  more than a small school gallery will ever use.
- Firebase Firestore's free tier (50,000 reads/day) is also far beyond
  what this site needs.
- The **original photos already on your site** (Diwali, Independence
  Day, etc.) are separate — regular files in your website folder, not
  in this system — so the delete button won't appear on those. Tell me
  if you want any of those removed instead.
- If you outgrow the free tiers years from now (very unlikely for a
  school gallery), both services let you upgrade — nothing breaks, you'd
  just get a prompt to add billing at that point, same as before.
