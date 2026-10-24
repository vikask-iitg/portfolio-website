'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar toggle functionality for mobile
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
  const open = sidebar.classList.contains("active");
  sidebarBtn.setAttribute("aria-expanded", String(open));
  sidebarBtn.querySelector("span").textContent = open ? "Hide Contacts" : "Show Contacts";
});



// light / dark theme toggle (light is the default)
const root = document.documentElement;
const themeBtn = document.querySelector("[data-theme-toggle]");

const syncThemeBtn = function () {
  const dark = root.getAttribute("data-theme") === "dark";
  themeBtn.setAttribute("aria-checked", String(dark));
}

themeBtn.addEventListener("click", function () {
  const dark = root.getAttribute("data-theme") !== "dark";
  if (dark) root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  syncThemeBtn();
});

syncThemeBtn();



// experience modal variables
const experienceItems = document.querySelectorAll("[data-experience-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalLogo = document.querySelector("[data-modal-logo]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalDate = document.querySelector("[data-modal-date]");
const modalText = document.querySelector("[data-modal-text]");

let lastFocused = null;

const openModal = function (item) {
  lastFocused = item;
  const logo = item.querySelector("[data-experience-logo]");
  modalLogo.src = logo.src;
  modalLogo.alt = logo.alt;
  modalLogo.parentElement.classList.toggle("logo-full", logo.parentElement.classList.contains("logo-full"));
  modalTitle.textContent = item.querySelector("[data-experience-title]").textContent;
  modalDate.textContent = item.querySelector("[data-experience-date]").textContent;
  modalText.innerHTML = item.querySelector("[data-experience-text]").innerHTML;
  modalContainer.classList.add("active");
  overlay.classList.add("active");
  modalCloseBtn.focus();
}

const closeModal = function () {
  modalContainer.classList.remove("active");
  overlay.classList.remove("active");
  if (lastFocused) lastFocused.focus();
}

experienceItems.forEach(function (item) {
  item.addEventListener("click", function () { openModal(item); });
  item.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(item); }
  });
});

modalCloseBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalContainer.classList.contains("active")) closeModal();
});



// contact form: sends in the background via FormSubmit's AJAX endpoint (no page change).
// While a message is sending the button is locked, so only one can be sent at a time.
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formBtnLabel = formBtn.querySelector("span");
const formStatus = document.querySelector("[data-form-status]");
const formStatusText = document.querySelector("[data-form-status-text]");

const FORM_ENDPOINT = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

let sending = false;

const updateFormBtn = function () {
  formBtnLabel.textContent = sending ? "Sending…" : "Send Message";
  formBtn.toggleAttribute("disabled", sending || !form.checkValidity());
}

const showFormStatus = function (ok, message) {
  formStatus.classList.toggle("is-error", !ok);
  formStatusText.textContent = message;
  formStatus.hidden = false;
}

formInputs.forEach(function (input) {
  input.addEventListener("input", updateFormBtn);
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (sending || !form.checkValidity()) return;

  // honeypot filled in: almost certainly a bot, so pretend it worked
  if (form.elements._honey && form.elements._honey.value) {
    form.reset();
    showFormStatus(true, "Your message has been sent successfully. I'll get back to you soon.");
    return;
  }

  sending = true;
  formStatus.hidden = true;
  updateFormBtn();

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    });
    const data = await res.json().catch(function () { return {}; });

    if (res.ok && String(data.success) === "true") {
      form.reset();
      showFormStatus(true, "Your message has been sent successfully. I'll get back to you soon.");
    } else {
      showFormStatus(false, data.message || "Sorry, your message couldn't be sent. Please try again.");
    }
  } catch (err) {
    showFormStatus(false, "Sorry, your message couldn't be sent. Check your connection, or email me at vikask.iitg@gmail.com.");
  } finally {
    sending = false;
    updateFormBtn();
  }
});



// page navigation
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const showPage = function (name) {
  pages.forEach(function (page) {
    page.classList.toggle("active", page.dataset.page === name);
  });
  navigationLinks.forEach(function (link) {
    const active = link.dataset.navLink === name;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

navigationLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    showPage(link.dataset.navLink);
    history.replaceState(null, "", "#" + link.dataset.navLink);
    window.scrollTo(0, 0);
  });
});

// open the page named in the URL hash, e.g. index.html#projects
const initialPage = location.hash.slice(1);
if (document.querySelector('[data-page="' + initialPage + '"]')) showPage(initialPage);

