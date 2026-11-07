/* ==========================================================================
   Skillshop — course catalog rendering, search and topic filters
   ========================================================================== */

(function () {
  "use strict";

  const S = window.Skillshop;
  let catalog = null;
  let activeTopic = "all";
  let query = "";
  let renderTargets = [];

  function levelDot(level) {
    return level && /intermediate|advanced/i.test(level) ? "dot dot--mid" : "dot";
  }

  function courseCard(course, index) {
    const progress = S.getCourseProgress(course.id);
    const stats = S.getCourseStats(course, progress);
    const started = progress.completedLessons.length > 0 || progress.finalPassed;
    const href = `course.html?course=${encodeURIComponent(course.id)}`;
    const progressMarkup = started
      ? `<div class="course-progress">
          <div class="course-progress-label">
            <span>${stats.complete ? "Course complete" : `${stats.completed} of ${stats.total} lessons`}</span>
            <span>${stats.complete ? "100%" : stats.percent + "%"}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div>
        </div>`
      : "";

    return `<article class="course-card" style="--course-color:${S.escapeHTML(course.color || "#B9E6FF")};--course-accent:${S.escapeHTML(course.accent || "#F6F2EA")}">
      <div class="course-art">
        <span class="course-badge-flag">${S.icon("award")}${S.escapeHTML(course.badge ? course.badge.name : "Course badge")}</span>
        <div class="course-icon-tile">${S.icon(course.icon || "book")}</div>
        <span class="course-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="course-body">
        <div class="course-meta">
          <span class="topic">${S.escapeHTML(course.topic)}</span>
          <span aria-hidden="true">·</span>
          <span>${S.icon("book-open")}${course.lessonCount} lessons</span>
          <span>${S.icon("clock")}${S.escapeHTML(course.duration)}</span>
        </div>
        <h3 class="course-title"><a href="${href}">${S.escapeHTML(course.title)}</a></h3>
        <p class="course-desc">${S.escapeHTML(course.description)}</p>
        ${progressMarkup}
        <div class="course-footer">
          <span class="course-level"><span class="${levelDot(course.level)}"></span>${S.escapeHTML(course.level)}</span>
          <span class="course-arrow" aria-hidden="true">${S.icon("arrow-right")}</span>
        </div>
      </div>
    </article>`;
  }

  function courseMatches(course) {
    const topicMatch = activeTopic === "all" || course.topicSlug === activeTopic;
    if (!topicMatch) return false;
    if (!query) return true;
    const haystack = [course.title, course.topic, course.level, course.description, ...(course.skills || [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function renderFilters(target) {
    if (!target || target.dataset.filtersReady === "true") return;
    const topics = [];
    catalog.courses.forEach((course) => {
      let found = topics.find((item) => item.slug === course.topicSlug);
      if (!found) {
        found = { slug: course.topicSlug, name: course.topic, count: 0 };
        topics.push(found);
      }
      found.count += 1;
    });
    const buttons = [
      `<button class="filter-chip is-active" type="button" data-topic="all">All skills <span class="count">${catalog.courses.length}</span></button>`,
      ...topics.map(
        (topic) =>
          `<button class="filter-chip" type="button" data-topic="${S.escapeHTML(topic.slug)}">${S.escapeHTML(topic.name)} <span class="count">${topic.count}</span></button>`
      )
    ];
    target.innerHTML = buttons.join("");
    target.dataset.filtersReady = "true";
    target.addEventListener("click", (event) => {
      const button = event.target.closest("[data-topic]");
      if (!button) return;
      activeTopic = button.dataset.topic;
      S.qsa("[data-topic]", target).forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      syncUrl();
      renderAll();
    });
  }

  function syncUrl() {
    if (!document.body.hasAttribute("data-catalog-page")) return;
    const params = new URLSearchParams();
    if (activeTopic !== "all") params.set("topic", activeTopic);
    if (query) params.set("q", query);
    const next = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", next);
  }

  function renderAll() {
    if (!catalog) return;
    const results = catalog.courses.filter(courseMatches);
    renderTargets.forEach((target) => {
      const limit = Number(target.dataset.limit || 0);
      const list = limit > 0 ? results.slice(0, limit) : results;
      target.innerHTML = list.length
        ? list.map((course, index) => courseCard(course, catalog.courses.indexOf(course))).join("")
        : `<div class="empty-state" style="grid-column:1/-1">
            ${S.icon("search")}
            <h3>No courses match that search</h3>
            <p>Try a different keyword or choose another topic. New skills are added regularly.</p>
            <button class="btn btn--sm" type="button" data-clear-filters>Show all courses</button>
          </div>`;
      const empty = target.querySelector("[data-clear-filters]");
      if (empty) {
        empty.addEventListener("click", () => {
          activeTopic = "all";
          query = "";
          const search = S.qs("[data-course-search]");
          if (search) search.value = "";
          S.qsa("[data-topic]").forEach((item) => item.classList.toggle("is-active", item.dataset.topic === "all"));
          syncUrl();
          renderAll();
        });
      }
    });
    S.qsa("[data-course-count]").forEach((el) => {
      el.textContent = `${results.length} ${results.length === 1 ? "course" : "courses"}`;
    });
    S.updateHeaderProfile();
  }

  function setupSearch() {
    S.qsa("[data-course-search]").forEach((input) => {
      if (input.dataset.bound === "true") return;
      input.dataset.bound = "true";
      input.value = query;
      const onInput = S.debounce(() => {
        query = input.value.trim().toLowerCase();
        S.qsa("[data-course-search]").forEach((other) => {
          if (other !== input) other.value = input.value;
        });
        syncUrl();
        renderAll();
      }, 120);
      input.addEventListener("input", onInput);
      input.closest("form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        query = input.value.trim().toLowerCase();
        syncUrl();
        renderAll();
      });
    });
  }

  async function init() {
    const grids = S.qsa("[data-course-grid]");
    if (!grids.length) return;
    renderTargets = grids;
    const params = new URLSearchParams(window.location.search);
    const initialTopic = params.get("topic");
    query = (params.get("q") || "").trim().toLowerCase();
    activeTopic = initialTopic || "all";

    try {
      catalog = await S.loadCatalog();
    } catch (error) {
      grids.forEach((grid) => {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
          ${S.icon("shield")}
          <h3>Course catalog could not load</h3>
          <p>If you opened this page directly from a file, start a small local web server first. See the README for the one-line command.</p>
        </div>`;
      });
      return;
    }

    if (params.get("topic")) {
      const exists = catalog.courses.some((course) => course.topicSlug === initialTopic);
      if (!exists) activeTopic = "all";
    }

    S.qsa("[data-filter-bar]").forEach(renderFilters);
    S.qsa("[data-topic]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.topic === activeTopic);
    });
    setupSearch();
    renderAll();

    document.documentElement.classList.add("catalog-ready");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
