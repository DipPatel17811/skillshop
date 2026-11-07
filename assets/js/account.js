/* ==========================================================================
   Skillshop — local learner profile
   ========================================================================== */

(function () {
  "use strict";

  const S = window.Skillshop;
  const form = document.getElementById("profileForm");
  const picker = document.querySelector("[data-avatar-picker]");
  const title = document.querySelector("[data-account-title]");
  const copy = document.querySelector("[data-account-copy]");
  const submitLabel = document.querySelector("[data-account-submit]");
  const savedPanel = document.querySelector("[data-saved-panel]");
  const dangerZone = document.querySelector("[data-danger-zone]");
  const nextUrl = S.safeNextUrl(S.getQueryParam("next"), "dashboard.html");

  function renderAvatars(selected) {
    if (!picker) return;
    picker.innerHTML = S.AVATAR_COLORS.map(
      (color, index) => `<label class="avatar-choice" title="Avatar colour ${index + 1}">
        <input type="radio" name="avatarColor" value="${color}" aria-label="Avatar colour ${index + 1}" ${color === selected ? "checked" : ""}>
        <span style="--choice-color:${color}" aria-hidden="true"></span>
      </label>`
    ).join("");
  }

  function populate() {
    const profile = S.getProfile();
    renderAvatars(profile ? profile.avatarColor : S.AVATAR_COLORS[0]);
    if (profile) {
      form.elements.name.value = profile.name;
      form.elements.email.value = profile.email || "";
      title.textContent = `Welcome back, ${S.firstName(profile.name)}.`;
      copy.textContent = "Update the name that appears on your certificates, or manage the learning data stored in this browser.";
      submitLabel.textContent = "Save profile";
      savedPanel.hidden = false;
      dangerZone.hidden = false;
      const dateEl = document.querySelector("[data-member-since]");
      if (dateEl) dateEl.textContent = S.formatDate(profile.createdAt, { month: "long", year: "numeric" });
    } else {
      title.textContent = "Make this learning yours.";
      copy.textContent = "Create a local learner profile. It takes a few seconds and puts your name on every certificate you earn.";
      submitLabel.textContent = "Create my profile";
      savedPanel.hidden = true;
      dangerZone.hidden = true;
    }
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const avatarColor = String(formData.get("avatarColor") || S.AVATAR_COLORS[0]);
    if (name.length < 2) {
      S.toast("Add a name with at least two characters.", "warning");
      form.elements.name.focus();
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      S.toast("That email address does not look right.", "warning");
      form.elements.email.focus();
      return;
    }
    const result = S.saveProfile({ name, email, avatarColor });
    if (!result.ok) {
      S.toast(result.message, "warning");
      return;
    }
    S.toast("Profile saved. Your progress and certificates live in this browser.");
    window.setTimeout(() => {
      window.location.href = nextUrl;
    }, 550);
  });

  document.querySelector("[data-reset-progress]")?.addEventListener("click", () => {
    if (!window.confirm("Reset all lesson progress, assessment results, badges and certificates? Your profile will stay.")) return;
    localStorage.removeItem(S.KEYS.progress);
    localStorage.removeItem(S.KEYS.certificates);
    S.toast("Learning progress reset.");
    window.setTimeout(() => window.location.reload(), 450);
  });

  document.querySelector("[data-delete-profile]")?.addEventListener("click", () => {
    if (!window.confirm("Delete your profile and all local learning data? This cannot be undone.")) return;
    localStorage.removeItem(S.KEYS.profile);
    localStorage.removeItem(S.KEYS.progress);
    localStorage.removeItem(S.KEYS.certificates);
    window.location.href = "index.html";
  });

  document.addEventListener("DOMContentLoaded", populate);
})();
