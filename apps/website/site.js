const installLink = document.querySelector("[data-client-link]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (installLink) {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  installLink.textContent = isStandalone ? "已在点单端" : "立即点单";
}

if (navToggle && navLinks) {
  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
