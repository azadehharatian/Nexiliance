/* ============================================================
   auth.js — Client-side auth via localStorage
   Nexiliance (Vercel free-tier, no backend needed for MVP)
   ============================================================ */

const AUTH_CURRENT_KEY = 'pcra_current_user';
const AUTH_USERS_KEY   = 'pcra_users';

/** Return parsed users map (email → user object) */
function _getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '{}');
}

/** Persist users map */
function _saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

/* ── Signup ─────────────────────────────────── */
function signupUser({ name, company, product, category, email, password }) {
  const users = _getUsers();
  if (users[email]) return { success: false, error: 'An account with this email already exists.' };

  const user = {
    name, company, product, category, email,
    password, // NOTE: plain text – acceptable for static demo, not for production
    createdAt: new Date().toISOString(),
  };
  users[email] = user;
  _saveUsers(users);
  _setSession({ name, company, product, category, email });
  return { success: true };
}

/* ── Login ───────────────────────────────────── */
function loginUser(email, password) {
  const users = _getUsers();
  const user  = users[email];
  if (!user)              return { success: false, error: 'No account found with this email.' };
  if (user.password !== password) return { success: false, error: 'Incorrect password.' };
  _setSession({ name: user.name, company: user.company, product: user.product, category: user.category, email: user.email });
  return { success: true };
}

/* ── Session ─────────────────────────────────── */
function _setSession(userData) {
  localStorage.setItem(AUTH_CURRENT_KEY, JSON.stringify(userData));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(AUTH_CURRENT_KEY));
}

function logout() {
  localStorage.removeItem(AUTH_CURRENT_KEY);
  window.location.href = 'login.html';
}

/** Redirect to login if not authenticated. Returns user or null. */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    if (window.location.hash) {
      sessionStorage.setItem('pcra_redirect_hash', window.location.hash);
    }
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

/** If already logged in, redirect to dashboard */
function redirectIfLoggedIn() {
  if (getCurrentUser()) window.location.href = 'dashboard.html';
}

/* ── Assessment persistence ──────────────────── */
function getAssessmentKey(email) { return `pcra_assessment_${email}`; }

function loadAssessment(email) {
  return JSON.parse(localStorage.getItem(getAssessmentKey(email)) || '{}');
}

function saveAssessment(email, data) {
  localStorage.setItem(getAssessmentKey(email), JSON.stringify(data));
}

/* ── Vulnerabilities persistence ─────────────── */
function getVulnKey(email) { return `pcra_vulns_${email}`; }

function loadVulns(email) {
  const stored = localStorage.getItem(getVulnKey(email));
  if (stored) return JSON.parse(stored);
  // Default sample data
  return [
    { id: 'v1', cve: 'CVE-2024-3094', component: 'xz-utils 5.6.0', severity: 'critical', status: 'resolved', reported: '2024-03-29', due: '2024-04-05' },
    { id: 'v2', cve: 'CVE-2024-21626', component: 'runc < 1.1.12',  severity: 'high',     status: 'resolved', reported: '2024-01-31', due: '2024-02-14' },
    { id: 'v3', cve: 'CVE-2024-6387',  component: 'OpenSSH < 9.8',  severity: 'critical', status: 'in-progress', reported: '2024-07-01', due: '2024-07-15' },
  ];
}

function saveVulns(email, vulns) {
  localStorage.setItem(getVulnKey(email), JSON.stringify(vulns));
}
