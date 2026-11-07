/* ==========================================================================
   Skillshop — auth UI
   Works with the Node backend (server.js/server-local.js) and falls back to
   localStorage preview mode when no backend is available.
   ========================================================================== */

(function () {
  const S = window.Skillshop;
  if (!S) return;

  const API = window.location.origin;

  async function fetchJSON(path, opts = {}) {
    try {
      const res = await fetch(path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts
      });
      if (res.status === 401) return { ok: false, status: 401 };
      if (!res.ok) return { ok: false, status: res.status };
      const data = await res.json().catch(() => null);
      return { ok: true, status: res.status, data };
    } catch (e) {
      return { ok: false, offline: true };
    }
  }

  function pillUser(user) {
    const pills = document.querySelectorAll('[data-profile-pill]');
    if (!pills.length) return;
    const logoutSelector = '[data-logout]';

    pills.forEach((pill) => {
      const nameEl = pill.querySelector('[data-profile-name]');
      const avatarEl = pill.querySelector('[data-profile-avatar]');
      const parent = pill.parentNode;

      if (user) {
        pill.setAttribute('href', 'dashboard.html');
        pill.setAttribute('title', 'Open your learning dashboard');
        if (nameEl) nameEl.textContent = S.firstName(user.name || 'Learner');
        if (avatarEl) {
          avatarEl.textContent = S.getInitials(user.name || 'Learner');
          avatarEl.style.background = user.avatar_color || '#D8F26B';
          avatarEl.style.color = '#171614';
        }
        if (!parent.querySelector(logoutSelector)) {
          const logout = document.createElement('a');
          logout.href = '/auth/logout';
          logout.className = 'btn btn--sm btn--ghost';
          logout.style.marginLeft = '8px';
          logout.innerHTML = S.icon('logout');
          logout.setAttribute('data-logout', '1');
          logout.title = 'Sign out';
          parent.insertBefore(logout, pill.nextSibling);
        }
      } else {
        pill.setAttribute('href', 'login.html');
        pill.setAttribute('title', 'Sign in to save your progress');
        if (nameEl) nameEl.textContent = 'Sign in';
        if (avatarEl) {
          avatarEl.innerHTML = S.icon('user');
          avatarEl.style.background = 'var(--paper-deep)';
          avatarEl.style.color = 'var(--ink)';
        }
        const old = parent.querySelector(logoutSelector);
        if (old) old.remove();
      }
    });
  }

  async function updateHeader() {
    const r = await fetchJSON('/api/me');

    if (r.ok && r.data && r.data.id) {
      pillUser(r.data);
      return;
    }

    // Fallback: localStorage profile from local preview mode
    const localProfile = S.getProfile();
    if (localProfile) {
      pillUser({
        id: localProfile.id,
        name: localProfile.name,
        email: localProfile.email,
        avatar_color: localProfile.avatarColor,
        provider: 'local'
      });
    } else {
      pillUser(null);
    }
  }

  window.SkillshopAuth = { updateHeader, fetchJSON };
  document.addEventListener('DOMContentLoaded', updateHeader);
})();
