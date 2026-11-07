/* ==========================================================================
   Skillshop — fixed certificate template
   ========================================================================== */

(function () {
  "use strict";

  const S = window.Skillshop;
  const app = document.getElementById("certificateApp");

  function certificateMarkup(data) {
    return `<div class="certificate" id="certificateCard" aria-label="Certificate of completion">
      <span class="cert-corner cert-corner--tl"></span>
      <span class="cert-corner cert-corner--tr"></span>
      <span class="cert-corner cert-corner--bl"></span>
      <span class="cert-corner cert-corner--br"></span>
      <div class="cert-content">
        <div class="cert-top">
          <div class="cert-brand">
            <span class="cert-brand-mark">${S.icon("spark")}</span>
            <span>Skillshop</span>
          </div>
          <div class="cert-id">Credential ${S.escapeHTML(data.credentialId)}</div>
        </div>
        <div class="cert-middle">
          <p class="cert-eyebrow">Skillshop · Learning Achievement</p>
          <h2 class="cert-main-title">Certificate of Completion</h2>
          <p class="cert-awarded-to">This certificate is awarded to</p>
          <p class="cert-name">${S.escapeHTML(data.learnerName)}</p>
          <p class="cert-completion">for successfully completing the ${S.escapeHTML(data.duration)} course and passing the final assessment${data.score ? ` with a score of ${S.escapeHTML(String(data.score))}%` : ""}.</p>
          <p class="cert-course">${S.escapeHTML(data.courseTitle)}</p>
          ${data.skills && data.skills.length ? `<ul class="cert-skills">${data.skills.map((skill) => `<li>${S.escapeHTML(skill)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="cert-bottom">
          <div class="cert-signature">
            <div class="sig-line">Skillshop Curriculum Team</div>
            <strong>Programme Director</strong>
            <span>Skillshop Learning</span>
          </div>
          <div class="cert-seal">
            <div class="cert-seal-inner">
              ${S.icon("award")}
              <strong>${S.escapeHTML(data.badgeName)}</strong>
              <span>Badge earned</span>
            </div>
          </div>
          <div class="cert-signature cert-signature--right">
            <div class="sig-line">${S.escapeHTML(data.issuedDate)}</div>
            <strong>Date issued</strong>
            <span>${S.escapeHTML(data.topic)} · ${S.escapeHTML(data.level || "Course")}</span>
          </div>
        </div>
      </div>
      ${data.preview ? `<div class="cert-watermark"><span>Preview</span></div>` : ""}
    </div>`;
  }

  function errorPanel(title, message) {
    app.innerHTML = `<div class="container section"><div class="empty-state">${S.icon("shield")}<h3>${S.escapeHTML(title)}</h3><p>${S.escapeHTML(message)}</p><a class="btn" href="courses.html">Browse courses</a></div></div>`;
  }

  async function init() {
    const id = S.getQueryParam("course");
    if (!id) {
      errorPanel("No certificate selected", "Choose a course from your dashboard or open its certificate after completing the final assessment.");
      return;
    }

    let catalog;
    try {
      catalog = await S.loadCatalog();
    } catch (error) {
      errorPanel("Certificate could not load", "Start a local web server or check your connection. See the README for instructions.");
      return;
    }
    const course = (catalog.courses || []).find((item) => item.id === id);
    if (!course) {
      errorPanel("Course not found", "That course is not in the catalog, so there is no certificate to display.");
      return;
    }
    const profile = S.getProfile();
    let progress = S.getCourseProgress(course.id);
    const complete = S.isCourseComplete(course, progress);
    const forcedPreview = S.getQueryParam("preview") === "1";
    let certificate = S.getCertificate(course.id);

    if (complete && profile && !forcedPreview && !certificate) {
      certificate = S.issueCertificate(course, progress);
    }
    const preview = forcedPreview || !complete || !certificate;
    const displayName = certificate?.learnerName || (profile ? profile.name : "Your Name");
    const issuedAt = certificate?.issuedAt || new Date().toISOString();
    const credentialId = certificate?.id || "PREVIEW-000000";
    const score = certificate?.score ?? progress.finalScore;
    const skills = certificate?.skills || course.skills || [];
    const badgeName = certificate?.badgeName || course.badge?.name || "Course badge";

    document.title = preview ? `Certificate preview · ${course.title} · Skillshop` : `${displayName} · ${course.title} certificate · Skillshop`;

    let note = "";
    if (forcedPreview) {
      note = `<div class="preview-note">${S.icon("eye")} <span>Template preview. This watermark will disappear when the certificate is earned.</span></div>`;
    } else if (!complete) {
      const stats = S.getCourseStats(course, progress);
      note = `<div class="preview-note">${S.icon("lock")} <span>This is a preview. You have completed <strong>${stats.completed} of ${stats.total}</strong> lessons and need to pass the final assessment to earn this certificate. <a class="text-link" href="course.html?course=${encodeURIComponent(course.id)}">Continue the course ${S.icon("arrow-right")}</a></span></div>`;
    } else if (!profile) {
      note = `<div class="preview-note">${S.icon("user")} <span>Your course is complete. Create a learner profile to put your name on the certificate and claim it. <a class="text-link" href="account.html?next=${encodeURIComponent(`certificate.html?course=${course.id}`)}">Create profile ${S.icon("arrow-right")}</a></span></div>`;
    }

    app.innerHTML = `
      <div class="container certificate-page">
        <div class="certificate-page-head">
          <div>
            <p class="eyebrow">${S.icon("certificate")} ${preview ? "Certificate preview" : "Certificate earned"}</p>
            <h1>${preview ? "Your certificate," : "A skill worth showing."} <span class="serif-italic">${preview ? "almost." : ""}</span></h1>
            <p>${S.escapeHTML(course.title)} · ${S.escapeHTML(course.duration)} · ${S.escapeHTML(course.level)}</p>
          </div>
          <div class="certificate-toolbar">
            <a class="btn btn--ghost btn--sm" href="dashboard.html">${S.icon("arrow-left")} Dashboard</a>
            ${!preview ? `<button class="btn btn--sm" type="button" data-print-certificate>${S.icon("printer")} Print / save PDF</button>` : ""}
            ${!preview ? `<button class="btn btn--ghost btn--sm" type="button" data-copy-credential>${S.icon("clipboard")} Copy ID</button>` : ""}
            <a class="btn btn--ghost btn--sm" href="course.html?course=${encodeURIComponent(course.id)}">${S.icon("book-open")} Course</a>
          </div>
        </div>
        ${note}
        <div class="certificate-stage">
          ${certificateMarkup({
            learnerName: displayName,
            courseTitle: course.title,
            duration: course.duration,
            score,
            badgeName,
            skills,
            credentialId,
            issuedDate: S.formatLongDate(issuedAt),
            topic: course.topic,
            level: course.level,
            preview
          })}
        </div>
        <p class="certificate-footnote">${preview ? "Preview mode — this certificate cannot be printed as an award yet." : "Your credential ID and issuance date are stored in this browser. Public verification and cloud accounts are planned for the next phase of Skillshop."}</p>
      </div>`;

    document.querySelector("[data-print-certificate]")?.addEventListener("click", () => window.print());
    document.querySelector("[data-copy-credential]")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(credentialId);
        S.toast("Credential ID copied.");
      } catch (error) {
        S.toast(`Credential ID: ${credentialId}`, "warning");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
