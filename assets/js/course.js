/* ==========================================================================
   Skillshop — course reader, lesson progress and final assessment
   ========================================================================== */

(function () {
  "use strict";

  const S = window.Skillshop;
  let summary = null;
  let course = null;
  let progress = null;
  let state = {
    view: "lesson",
    lessonId: null,
    attempt: null
  };

  const root = () => document.getElementById("courseRoot");

  function inline(value) {
    return S.escapeHTML(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function allLessons() {
    return (course.modules || []).flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title
      }))
    );
  }

  function totalLessons() {
    return allLessons().length;
  }

  function findLesson(id) {
    return allLessons().find((lesson) => lesson.id === id) || null;
  }

  function lessonPosition(id) {
    const list = allLessons();
    const index = list.findIndex((lesson) => lesson.id === id);
    return { index, previous: index > 0 ? list[index - 1] : null, next: index < list.length - 1 ? list[index + 1] : null };
  }

  function allLessonsComplete() {
    return progress.completedLessons.length >= totalLessons();
  }

  function updateUrl() {
    const hash = state.view === "assessment" ? "assessment" : state.lessonId;
    if (hash) window.history.replaceState(null, "", `#${hash}`);
  }

  function pageError(title, message) {
    root().innerHTML = `<div class="container section">
      <div class="empty-state">
        ${S.icon("shield")}
        <h3>${S.escapeHTML(title)}</h3>
        <p>${S.escapeHTML(message)}</p>
        <a class="btn" href="courses.html">${S.icon("arrow-left")} Browse courses</a>
      </div>
    </div>`;
  }

  function renderShell() {
    const total = totalLessons();
    const badge = course.badge || (summary && summary.badge) || { name: "Course badge", icon: "award" };
    const outcomes = (course.outcomes || []).slice(0, 4);
    const tools = (course.tools || []).slice(0, 3);
    document.title = `${course.title} · Skillshop`;
    document.body.style.setProperty("--course-accent", course.accent || summary.accent || "#FFE7DE");

    root().innerHTML = `
      <section class="course-hero">
        <div class="container">
          <nav class="course-breadcrumb" aria-label="Breadcrumb">
            <a href="courses.html">All courses</a>
            ${S.icon("chevron-down")}
            <a href="courses.html?topic=${encodeURIComponent(course.topicSlug)}">${S.escapeHTML(course.topic)}</a>
            ${S.icon("chevron-down")}
            <span>${S.escapeHTML(course.title)}</span>
          </nav>
          <div class="course-hero-grid">
            <div>
              <div class="course-kicker">
                <span class="tag tag--dark">${S.escapeHTML(course.level)}</span>
                <span class="tag">${S.icon("clock")} ${S.escapeHTML(course.duration)}</span>
                <span class="tag">${S.icon("book-open")} ${total} lessons</span>
              </div>
              <h1>${S.escapeHTML(course.title)}</h1>
              <p class="course-hero-sub">${S.escapeHTML(course.description)}</p>
              <div class="course-hero-meta">
                <span>${S.icon("award")} ${S.escapeHTML(badge.name)} badge</span>
                <span>${S.icon("certificate")} Certificate on completion</span>
                <span>${S.icon("check-circle")} Learn at your own pace</span>
              </div>
            </div>
            <aside class="course-hero-card" aria-label="Course overview">
              <h2>You'll be able to</h2>
              <ul>
                ${outcomes.map((item) => `<li>${S.icon("check")}<span>${S.escapeHTML(item)}</span></li>`).join("")}
              </ul>
              ${
                tools.length
                  ? `<p class="course-kit"><strong>You'll need:</strong> ${tools.map((tool) => S.escapeHTML(tool)).join(" · ")}</p>`
                  : ""
              }
              <div class="course-hero-badge">
                <span class="badge-ring" style="--badge-color:${S.escapeHTML(course.color || "#D8F26B")}">${S.icon(badge.icon || "award")}</span>
                <div>
                  <strong>${S.escapeHTML(badge.name)}</strong>
                  <span>Virtual badge + printable certificate</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <div class="container course-shell">
        <aside class="course-sidebar" id="courseSidebar" aria-label="Course contents"></aside>
        <main class="course-main" id="lessonStage" tabindex="-1"></main>
      </div>`;
  }

  function renderSidebar() {
    const sidebar = document.getElementById("courseSidebar");
    if (!sidebar) return;
    const stats = S.getCourseStats({ lessonCount: totalLessons() }, progress);
    const complete = allLessonsComplete() && progress.finalPassed;
    const modules = course.modules || [];

    sidebar.innerHTML = `
      <div class="sidebar-card">
        <div class="sidebar-progress">
          <div class="progress-ring" style="--progress:${stats.percent}" aria-label="${stats.percent}% of lessons complete">
            <span>${stats.percent}%</span>
          </div>
          <div>
            <strong>${complete ? "Course complete" : stats.completed ? "Keep going" : "Ready when you are"}</strong>
            <span style="display:block">${stats.completed} of ${totalLessons()} lessons</span>
          </div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div>
      </div>
      <div class="sidebar-card">
        <ul class="module-list">
          ${modules
            .map(
              (module, moduleIndex) => `<li class="module-group">
                <p class="module-heading"><span class="module-num">${String(moduleIndex + 1).padStart(2, "0")}</span> ${S.escapeHTML(module.title)}</p>
                ${(module.lessons || [])
                  .map((lesson) => {
                    const done = progress.completedLessons.includes(lesson.id);
                    const active = state.view === "lesson" && state.lessonId === lesson.id;
                    return `<button class="lesson-link${done ? " is-complete" : ""}${active ? " is-active" : ""}" type="button" data-lesson="${S.escapeHTML(lesson.id)}">
                      <span class="lesson-link-status">${S.icon("check")}</span>
                      <span>${S.escapeHTML(lesson.title)}</span>
                    </button>`;
                  })
                  .join("")}
              </li>`
            )
            .join("")}
        </ul>
        <button class="sidebar-assessment${state.view === "assessment" ? " is-active" : ""}${allLessonsComplete() ? "" : " is-locked"}" type="button" data-open-assessment>
          <span class="assessment-icon">${S.icon(progress.finalPassed ? "award" : allLessonsComplete() ? "clipboard" : "lock")}</span>
          <span>
            ${progress.finalPassed ? "Assessment passed" : "Final assessment"}
            <small>${
              progress.finalPassed
                ? `${progress.finalScore}% · View your completion`
                : allLessonsComplete()
                  ? "Ready when you are"
                  : "Finish the lessons to unlock"
            }</small>
          </span>
        </button>
        ${
          complete
            ? `<a class="btn btn--sm btn--wide" href="certificate.html?course=${encodeURIComponent(course.id)}">${S.icon("certificate")} ${S.getCertificate(course.id) ? "View certificate" : "Claim certificate"}</a>`
            : ""
        }
      </div>`;
  }

  function renderContentBlock(block, index) {
    if (!block || !block.type) return "";
    switch (block.type) {
      case "lead":
        return `<p class="lead">${inline(block.text)}</p>`;
      case "p":
        return `<p>${inline(block.text)}</p>`;
      case "h":
        return `<h2>${inline(block.text)}</h2>`;
      case "h3":
        return `<h3>${inline(block.text)}</h3>`;
      case "list": {
        const tag = block.style === "number" ? "ol" : "ul";
        return `<${tag}>${(block.items || []).map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`;
      }
      case "steps":
        return `<ol class="steps">${(block.items || [])
          .map((item) => `<li><strong>${inline(item.title || item)}</strong>${item.text ? `<br>${inline(item.text)}` : ""}</li>`)
          .join("")}</ol>`;
      case "callout":
        return `<div class="callout callout--${S.escapeHTML(block.tone || "note")}">
          <strong>${S.icon(block.tone === "warning" ? "shield" : block.tone === "challenge" ? "target" : block.tone === "tip" ? "spark" : "book-open")} ${S.escapeHTML(block.title || "Good to know")}</strong>
          <span>${inline(block.text)}</span>
        </div>`;
      case "code":
        return `<div class="code-block">
          <div class="code-header"><span>${S.escapeHTML(block.language || "code")}</span><button class="text-link" type="button" data-copy-code style="color:inherit;font-size:.68rem">Copy</button></div>
          <pre><code>${S.escapeHTML(block.code || "")}</code></pre>
        </div>`;
      case "table":
        return `<div class="table-wrap"><table>
          <thead><tr>${(block.headers || []).map((header) => `<th>${inline(header)}</th>`).join("")}</tr></thead>
          <tbody>${(block.rows || []).map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>${block.caption ? `<p class="small muted">${inline(block.caption)}</p>` : ""}`;
      case "quote":
        return `<blockquote>${inline(block.text)}${block.cite ? `<footer>— ${S.escapeHTML(block.cite)}</footer>` : ""}</blockquote>`;
      case "quiz":
        return `<div class="inline-quiz" data-inline-quiz data-answer="${Number(block.answer)}">
          <div class="inline-quiz-head">${S.icon("brain")} Quick check</div>
          <h3>${inline(block.question)}</h3>
          <div class="quiz-options">
            ${(block.options || [])
              .map(
                (option, optionIndex) => `<label class="quiz-option">
                  <input type="radio" name="inline-quiz-${index}" value="${optionIndex}">
                  <span>${inline(option)}</span>
                </label>`
              )
              .join("")}
          </div>
          <button class="btn btn--sm" type="button" data-check-inline-quiz style="margin-top:12px">Check answer</button>
          <p class="quiz-explanation" data-quiz-explanation hidden>${inline(block.explanation || "")}</p>
        </div>`;
      default:
        return block.text ? `<p>${inline(block.text)}</p>` : "";
    }
  }

  function renderLessonHtml() {
    const lesson = findLesson(state.lessonId);
    if (!lesson) return "";
    const pos = lessonPosition(lesson.id);
    const done = progress.completedLessons.includes(lesson.id);
    const content = (lesson.content || []).map(renderContentBlock).join("");
    const isLast = !pos.next;
    const nextActionLabel = done
      ? isLast
        ? "Go to final assessment"
        : "Next lesson"
      : isLast
        ? "Mark complete & review"
        : "Mark complete & continue";

    return `<article class="lesson-panel is-entering">
      <header class="lesson-header">
        <div class="lesson-eyebrow">
          <span>${S.escapeHTML(lesson.moduleTitle)}</span>
          <span class="dot"></span>
          <span>Lesson ${pos.index + 1} of ${totalLessons()}</span>
          <span class="dot"></span>
          <span>${Number(lesson.minutes) || 10} min</span>
        </div>
        <h2 class="lesson-title">${S.escapeHTML(lesson.title)}</h2>
        ${done ? `<span class="lesson-complete-chip">${S.icon("check")} Completed</span>` : ""}
      </header>
      <div class="prose">${content}</div>
      <nav class="lesson-nav" aria-label="Lesson navigation">
        <div class="lesson-nav-left">
          ${pos.previous ? `<button class="btn btn--ghost btn--sm" type="button" data-lesson="${S.escapeHTML(pos.previous.id)}">${S.icon("arrow-left")} Previous</button>` : ""}
        </div>
        <div class="lesson-nav-right">
          ${
            !done
              ? `<button class="btn btn--sm" type="button" data-complete-lesson="${S.escapeHTML(lesson.id)}">${S.icon("check")} ${nextActionLabel}</button>`
              : pos.next
                ? `<button class="btn btn--sm" type="button" data-lesson="${S.escapeHTML(pos.next.id)}">${nextActionLabel} ${S.icon("arrow-right")}</button>`
                : `<button class="btn btn--sm" type="button" data-open-assessment>Go to final assessment ${S.icon("arrow-right")}</button>`
          }
        </div>
      </nav>
    </article>`;
  }

  function renderAssessmentLocked() {
    const stats = S.getCourseStats({ lessonCount: totalLessons() }, progress);
    return `<article class="lesson-panel is-entering">
      <header class="lesson-header">
        <div class="lesson-eyebrow"><span>Final assessment</span></div>
        <h2 class="lesson-title">One last step</h2>
      </header>
      <div class="assessment-panel">
        <div class="assessment-intro">
          <p>Complete all ${totalLessons()} lessons before taking the final assessment. You have completed <strong>${stats.completed}</strong> so far. Your progress is saved automatically.</p>
        </div>
        <div class="assessment-actions">
          <button class="btn" type="button" data-lesson="${S.escapeHTML(firstIncompleteLessonId())}">Continue learning ${S.icon("arrow-right")}</button>
        </div>
      </div>
    </article>`;
  }

  function firstIncompleteLessonId() {
    const next = allLessons().find((lesson) => !progress.completedLessons.includes(lesson.id));
    return next ? next.id : allLessons()[0].id;
  }

  function renderAssessmentForm() {
    const questions = course.finalAssessment?.questions || [];
    const failedNote =
      state.attempt && !state.attempt.passed
        ? `<div class="assessment-intro"><p><strong>Not quite yet.</strong> You scored ${state.attempt.score}%. You need ${course.finalAssessment.passScore || 80}% to pass. Review the explanations below, then try again.</p></div>`
        : "";
    return `<article class="lesson-panel is-entering">
      <header class="lesson-header">
        <div class="lesson-eyebrow"><span>Final assessment</span><span class="dot"></span><span>${questions.length} questions</span></div>
        <h2 class="lesson-title">${S.escapeHTML(course.finalAssessment?.title || "Show what you know")}</h2>
      </header>
      <div class="assessment-panel">
        <div class="assessment-intro">
          <p>${S.escapeHTML(course.finalAssessment?.intro || "Answer the questions below. You need 80% to pass and unlock your certificate.")}</p>
        </div>
        ${failedNote}
        <form class="assessment-form" id="assessmentForm" novalidate>
          ${questions
            .map(
              (question, index) => `<fieldset class="assessment-question" style="border:1px solid var(--line);padding:20px;margin:0">
                <h3 style="display:flex"><span class="q-num">${index + 1}</span><span>${inline(question.question)}</span></h3>
                <div class="quiz-options">
                  ${(question.options || [])
                    .map(
                      (option, optionIndex) => `<label class="quiz-option">
                        <input type="radio" name="q${index}" value="${optionIndex}" required>
                        <span>${inline(option)}</span>
                      </label>`
                    )
                    .join("")}
                </div>
              </fieldset>`
            )
            .join("")}
          <div class="assessment-actions">
            <button class="btn" type="submit">${S.icon("clipboard")} Submit assessment</button>
            <button class="btn btn--ghost" type="button" data-lesson="${S.escapeHTML(state.lessonId || allLessons()[0].id)}">Back to lessons</button>
          </div>
          <p class="field-help" id="assessmentFormMessage" role="status"></p>
        </form>
      </div>
    </article>`;
  }

  function renderAssessmentReview(attempt) {
    const questions = course.finalAssessment?.questions || [];
    return `<div class="assessment-feedback">
      <div class="assessment-result ${attempt.passed ? "is-pass" : "is-fail"}">
        <div class="result-score">${attempt.score}%</div>
        <div>
          <h3>${attempt.passed ? "You passed." : "Almost there."}</h3>
          <p>${attempt.passed ? "Your result has been saved." : `You need ${course.finalAssessment.passScore || 80}% to pass. Review the answers and try again.`}</p>
        </div>
      </div>
      ${questions
        .map((question, index) => {
          const chosen = attempt.answers[index];
          const correct = Number(question.answer);
          return `<div class="assessment-question">
            <h3 style="display:flex"><span class="q-num">${index + 1}</span><span>${inline(question.question)}</span></h3>
            <p class="small" style="margin:0 0 5px;color:${chosen === correct ? "var(--success)" : "var(--danger)"};font-weight:700">
              ${chosen === correct ? "Correct" : `Your answer: ${inline(question.options[chosen] || "No answer")}`}
            </p>
            ${chosen === correct ? "" : `<p class="small" style="margin:0 0 5px"><strong>Correct answer:</strong> ${inline(question.options[correct] || "")}</p>`}
            ${question.explanation ? `<p class="small muted" style="margin:0">${inline(question.explanation)}</p>` : ""}
          </div>`;
        })
        .join("")}
      <div class="assessment-actions">
        ${!attempt.passed ? `<button class="btn" type="button" data-retry-assessment>${S.icon("refresh")} Try again</button>` : ""}
      </div>
    </div>`;
  }

  function renderPassed(attempt) {
    const score = attempt ? attempt.score : progress.finalScore;
    const profile = S.getProfile();
    const certificate = S.getCertificate(course.id);
    return `<article class="lesson-panel is-entering">
      <div class="completion-card">
        <div class="completion-seal">${S.icon("award")}</div>
        <p class="eyebrow" style="justify-content:center">Course complete · ${score}%</p>
        <h2>You did it.</h2>
        <p>You finished <strong>${S.escapeHTML(course.title)}</strong> and earned the <strong>${S.escapeHTML(course.badge?.name || "course")}</strong> badge.${
          profile ? ` Your certificate is ready, ${S.escapeHTML(S.firstName(profile.name))}.` : " Create a learner profile to put your name on the certificate."
        }</p>
        <div class="completion-actions">
          ${
            profile
              ? `<a class="btn" href="certificate.html?course=${encodeURIComponent(course.id)}">${S.icon("certificate")} ${certificate ? "View certificate" : "Claim certificate"}</a>`
              : `<a class="btn" href="account.html?next=${encodeURIComponent(`course.html?course=${course.id}`)}">${S.icon("user")} Create profile</a>`
          }
          <button class="btn btn--ghost" type="button" data-lesson="${S.escapeHTML(allLessons()[0].id)}">Review lessons</button>
        </div>
      </div>
      ${attempt ? `<div style="margin-top:28px">${renderAssessmentReview(attempt)}</div>` : ""}
    </article>`;
  }

  function renderAssessment() {
    const stage = document.getElementById("lessonStage");
    if (!stage) return;
    if (!allLessonsComplete()) {
      stage.innerHTML = renderAssessmentLocked();
    } else if (state.attempt && !state.attempt.passed) {
      stage.innerHTML = `<article class="lesson-panel is-entering">
        <header class="lesson-header">
          <div class="lesson-eyebrow"><span>Final assessment</span><span class="dot"></span><span>Review</span></div>
          <h2 class="lesson-title">${state.attempt.score}%</h2>
        </header>
        <div class="assessment-panel">
          ${renderAssessmentReview(state.attempt)}
          <div class="assessment-actions">
            <button class="btn" type="button" data-retry-assessment>${S.icon("refresh")} Try again</button>
            <button class="btn btn--ghost" type="button" data-lesson="${S.escapeHTML(state.lessonId || allLessons()[0].id)}">Back to lessons</button>
          </div>
        </div>
      </article>`;
    } else if (progress.finalPassed) {
      S.issueCertificate(course, progress);
      stage.innerHTML = `${renderPassed(null)}
        <div class="assessment-panel" style="margin-top:28px">
          <div class="assessment-actions">
            <button class="btn btn--ghost btn--sm" type="button" data-retry-assessment>${S.icon("refresh")} Retake assessment</button>
          </div>
        </div>`;
    } else {
      stage.innerHTML = renderAssessmentForm();
      if (state.attempt) {
        const review = document.createElement("div");
        review.innerHTML = renderAssessmentReview(state.attempt);
        stage.querySelector(".assessment-panel")?.appendChild(review);
      }
    }
    renderSidebar();
    bindStageEvents();
  }

  function renderLesson() {
    const stage = document.getElementById("lessonStage");
    if (!stage) return;
    stage.innerHTML = renderLessonHtml();
    renderSidebar();
    bindStageEvents();
    const lesson = findLesson(state.lessonId);
    if (lesson) {
      progress = S.recordLastLesson(course.id, lesson.id);
      renderSidebar();
    }
  }

  function renderRoute() {
    if (state.view === "assessment") renderAssessment();
    else renderLesson();
    updateUrl();
  }

  function setView(view, lessonId) {
    state.view = view;
    if (lessonId) state.lessonId = lessonId;
    renderRoute();
    const stage = document.getElementById("lessonStage");
    if (stage) {
      stage.focus({ preventScroll: true });
      window.scrollTo({ top: Math.max(stage.getBoundingClientRect().top + window.scrollY - 100, 0), behavior: "smooth" });
    }
  }

  function bindStageEvents() {
    const stage = document.getElementById("lessonStage");
    if (!stage || stage.dataset.bound === "true") {
      if (!stage) return;
    }
    if (stage.dataset.bound === "true") return;
    stage.dataset.bound = "true";
    stage.addEventListener("click", (event) => {
      const lessonButton = event.target.closest("[data-lesson]");
      if (lessonButton) {
        setView("lesson", lessonButton.dataset.lesson);
        return;
      }
      const assessmentButton = event.target.closest("[data-open-assessment]");
      if (assessmentButton) {
        setView("assessment");
        return;
      }
      const completeButton = event.target.closest("[data-complete-lesson]");
      if (completeButton) {
        const lesson = findLesson(completeButton.dataset.completeLesson);
        progress = S.markLesson(course.id, completeButton.dataset.completeLesson, true, totalLessons());
        S.toast(lesson && !progress.finalPassed ? "Lesson complete. Keep going." : "Lesson complete.");
        const pos = lessonPosition(completeButton.dataset.completeLesson);
        if (pos.next) setView("lesson", pos.next.id);
        else setView("assessment");
        return;
      }
      const copy = event.target.closest("[data-copy-code]");
      if (copy) {
        const code = copy.closest(".code-block")?.querySelector("pre")?.innerText || "";
        navigator.clipboard?.writeText(code).then(
          () => S.toast("Code copied to clipboard."),
          () => S.toast("Could not copy — select the code manually.", "warning")
        );
        return;
      }
      const inlineCheck = event.target.closest("[data-check-inline-quiz]");
      if (inlineCheck) {
        const quiz = inlineCheck.closest("[data-inline-quiz]");
        const selected = quiz.querySelector("input:checked");
        if (!selected) {
          S.toast("Choose an answer first.", "warning");
          return;
        }
        const correct = Number(quiz.dataset.answer);
        const chosen = Number(selected.value);
        quiz.querySelectorAll(".quiz-option").forEach((option) => {
          const input = option.querySelector("input");
          option.classList.toggle("is-correct", Number(input.value) === correct);
          option.classList.toggle("is-wrong", Number(input.value) === chosen && chosen !== correct);
        });
        const explanation = quiz.querySelector("[data-quiz-explanation]");
        if (explanation) explanation.hidden = false;
        inlineCheck.disabled = true;
        inlineCheck.textContent = chosen === correct ? "Correct" : "See explanation";
        return;
      }
      const retry = event.target.closest("[data-retry-assessment]");
      if (retry) {
        state.attempt = null;
        renderAssessment();
        return;
      }
      const assessment = event.target.closest("[data-open-assessment]");
      if (assessment) setView("assessment");
    });

    stage.addEventListener("submit", (event) => {
      if (event.target.id !== "assessmentForm") return;
      event.preventDefault();
      const form = event.target;
      const questions = course.finalAssessment?.questions || [];
      const answers = [];
      let missing = false;
      questions.forEach((question, index) => {
        const selected = form.querySelector(`input[name="q${index}"]:checked`);
        if (!selected) missing = true;
        answers.push(selected ? Number(selected.value) : -1);
      });
      if (missing) {
        const msg = document.getElementById("assessmentFormMessage");
        if (msg) msg.textContent = "Please answer every question before submitting.";
        return;
      }
      const correct = questions.reduce((sum, question, index) => sum + (answers[index] === Number(question.answer) ? 1 : 0), 0);
      const score = Math.round((correct / questions.length) * 100);
      const passScore = Number(course.finalAssessment?.passScore || 80);
      const passed = score >= passScore;
      progress = S.recordAssessment(course.id, score, passed, totalLessons());
      state.attempt = { score, passed, answers };
      if (passed) {
        S.toast(`Assessment passed with ${score}%. Certificate unlocked!`);
        S.issueCertificate(course, progress);
      } else {
        S.toast(`You scored ${score}%. Review the feedback and try again.`, "warning");
      }
      renderAssessment();
      window.scrollTo({ top: Math.max(stage.getBoundingClientRect().top + window.scrollY - 100, 0), behavior: "smooth" });
    });
  }

  function setupSidebarEvents() {
    const sidebar = document.getElementById("courseSidebar");
    if (!sidebar || sidebar.dataset.bound === "true") return;
    sidebar.dataset.bound = "true";
    sidebar.addEventListener("click", (event) => {
      const lesson = event.target.closest("[data-lesson]");
      if (lesson) {
        setView("lesson", lesson.dataset.lesson);
        return;
      }
      if (event.target.closest("[data-open-assessment]")) setView("assessment");
    });
  }

  function initFromHash() {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (hash === "assessment") {
      state.view = "assessment";
      state.lessonId = progress.lastLesson || allLessons()[0]?.id || null;
      return;
    }
    if (hash && findLesson(hash)) {
      state.view = "lesson";
      state.lessonId = hash;
      return;
    }
    state.view = "lesson";
    state.lessonId = progress.lastLesson && findLesson(progress.lastLesson) ? progress.lastLesson : allLessons()[0]?.id || null;
  }

  async function init() {
    const id = S.getQueryParam("course");
    if (!id) {
      pageError("Choose a course first", "Open the course catalog and pick a skill you want to learn.");
      return;
    }
    root().innerHTML = `<div class="container section"><div class="loading-panel"><div class="line skeleton"></div><div class="line skeleton"></div><div class="line skeleton"></div></div></div>`;

    try {
      const catalog = await S.loadCatalog();
      summary = (catalog.courses || []).find((item) => item.id === id);
      if (!summary) {
        pageError("Course not found", "That course may have moved. Browse the catalog to find another one.");
        return;
      }
      course = await S.loadCourse(summary);
      if (!course.modules || !course.modules.length) throw new Error("Course has no modules.");
      course.id = course.id || summary.id;
      course.title = course.title || summary.title;
      course.badge = course.badge || summary.badge;
      course.skills = course.skills || summary.skills;
      progress = S.getCourseProgress(course.id);
      document.title = `${course.title} · Skillshop`;
      initFromHash();
      renderShell();
      renderSidebar();
      setupSidebarEvents();
      renderRoute();
    } catch (error) {
      console.error(error);
      pageError("Course could not load", "Check your connection, or start a local web server if you are viewing the files directly. The README has the command.");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
