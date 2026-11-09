/* ==========================================================================
   Skillshop — auth UI (static / localStorage only)
   Works on GitHub Pages without a backend.
   ========================================================================== */

(function () {
  const S = window.Skillshop;
  if (!S) return;

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
          logout.href = '#';
          logout.className = 'btn btn--sm btn--ghost';
          logout.style.marginLeft = '8px';
          logout.innerHTML = S.icon('logout');
          logout.setAttribute('data-logout', '1');
          logout.title = 'Sign out';
          logout.addEventListener('click', (e) => {
            e.preventDefault();
            S.clearProfile();
            pillUser(null);
            S.toast('Signed out.');
            setTimeout(() => { location.href = 'index.html'; }, 600);
          });
          parent.insertBefore(logout, pill.nextSibling);
        }
      } else {
        pill.setAttribute('href', 'account.html');
        pill.setAttribute('title', 'Create a learner profile');
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

  function updateHeader() {
    const profile = S.getProfile();
    pillUser(profile);
  }

  window.SkillshopAuth = { updateHeader };
  document.addEventListener('DOMContentLoaded', updateHeader);
})();
