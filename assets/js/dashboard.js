/* ==========================================================================
   Skillshop — learner dashboard
   ========================================================================== */

(function () {
  "use strict";

  const S = window.Skillshop;
  const app = document.getElementById("dashboardApp");

  function renderNoProfile(catalog) {
    document.title = "My learning · Skillshop";
    app.innerHTML = `
      <section class="dashboard-hero">
        <div class="container">
          <div class="dashboard-hero-grid">
            <div class="dashboard-welcome">
              <div class="dashboard-avatar" style="--avatar-color:var(--sky)">${S.icon("user")}</div>
              <div>
                <p class="eyebrow">Your learning</p>
                <h1>One place for every skill.</h1>
                <p>Create a local learner profile to track lessons, badges and certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="container" style="padding-top:34px;padding-bottom:80px">
        <div class="dashboard-empty">
          <div>
            <h3>Start with a profile</h3>
            <p>No password needed for this preview. Your name, progress and certificates are stored only in this browser. You can explore ${catalog.courses.length} courses right now.</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn" href="account.html?next=dashboard.html">${S.icon("user")} Create profile</a>
            <a class="btn btn--ghost" href="courses.html">Browse courses</a>
          </div>
        </div>
        <div class="section-head" style="margin-top:64px">
          <div>
            <p class="eyebrow">A small preview</p>
            <h2 class="section-title">Your future <em>dashboard.</em></h2>
            <p class="section-sub">Track lesson progress, collect virtual badges, and open a fixed-template certificate whenever you finish a course.</p>
          </div>
        </div>
        <div class="dashboard-stats">
          <div class="stat-card"><div class="stat-label">${S.icon("book-open")} Lessons</div><strong>0<small>completed</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("award")} Badges</div><strong>0<small>earned</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("certificate")} Certificates</div><strong>0<small>issued</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("compass")} Skills</div><strong>${catalog.courses.length}<small>to explore</small></strong></div>
        </div>
      </div>`;
  }

  function renderContinue(catalog, progress) {
    const started = catalog.courses
      .filter((course) => {
        const p = progress[course.id];
        return p && p.completedLessons && p.completedLessons.length > 0 && !S.isCourseComplete(course, p);
      })
      .slice(0, 4);

    if (!started.length) {
      const hasCompleted = catalog.courses.some((course) => S.isCourseComplete(course, progress[course.id]));
      return `<div class="dashboard-empty">
        <div>
          <h3>${hasCompleted ? "Ready for your next skill?" : "Your first course is waiting"}</h3>
          <p>${hasCompleted ? "You have finished at least one course. Pick a new skill, or revisit a completed course whenever you like." : "Pick a skill, finish a lesson, and this space will remember exactly where you left off."}</p>
        </div>
        <a class="btn" href="courses.html">${hasCompleted ? "Find your next course" : "Explore courses"} ${S.icon("arrow-right")}</a>
      </div>`;
    }

    return `<div class="continue-grid">${started
      .map((course) => {
        const p = progress[course.id];
        const stats = S.getCourseStats(course, p);
        return `<a class="continue-card" href="course.html?course=${encodeURIComponent(course.id)}" style="--course-color:${S.escapeHTML(course.color)}">
          <span class="continue-icon">${S.icon(course.icon || "book")}</span>
          <div class="continue-body">
            <h3>${S.escapeHTML(course.title)}</h3>
            <p>${stats.completed} of ${stats.total} lessons · ${S.escapeHTML(course.duration)}</p>
            <div class="course-progress">
              <div class="course-progress-label"><span>In progress</span><span>${stats.percent}%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div>
            </div>
          </div>
          <span class="course-arrow">${S.icon("arrow-right")}</span>
        </a>`;
      })
      .join("")}</div>`;
  }

  function renderBadges(badges) {
    return `<div class="badge-gallery">${badges
      .map(
        (badge) => `<div class="badge-card ${badge.earned ? "" : "is-locked"}">
          <span class="badge-ring" style="--badge-color:${S.escapeHTML(badge.color || "#FFD66B")}">${S.icon(badge.earned ? badge.icon : "lock")}</span>
          <div>
            <h3>${S.escapeHTML(badge.name)}</h3>
            <p>${S.escapeHTML(badge.description)}</p>
            <span class="badge-status">${badge.earned ? `${S.icon("check-circle")} Earned` : `${S.icon("lock")} Locked`}</span>
          </div>
        </div>`
      )
      .join("")}</div>`;
  }

  function renderCertificates(certificates) {
    if (!certificates.length) {
      return `<div class="dashboard-empty">
        <div>
          <h3>No certificates yet</h3>
          <p>Finish every lesson and pass the final assessment to unlock a printable certificate.</p>
        </div>
        <a class="btn btn--ghost" href="courses.html">Find a course ${S.icon("arrow-right")}</a>
      </div>`;
    }
    return `<div class="certificate-list">${certificates
      .map(
        (cert) => `<div class="certificate-row">
          <span class="certificate-row-icon">${S.icon("certificate")}</span>
          <div>
            <h3>${S.escapeHTML(cert.courseTitle)}</h3>
            <p>${S.escapeHTML(cert.id)} · Issued ${S.formatDate(cert.issuedAt)}</p>
          </div>
          <a class="btn btn--sm btn--ghost" href="certificate.html?course=${encodeURIComponent(cert.courseId)}">${S.icon("eye")} View</a>
        </div>`
      )
      .join("")}</div>`;
  }

  async function init() {
    try {
      if (!app) return;
      let catalog;
      try {
        catalog = await S.loadCatalog();
      } catch (error) {
        app.innerHTML = `<div class="container section"><div class="empty-state">${S.icon("shield")}<h3>Dashboard could not load</h3><p>${S.escapeHTML(error.message || "Check your connection")}</p><button class="btn btn--sm" type="button" onclick="location.reload()">Refresh page</button></div></div>`;
        return;
      }
    const profile = S.getProfile();
    if (!profile) {
      renderNoProfile(catalog);
      return;
    }

    const progress = S.getProgressAll();
    const completed = catalog.courses.filter((course) => S.isCourseComplete(course, progress[course.id]));
    completed.forEach((course) => {
      if (!S.getCertificate(course.id)) S.issueCertificate(course, progress[course.id]);
    });
    const certificates = S.getCertificates();
    const badges = S.getBadgeCollection(catalog, progress);
    const earnedBadges = badges.filter((badge) => badge.earned);
    const lessonTotal = catalog.courses.reduce((sum, course) => {
      const p = progress[course.id];
      return sum + (p && Array.isArray(p.completedLessons) ? p.completedLessons.length : 0);
    }, 0);

    document.title = `My learning · ${profile.name} · Skillshop`;
    app.innerHTML = `
      <section class="dashboard-hero">
        <div class="container">
          <div class="dashboard-hero-grid">
            <div class="dashboard-welcome">
              <div class="dashboard-avatar" style="--avatar-color:${S.escapeHTML(profile.avatarColor || "#D8F26B")}">${S.escapeHTML(S.getInitials(profile.name))}</div>
              <div>
                <p class="eyebrow">My learning</p>
                <h1>Welcome back, ${S.escapeHTML(S.firstName(profile.name))}.</h1>
                <p>Member since ${S.formatDate(profile.createdAt, { month: "long", year: "numeric" })} · ${earnedBadges.length} ${earnedBadges.length === 1 ? "badge" : "badges"} earned</p>
              </div>
            </div>
            <div class="local-note">${S.icon("shield")} <span>Preview profile: your learning is stored only in this browser. Cloud sync and secure sign-in are the next phase.</span></div>
          </div>
        </div>
      </section>
      <div class="container">
        <div class="dashboard-stats" style="margin-top:-2px">
          <div class="stat-card"><div class="stat-label">${S.icon("book-open")} Lessons</div><strong>${lessonTotal}<small>completed</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("award")} Badges</div><strong>${earnedBadges.length}<small>of ${badges.length}</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("certificate")} Certificates</div><strong>${certificates.length}<small>issued</small></strong></div>
          <div class="stat-card"><div class="stat-label">${S.icon("compass")} Courses</div><strong>${completed.length}<small>completed</small></strong></div>
        </div>
        <section class="dashboard-section">
          <div class="dashboard-section-head">
            <div><h2>Continue learning</h2><p>Pick up exactly where you stopped.</p></div>
            <a class="text-link" href="courses.html">All courses ${S.icon("arrow-right")}</a>
          </div>
          ${renderContinue(catalog, progress)}
        </section>
        <section class="dashboard-section">
          <div class="dashboard-section-head">
            <div><h2>Your badge shelf</h2><p>Course badges and learning milestones you unlock along the way.</p></div>
          </div>
          ${renderBadges(badges)}
        </section>
        <section class="dashboard-section">
          <div class="dashboard-section-head">
            <div><h2>Certificates</h2><p>Fixed-template certificates, ready to print or save as PDF.</p></div>
          </div>
          ${renderCertificates(certificates)}
        </section>
      </div>`;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
