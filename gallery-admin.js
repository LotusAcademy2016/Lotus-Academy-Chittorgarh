// ============================================================
// Lotus Academy — Gallery Admin (100% free, no credit card needed)
// Lets a logged-in admin add or delete photos in any album,
// directly from the live website.
//
// How it works:
//  - Firebase Authentication checks the password (secure — not
//    stored anywhere in this file)
//  - Firebase Firestore keeps the list of photos + year labels
//  - Cloudinary stores and serves the actual image files
// All three have permanent free tiers that need no card on file.
//
// SETUP REQUIRED: paste your Firebase + Cloudinary details below.
// Full step-by-step instructions are in ADMIN-SETUP.md.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDlJk6-2I5OB_F8UXth8VM9_ZaHS2Yeeho",
  authDomain: "lotus-academy-2e94a.firebaseapp.com",
  projectId: "lotus-academy-2e94a",
  appId: "1:35242275320:web:438c5ac27d4e57a4e6260d",
};

// This is just a fixed "username" behind the scenes so you only
// ever have to type ONE password on the website. You create this
// exact account (email + your password) in the Firebase console —
// see ADMIN-SETUP.md, Step 3.
const ADMIN_EMAIL = "admin@lotusacademy.local";

// From Cloudinary → Settings → Upload → your unsigned upload preset.
const CLOUDINARY_CLOUD_NAME = "quzdj87d";
const CLOUDINARY_UPLOAD_PRESET = "e2b92jlc";

// ------------------------------------------------------------
// Below this line, nothing needs to be edited.
// ------------------------------------------------------------

let fbReady = false;
let isAdmin = false;
let auth, db;

function isConfigured() {
  return !firebaseConfig.apiKey.startsWith("PASTE_") && !CLOUDINARY_CLOUD_NAME.startsWith("PASTE_");
}

function initFirebase() {
  if (!isConfigured()) {
    console.warn("Gallery admin: not configured yet — see ADMIN-SETUP.md. The 'Add Picture' feature is disabled until then.");
    return false;
  }
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  fbReady = initFirebase();
  injectAdminBar();

  document.querySelectorAll(".album[data-cat]").forEach((album) => {
    if (album.dataset.cat === "upcoming") return;
    setupAlbum(album);
  });

  if (fbReady) {
    auth.onAuthStateChanged((user) => {
      isAdmin = !!user;
      document.body.classList.toggle("is-admin", isAdmin);
      updateAdminBar();
    });
  }
});

// ---------------- admin bar (login/logout) ----------------
function injectAdminBar() {
  const bar = document.createElement("div");
  bar.className = "admin-bar";
  bar.innerHTML = `
    <button class="admin-login-btn" id="adminLoginBtn">Admin Login</button>
    <button class="admin-logout-btn" id="adminLogoutBtn" style="display:none">Logout</button>
  `;
  const filters = document.querySelector(".filters");
  filters.parentNode.insertBefore(bar, filters);

  document.getElementById("adminLoginBtn").addEventListener("click", showLoginModal);
  document.getElementById("adminLogoutBtn").addEventListener("click", () => fbReady && auth.signOut());
}

function updateAdminBar() {
  document.getElementById("adminLoginBtn").style.display = isAdmin ? "none" : "inline-flex";
  document.getElementById("adminLogoutBtn").style.display = isAdmin ? "inline-flex" : "none";
}

function showLoginModal() {
  if (!fbReady) {
    alert("Photo upload isn't set up yet. Finish the ADMIN-SETUP.md steps first.");
    return;
  }
  const modal = document.createElement("div");
  modal.className = "admin-modal";
  modal.innerHTML = `
    <div class="admin-modal-box">
      <h3>Admin Login</h3>
      <p>Enter the gallery password to add or remove photos.</p>
      <input type="password" id="adminPwInput" placeholder="Password" autocomplete="current-password">
      <div class="admin-modal-actions">
        <button id="adminPwCancel" class="btn btn-ghost">Cancel</button>
        <button id="adminPwSubmit" class="btn btn-primary">Login</button>
      </div>
      <p class="admin-modal-error" id="adminPwError" style="display:none">Wrong password. Try again.</p>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById("adminPwCancel").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  const submit = async () => {
    const pw = document.getElementById("adminPwInput").value;
    if (!pw) return;
    try {
      await auth.signInWithEmailAndPassword(ADMIN_EMAIL, pw);
      close();
    } catch (e) {
  console.log(e);
  alert(e.code + " : " + e.message);
}
  };
  document.getElementById("adminPwSubmit").onclick = submit;
  document.getElementById("adminPwInput").addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}

// ---------------- per-album setup ----------------
function setupAlbum(albumEl) {
  const albumId = albumEl.dataset.cat;
  const grid = albumEl.querySelector(".photo-grid");
  if (!grid) return;

  const addTile = document.createElement("button");
  addTile.className = "add-tile";
  addTile.innerHTML = "<span>+</span><small>Add Picture</small>";
  addTile.addEventListener("click", () => {
    if (!isAdmin) { showLoginModal(); return; }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => { if (input.files[0]) uploadPhoto(albumId, grid, addTile, input.files[0]); };
    input.click();
  });
  grid.appendChild(addTile);

  if (fbReady) {
    loadUploadedPhotos(albumId, grid, addTile);
    loadYearPill(albumId, albumEl);
  }
}

// ---------------- loading existing uploaded photos (from Firestore) ----------------
async function loadUploadedPhotos(albumId, grid, addTile) {
  try {
    const snap = await db.collection("photos")
      .where("album", "==", albumId)
      .orderBy("createdAt", "desc")
      .get();
    snap.forEach((doc) => {
      grid.insertBefore(buildPhotoButton(doc.id, doc.data()), addTile);
    });
  } catch (e) {
    console.warn("Gallery admin: could not load uploaded photos for", albumId, e);
  }
}

function buildPhotoButton(docId, data) {
  const btn = document.createElement("button");
  btn.dataset.full = data.url;
  btn.dataset.alt = "School event photo";
  btn.innerHTML = `<img src="${data.url}" alt="" loading="lazy">`;

  btn.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) return;
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.querySelector("img").src = data.url;
    lb.classList.add("open");
  });

  const del = document.createElement("span");
  del.className = "delete-btn";
  del.textContent = "\u2715";
  del.title = "Delete this photo";
  del.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!confirm("Remove this photo from the website? This cannot be undone.")) return;
    try {
      await db.collection("photos").doc(docId).delete();
      btn.remove();
    } catch (err) {
      alert("Could not delete photo: " + err.message);
    }
  });
  btn.appendChild(del);
  return btn;
}

// ---------------- uploading a new photo ----------------
async function uploadPhoto(albumId, grid, addTile, file) {
  const year = new Date().getFullYear();
  addTile.querySelector("small").textContent = "Uploading\u2026";
  addTile.disabled = true;

  try {
    const url = await uploadToCloudinary(file);
    const docRef = await db.collection("photos").add({
      album: albumId,
      url,
      year,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    grid.insertBefore(buildPhotoButton(docRef.id, { url }), addTile);
    await addYearToAlbum(albumId, year);
  } catch (err) {
    alert("Upload failed: " + err.message);
  } finally {
    addTile.querySelector("small").textContent = "Add Picture";
    addTile.disabled = false;
  }
}

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed (check your cloud name / preset in gallery-admin.js)");
  const data = await res.json();
  return data.secure_url;
}

// ---------------- automatic year pill ----------------
async function loadYearPill(albumId, albumEl) {
  try {
    const doc = await db.collection("albumYears").doc(albumId).get();
    if (doc.exists) {
      const years = doc.data().years || [];
      if (years.length) setYearPillText(albumEl, years);
    }
  } catch (e) {
    // Firestore not reachable — the year pill just stays as printed in the HTML.
  }
}

async function addYearToAlbum(albumId, year) {
  const ref = db.collection("albumYears").doc(albumId);
  try {
    const doc = await ref.get();
    let years = doc.exists ? doc.data().years || [] : [];
    if (!years.includes(year)) {
      years.push(year);
      years.sort();
      await ref.set({ years });
      const albumEl = document.getElementById(albumId);
      if (albumEl) setYearPillText(albumEl, years);
    }
  } catch (e) {
    console.warn("Could not update year pill", e);
  }
}

function setYearPillText(albumEl, years) {
  const pill = albumEl.querySelector(".year-pill");
  if (pill) pill.textContent = years.join(" / ");
}
