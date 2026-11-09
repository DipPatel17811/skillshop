/* ==========================================================================
   Skillshop — shared app utilities
   Local-first profile, progress, badges, certificates and UI helpers.
   ========================================================================== */

(function () {
  // v2-fix: removed duplicate wrapper functions causing stack overflow
  "use strict";

  const KEYS = {
    profile: "skillshop.profile.v1",
    progress: "skillshop.progress.v1",
    certificates: "skillshop.certificates.v1"
  };

  const AVATAR_COLORS = ["#D8F26B", "#FFD66B", "#B9E6FF", "#FFD3DF", "#FFB59F", "#C9C4FF", "#BDEBD8"];
  const ICON_PATH = "assets/icons.svg";

  let catalogPromise = null;
  const coursePromiseCache = new Map();

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function icon(name, className) {
    return `<svg class="icon${className ? " " + className : ""}" aria-hidden="true"><use href="${ICON_PATH}#i-${name}"></use></svg>`;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("Skillshop: could not read local data", error);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Skillshop: could not save local data", error);
      return false;
    }
  }

  function makeId(prefix) {
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function formatDate(value, options) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en", options || { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatLongDate(value) {
    return formatDate(value, { day: "numeric", month: "long", year: "numeric" });
  }

  function getInitials(name) {
    const clean = String(name || "").trim();
    if (!clean) return "?";
    return clean
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function firstName(name) {
    return String(name || "").trim().split(/\s+/)[0] || "";
  }

  function getProfile() {
    const profile = readJSON(KEYS.profile, null);
    if (!profile || !profile.name) return null;
    return profile;
  }

  function saveProfile(data) {
    const existing = getProfile();
    const profile = {
      id: existing ? existing.id : makeId("learner"),
      name: String(data.name || "").trim().slice(0, 70),
      email: String(data.email || "").trim().slice(0, 160),
      avatarColor: data.avatarColor || (existing && existing.avatarColor) || AVATAR_COLORS[0],
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!profile.name) return { ok: false, message: "Please add your name first." };
    const saved = writeJSON(KEYS.profile, profile);
    if (!saved) return { ok: false, message: "Your browser blocked local storage. Try allowing site data." };
    updateHeaderProfile();
    return { ok: true, profile };
  }

  function clearProfile() {
    localStorage.removeItem(KEYS.profile);
    updateHeaderProfile();
  }

  function getProgressAll() {
    const data = readJSON(KEYS.progress, {});
    return data && typeof data === "object" ? data : {};
  }

  function saveProgressAll(data) {
    return writeJSON(KEYS.progress, data);
  }

  function getCourseProgress(courseId) {
    const all = getProgressAll();
    const raw = all[courseId] || {};
    return {
      completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
      finalScore: typeof raw.finalScore === "number" ? raw.finalScore : null,
      finalPassed: Boolean(raw.finalPassed),
      startedAt: raw.startedAt || null,
      completedAt: raw.completedAt || null,
      lastLesson: raw.lastLesson || null,
      updatedAt: raw.updatedAt || null
    };
  }

  function setCourseProgress(courseId, value) {
    const all = getProgressAll();
    all[courseId] = {
      ...getCourseProgress(courseId),
      ...value,
      updatedAt: new Date().toISOString()
    };
    saveProgressAll(all);
    return all[courseId];
  }

  function markLesson(courseId, lessonId, completed, totalLessons) {
    const current = getCourseProgress(courseId);
    const set = new Set(current.completedLessons);
    if (completed) set.add(lessonId);
    else set.delete(lessonId);
    const completedLessons = Array.from(set);
    const finished = completedLessons.length >= Number(totalLessons || 0) && current.finalPassed;
    const next = setCourseProgress(courseId, {
      completedLessons,
      startedAt: current.startedAt || new Date().toISOString(),
      lastLesson: lessonId,
      completedAt: finished ? current.completedAt || new Date().toISOString() : null
    });
    return next;
  }

  function recordLastLesson(courseId, lessonId) {
    const current = getCourseProgress(courseId);
    return setCourseProgress(courseId, {
      lastLesson: lessonId,
      startedAt: current.startedAt || new Date().toISOString()
    });
  }

  function recordAssessment(courseId, score, passed, totalLessons) {
    const current = getCourseProgress(courseId);
    const completed = current.completedLessons.length >= Number(totalLessons || 0) && passed;
    return setCourseProgress(courseId, {
      finalScore: Math.round(score),
      finalPassed: Boolean(passed),
      completedAt: completed ? current.completedAt || new Date().toISOString() : current.completedAt
    });
  }

  function getCourseStats(course, progress) {
    const moduleLessons = course && Array.isArray(course.modules)
      ? course.modules.reduce((sum, module) => sum + (Array.isArray(module.lessons) ? module.lessons.length : 0), 0)
      : 0;
    const total = Number(course.lessonCount || course.lessonTotal || moduleLessons || 0);
    const completed = progress ? progress.completedLessons.length : 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const complete = total > 0 && completed >= total && Boolean(progress && progress.finalPassed);
    return { total, completed, percent, complete };
  }

  function isCourseComplete(course, progress) {
    return getCourseStats(course, progress || getCourseProgress(course.id)).complete;
  }

  function getCompletedCourseIds(catalog) {
    const progress = getProgressAll();
    return (catalog.courses || [])
      .filter((course) => isCourseComplete(course, progress[course.id] || { completedLessons: [], finalPassed: false }))
      .map((course) => course.id);
  }

  function getCertificates() {
    const data = readJSON(KEYS.certificates, []);
    return Array.isArray(data) ? data : [];
  }

  function saveCertificates(certificates) {
    return writeJSON(KEYS.certificates, certificates);
  }

  function getCertificate(courseId) {
    return getCertificates().find((cert) => cert.courseId === courseId) || null;
  }

  function makeCredentialId() {
    const year = new Date().getFullYear();
    const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `SK-${year}-${chunk}`;
  }

  function issueCertificate(course, progress) {
    if (!course || !progress) return null;
    const existing = getCertificate(course.id);
    if (existing) return existing;
    const profile = getProfile();
    if (!profile || !isCourseComplete(course, progress)) return null;
    const certificate = {
      id: makeCredentialId(),
      courseId: course.id,
      courseTitle: course.title,
      learnerName: profile.name,
      badgeName: course.badge ? course.badge.name : "Skillshop badge",
      skills: Array.isArray(course.skills) ? course.skills.slice(0, 4) : [],
      duration: course.duration,
      topic: course.topic,
      score: progress.finalScore,
      issuedAt: new Date().toISOString(),
      profileId: profile.id
    };
    const certificates = getCertificates();
    certificates.unshift(certificate);
    saveCertificates(certificates);
    return certificate;
  }

  function updateHeaderProfile() {
    const profile = getProfile();
    qsa("[data-profile-pill]").forEach((pill) => {
      const nameEl = qs("[data-profile-name]", pill);
      const avatarEl = qs("[data-profile-avatar]", pill);
      if (profile) {
        pill.setAttribute("href", "dashboard.html");
        pill.setAttribute("title", "Open your learning dashboard");
        if (nameEl) nameEl.textContent = firstName(profile.name);
        if (avatarEl) {
          avatarEl.textContent = getInitials(profile.name);
          avatarEl.style.background = profile.avatarColor || AVATAR_COLORS[0];
        }
      } else {
        pill.setAttribute("href", "account.html");
        pill.setAttribute("title", "Create your learner profile");
        if (nameEl) nameEl.textContent = "Sign in";
        if (avatarEl) {
          avatarEl.innerHTML = icon("user");
          avatarEl.style.background = "var(--paper-deep)";
          avatarEl.style.color = "var(--ink)";
        }
      }
    });
  }

  function setupMobileNav() {
    qsa("[data-nav-toggle]").forEach((toggle) => {
      const header = toggle.closest(".site-header");
      toggle.addEventListener("click", () => {
        if (!header) return;
        const open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.innerHTML = icon(open ? "close" : "menu");
        document.body.classList.toggle("no-scroll", open);
      });
    });
  }

  function setCurrentYear() {
    qsa("[data-current-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function toast(message, type) {
    let region = qs(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      document.body.appendChild(region);
    }
    const node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = `${icon(type === "warning" ? "shield" : "check-circle")}<span>${escapeHTML(message)}</span>`;
    region.appendChild(node);
    window.setTimeout(() => {
      node.classList.add("is-leaving");
      window.setTimeout(() => node.remove(), 240);
    }, 3600);
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function safeNextUrl(next, fallback) {
    if (!next) return fallback;
    if (/^https?:|^\/\//i.test(next)) return fallback;
    if (!/^[a-z0-9._-]+\.html([?#].*)?$/i.test(next)) return fallback;
    return next;
  }

  async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${path}`);
    }
    return response.json();
  }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetchJSON("courses/catalog.json").catch((error) => {
        catalogPromise = null;
        throw error;
      });
    }
    return catalogPromise;
  }

  function loadCourse(courseOrPath) {
    const path = typeof courseOrPath === "string" ? courseOrPath : courseOrPath.path;
    if (!path) return Promise.reject(new Error("This course has no file path."));
    if (!coursePromiseCache.has(path)) {
      const promise = fetchJSON(path).catch((error) => {
        coursePromiseCache.delete(path);
        throw error;
      });
      coursePromiseCache.set(path, promise);
    }
    return coursePromiseCache.get(path);
  }

  function courseDurationMinutes(duration) {
    if (!duration) return 0;
    const match = String(duration).match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i);
    if (!match) return 0;
    return Number(match[1] || 0) * 60 + Number(match[2] || 0);
  }

  function getMilestoneBadges(catalog, progress) {
    const courses = catalog.courses || [];
    const completedIds = getCompletedCourseIds(catalog);
    const summaries = courses.map((course) => ({
      course,
      progress: progress[course.id] || { completedLessons: [], finalPassed: false }
    }));
    const lessonTotal = summaries.reduce((sum, entry) => sum + (entry.progress.completedLessons || []).length, 0);
    const perfectScore = summaries.some((entry) => entry.progress.finalScore === 100);
    const topics = new Set(
      summaries
        .filter((entry) => isCourseComplete(entry.course, entry.progress))
        .map((entry) => entry.course.topic)
    );
    const certificates = getCertificates();

    return [
      {
        id: "first-step",
        name: "First Step",
        description: "Complete your first lesson",
        icon: "spark",
        color: "#D8F26B",
        earned: lessonTotal >= 1
      },
      {
        id: "triple-threat",
        name: "Triple Threat",
        description: "Complete three courses",
        icon: "flame",
        color: "#FFB59F",
        earned: completedIds.length >= 3
      },
      {
        id: "skill-collector",
        name: "Skill Collector",
        description: "Complete five courses",
        icon: "compass",
        color: "#B9E6FF",
        earned: completedIds.length >= 5
      },
      {
        id: "all-rounder",
        name: "All-Rounder",
        description: "Learn across two topics",
        icon: "layers",
        color: "#C9C4FF",
        earned: topics.size >= 2
      },
      {
        id: "perfect-score",
        name: "Perfect Score",
        description: "Ace a final assessment",
        icon: "target",
        color: "#FFD66B",
        earned: perfectScore
      },
      {
        id: "certified",
        name: "Certified",
        description: "Earn your first certificate",
        icon: "certificate",
        color: "#FFD3DF",
        earned: certificates.length >= 1
      }
    ];
  }

  function getBadgeCollection(catalog, progress) {
    const courseBadges = (catalog.courses || []).map((course) => {
      const p = progress[course.id] || { completedLessons: [], finalPassed: false };
      return {
        id: `badge-${course.id}`,
        name: course.badge ? course.badge.name : `${course.title} badge`,
        description: `Complete ${course.title}`,
        icon: course.badge ? course.badge.icon : "award",
        color: course.color,
        earned: isCourseComplete(course, p),
        courseId: course.id
      };
    });
    return [...courseBadges, ...getMilestoneBadges(catalog, progress)];
  }

  function bindGlobalUI() {
    updateHeaderProfile();
    setupMobileNav();
    setCurrentYear();
  }

  window.Skillshop = {
    KEYS,
    AVATAR_COLORS,
    qs,
    qsa,
    icon,
    escapeHTML,
    formatDate,
    formatLongDate,
    getInitials,
    firstName,
    getProfile,
    saveProfile,
    clearProfile,
    getProgressAll,
    saveProgressAll,
    getCourseProgress,
    setCourseProgress,
    markLesson,
    recordLastLesson,
    recordAssessment,
    getCourseStats,
    isCourseComplete,
    getCompletedCourseIds,
    getCertificates,
    getCertificate,
    issueCertificate,
    updateHeaderProfile,
    toast,
    getQueryParam,
    debounce,
    safeNextUrl,
    fetchJSON,
    loadCatalog,
    loadCourse,
    courseDurationMinutes,
    getBadgeCollection,
    bindGlobalUI
  };

  document.addEventListener("DOMContentLoaded", bindGlobalUI);

  // Global error handler - show errors visibly on the page
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error || event.message);
    const grids = document.querySelectorAll("[data-course-grid], #dashboardApp, #courseRoot, #certificateApp");
    grids.forEach((el) => {
      if (el.innerHTML.includes("skeleton") || el.innerHTML.includes("loading-panel")) {
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
          ${S.icon("shield")}
          <h3>JavaScript Error</h3>
          <p>${S.escapeHTML((event.error && event.error.message) || event.message || "Unknown error")}</p>
          <button class="btn btn--sm" type="button" onclick="location.reload()">Refresh page</button>
        </div>`;
      }
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    const grids = document.querySelectorAll("[data-course-grid], #dashboardApp, #courseRoot, #certificateApp");
    grids.forEach((el) => {
      if (el.innerHTML.includes("skeleton") || el.innerHTML.includes("loading-panel")) {
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
          ${S.icon("shield")}
          <h3>Loading Error</h3>
          <p>${S.escapeHTML((event.reason && event.reason.message) || String(event.reason) || "Unknown error")}</p>
          <button class="btn btn--sm" type="button" onclick="location.reload()">Refresh page</button>
        </div>`;
      }
    });
  });
})();
