(() => {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    activeFilter: "all",
    isTouch: window.matchMedia("(pointer: coarse)").matches,
  };

  const loader = qs("#page-loader");
  const closeLoader = () => {
    if (!loader) return;
    loader.classList.add("is-hidden");
  };

  setTimeout(closeLoader, 1000);
  window.addEventListener("load", () => setTimeout(closeLoader, 180));

  const navMenu = qs("#nav-menu");
  const navToggle = qs("#nav-toggle");
  const navClose = qs("#nav-close");

  const closeMenu = () => {
    navMenu?.classList.remove("show-menu");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("show-menu");
    navToggle.classList.toggle("is-open", Boolean(isOpen));
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navClose?.addEventListener("click", closeMenu);
  qsa(".nav__link").forEach((link) => link.addEventListener("click", closeMenu));

  const header = qs("#header");
  const progress = qs("#scroll-progress");
  const scrollUp = qs("#scroll-up");

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 20);
    scrollUp?.classList.toggle("show", y > 520);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const width = maxScroll > 0 ? (y / maxScroll) * 100 : 0;
    if (progress) progress.style.width = `${width}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sections = qsa("main section[id]");
  const links = qsa(".nav__link");

  const setActiveLink = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active-link", isActive);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "-15% 0px -30% 0px",
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const typingEl = qs("#typing-role");
  const roles = ["MCA Graduate","Software Developer"];
  let roleIndex = 0;
  let charIndex = 0;
  let removing = false;

  const typeRole = () => {
    if (!typingEl) return;

    const text = roles[roleIndex];
    if (!removing) {
      charIndex += 1;
      typingEl.textContent = text.slice(0, charIndex);
      if (charIndex === text.length) {
        removing = true;
        setTimeout(typeRole, 1050);
        return;
      }
    } else {
      charIndex -= 1;
      typingEl.textContent = text.slice(0, charIndex);
      if (charIndex === 0) {
        removing = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(typeRole, removing ? 45 : 85);
  };
  typeRole();

  const revealElements = qsa(".reveal");
  qsa(".skill-row i").forEach((bar) => {
    const width = bar.getAttribute("data-width") || "0";
    bar.style.setProperty("--w", `${width}%`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  const counters = qsa("[data-counter]");
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.getAttribute("data-counter") || 0);
        const duration = 950;
        const start = performance.now();

        const tick = (time) => {
          const progressValue = Math.min((time - start) / duration, 1);
          el.textContent = `${Math.floor(progressValue * target)}${target === 100 ? "%" : "+"}`;
          if (progressValue < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = `${target}${target === 100 ? "%" : "+"}`;
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.35 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const themeButton = qs("#theme-button");
  const darkTheme = "dark-theme";

  const applyThemeIcon = () => {
    const icon = qs("i", themeButton);
    if (!icon) return;
    icon.className = document.body.classList.contains(darkTheme) ? "uil uil-sun" : "uil uil-moon";
  };

  const savedTheme = localStorage.getItem("selected-theme");
  if (savedTheme === "dark") {
    document.body.classList.add(darkTheme);
  }
  applyThemeIcon();

  themeButton?.addEventListener("click", () => {
    document.body.classList.toggle(darkTheme);
    localStorage.setItem("selected-theme", document.body.classList.contains(darkTheme) ? "dark" : "light");
    applyThemeIcon();
  });

  const projectCards = qsa(".project-card");
  const filterButtons = qsa(".filter-btn");
  const searchInput = qs("#project-search");

  const updateProjects = () => {
    const term = (searchInput?.value || "").trim().toLowerCase();

    projectCards.forEach((card) => {
      const category = card.getAttribute("data-category") || "";
      const title = (card.getAttribute("data-title") || "").toLowerCase();

      const categoryPass = state.activeFilter === "all" || category.includes(state.activeFilter);
      const textPass = !term || title.includes(term);
      const show = categoryPass && textPass;

      card.style.display = show ? "block" : "none";
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      state.activeFilter = button.getAttribute("data-filter") || "all";
      updateProjects();
    });
  });

  searchInput?.addEventListener("input", updateProjects);
  updateProjects();

  const contactForm = qs("#contact-form");
  const submitButton = qs("#contact-submit");
  const formStatus = qs("#form-status");

  const validateField = (field) => {
    const error = field.closest(".field")?.querySelector(".error-msg");
    let message = "";

    if (!field.value.trim()) {
      message = "This field is required.";
    } else if (field.type === "email") {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      if (!validEmail) message = "Enter a valid email address.";
    } else if (field.name === "message" && field.value.trim().length < 10) {
      message = "Message should be at least 10 characters.";
    }

    field.classList.toggle("error", Boolean(message));
    if (error) error.textContent = message;
    return !message;
  };

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = qsa("input, textarea", contactForm);
    const valid = fields.every(validateField);

    if (!valid) {
      formStatus.textContent = "Please fix highlighted fields.";
      formStatus.className = "form-status error";
      return;
    }

    submitButton?.classList.add("is-loading");
    formStatus.textContent = "";

    const rawName = qs("#name")?.value.trim() || "";
    const rawEmail = qs("#email")?.value.trim() || "";
    const rawMessage = qs("#message")?.value.trim() || "";

    const subject = encodeURIComponent(`Portfolio Contact from ${rawName}`);
    const body = encodeURIComponent(`Name: ${rawName}\nEmail: ${rawEmail}\n\nMessage:\n${rawMessage}`);
    const mailtoUrl = `mailto:ankitmakkar2003@gmail.com?subject=${subject}&body=${body}`;

    submitButton?.classList.remove("is-loading");
    formStatus.textContent = "Message prepared successfully. Opening email client...";
    formStatus.className = "form-status success";

    // Open mail client immediately to preserve browser user-gesture context.
    window.location.href = mailtoUrl;
    contactForm.reset();
  });

  qsa("input, textarea", contactForm || document).forEach((field) => {
    field.addEventListener("input", () => validateField(field));
  });

  const copyEmailButton = qs("#copy-email");
  const emailText = qs("#email-text");

  copyEmailButton?.addEventListener("click", async () => {
    const email = emailText?.textContent?.trim();
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      copyEmailButton.textContent = "Copied";
      setTimeout(() => {
        copyEmailButton.textContent = "Copy Email";
      }, 1200);
    } catch {
      copyEmailButton.textContent = "Copy failed";
      setTimeout(() => {
        copyEmailButton.textContent = "Copy Email";
      }, 1200);
    }
  });

  const resumeButton = qs("#resume-btn");
  resumeButton?.addEventListener("click", () => {
    resumeButton.classList.add("downloaded");
    setTimeout(() => resumeButton.classList.remove("downloaded"), 500);
  });

  if (!state.isTouch) {
    const cursorDot = qs("#cursor-dot");
    const cursorOutline = qs("#cursor-outline");

    let x = 0;
    let y = 0;
    let outlineX = 0;
    let outlineY = 0;

    const move = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (cursorDot && cursorOutline) {
        cursorDot.style.opacity = "1";
        cursorOutline.style.opacity = "1";
      }
    };

    const renderCursor = () => {
      outlineX += (x - outlineX) * 0.18;
      outlineY += (y - outlineY) * 0.18;

      if (cursorDot) {
        cursorDot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      }
      if (cursorOutline) {
        cursorOutline.style.transform = `translate(${outlineX - 14}px, ${outlineY - 14}px)`;
      }
      requestAnimationFrame(renderCursor);
    };

    window.addEventListener("mousemove", move, { passive: true });
    renderCursor();
  }

  const heroParallax = qs("#hero-parallax");
  if (heroParallax && !state.isTouch) {
    window.addEventListener("mousemove", (event) => {
      const px = (event.clientX / window.innerWidth - 0.5) * 6;
      const py = (event.clientY / window.innerHeight - 0.5) * -6;
      heroParallax.style.transform = `rotateX(${py}deg) rotateY(${px}deg)`;
    });

    window.addEventListener("mouseleave", () => {
      heroParallax.style.transform = "rotateX(0) rotateY(0)";
    });
  }

  if (window.Swiper) {
    new Swiper(".testimonials-swiper", {
      loop: true,
      speed: 600,
      slidesPerView: 1,
      spaceBetween: 16,
      autoplay: {
        delay: 2800,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".testimonials .swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
      },
    });
  }
})();
