/* Skillshop auth UI — updates header based on login state */
(function () {
  const S = window.Skillshop;
  if (!S) return;

  const apiBase = '';

  async function fetchJSON(path, opts) {
    try {
      const res = await fetch(path, {
        credentials: 'include',
        headers: opts && opts.headers ? opts.headers : {},
        ...opts
      });
      if (res.status === 401) return { ok: false, status: 401 };
      return { ok: true, status: res.status, data: await res.json().catch(() => ({})) };
    } catch (e) {
      return { ok: false, offline: true };
    }
  }

  async function updateHeader() {
    const r = await fetchJSON('/api/me');
    const pills = document.querySelectorAll('[data-profile-pill]');
    if (!pills.length) return;

    if (r.ok && r.data && r.data.id) {
      const user = r.data;
      pills.forEach((pill) => {
        pill.setAttribute('href', 'dashboard.html');
        pill.setAttribute('title', 'Open your learning dashboard');
        const nameEl = pill.querySelector('[data-profile-name]');
        const avatarEl = pill.querySelector('[data-profile-avatar]');
        if (nameEl) nameEl.textContent = S.firstName(user.name || 'Learner');
        if (avatarEl) {
          avatarEl.textContent = S.getInitials(user.name || 'Learner');
          avatarEl.style.background = user.avatar_color || '#D8F26B';
          avatarEl.style.color = '#171614';
        }
        // add logout
        if (!pill.querySelector('[data-logout]')) {
          const logout = document.createElement('a');
          logout.href = '/auth/logout';
          logout.className = 'btn btn--sm btn--ghost';
          logout.style.marginLeft = '8px';
          logout.innerHTML = S.icon('power') || '<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#i-logout"></use></svg>';
          logout.setAttribute('data-logout', '1');
          logout.title = 'Sign out';
          pill.parentNode.insertBefore(logout, pill.nextSibling);
        }
      });
    } else {
      pills.forEach((pill) => {
        pill.setAttribute('href', 'login.html');
        pill.setAttribute('title', 'Sign in to save your progress');
        const nameEl = pill.querySelector('[data-profile-name]');
        const avatarEl = pill.querySelector('[data-profile-avatar]');
        if (nameEl) nameEl.textContent = 'Sign in';
        if (avatarEl) {
          avatarEl.innerHTML = S.icon('user');
          avatarEl.style.background = 'var(--paper-deep)';
          avatarEl.style.color = 'var(--ink)';
        }
        const old = pill.parentNode.querySelector('[data-logout]');
        if (old) old.remove();
      });
    }
  }

  // expose for other modules
  window.SkillshopAuth = { updateHeader, fetchJSON };

  document.addEventListener('DOMContentLoaded', updateHeader);
})();
