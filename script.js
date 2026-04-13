"use strict";

(() => {
  const ALLOWED_PASSWORD = "EMA";
  const BOOT_MESSAGES = [
    "[BOOT] Cipher modules loaded",
    "[SCAN] Checking secure memory sectors",
    "[NET] Routing packets through stealth tunnel",
    "[AUTH] Waiting for operator credentials"
  ];

  const IMAGE_FILES = [
    "WhatsApp Image 2026-04-01 at 18.03.06 (1).jpeg",
    "WhatsApp Image 2026-04-01 at 18.03.06.jpeg",
    "WhatsApp Image 2026-04-01 at 18.03.07.jpeg"
  ];

  const VIDEO_FILES = [
    "WhatsApp Video 2026-03-31 at 22.40.03.mp4",
    "WhatsApp Video 2026-04-01 at 18.03.02.mp4",
    "WhatsApp Video 2026-04-01 at 18.03.03.mp4",
    "WhatsApp Video 2026-04-01 at 18.03.04.mp4",
    "WhatsApp Video 2026-04-01 at 18.03.05.mp4"
  ];

  const elements = {
    particlesCanvas: document.getElementById("particles-canvas"),
    loginScreen: document.getElementById("login-screen"),
    terminalShell: document.querySelector(".terminal-shell"),
    bootLines: document.getElementById("bootLines"),
    bootProgress: document.getElementById("bootProgress"),
    progressValue: document.getElementById("progressValue"),
    loginForm: document.getElementById("loginForm"),
    passwordInput: document.getElementById("passwordInput"),
    loginStatus: document.getElementById("loginStatus"),
    entryTransition: document.getElementById("entry-transition"),
    mainApp: document.getElementById("main-app"),
    navToggle: document.getElementById("navToggle"),
    navLinksWrap: document.getElementById("mainNav"),
    navLinks: Array.from(document.querySelectorAll(".nav-link")),
    sections: Array.from(document.querySelectorAll(".spa-section")),
    typingText: document.getElementById("typingText"),
    imageGallery: document.getElementById("imageGallery"),
    videoGallery: document.getElementById("videoGallery"),
    mediaModal: document.getElementById("mediaModal"),
    modalClose: document.getElementById("modalClose"),
    modalBody: document.getElementById("modalBody"),
    contactForm: document.getElementById("contactForm"),
    contactStatus: document.getElementById("contactStatus")
  };

  const state = {
    activeSectionId: "home-section",
    typingStarted: false
  };

  initParticles();
  initNavigation();
  initTiltEffects();
  initModal();
  initContactForm();
  buildGallery();
  initLogin();
  runBootSequence();

  function runBootSequence() {
    let progress = 0;
    let lineIndex = 0;
    const thresholds = BOOT_MESSAGES.map((_, index) => Math.round(((index + 1) / BOOT_MESSAGES.length) * 100));

    const interval = window.setInterval(() => {
      progress = Math.min(100, progress + (Math.random() * 6 + 2));
      const value = Math.floor(progress);

      updateProgress(value);

      while (lineIndex < BOOT_MESSAGES.length && value >= thresholds[lineIndex]) {
        addBootLine(BOOT_MESSAGES[lineIndex]);
        lineIndex += 1;
      }

      if (value >= 100) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          if (elements.loginForm) {
            elements.loginForm.classList.remove("is-hidden");
          }
          if (elements.passwordInput) {
            elements.passwordInput.focus();
          }
          setStatus(elements.loginStatus, "Waiting for passphrase...", "");
        }, 380);
      }
    }, 95);
  }

  function addBootLine(text) {
    if (!elements.bootLines) {
      return;
    }
    const line = document.createElement("p");
    line.textContent = `> ${text}`;
    elements.bootLines.appendChild(line);
  }

  function updateProgress(value) {
    if (elements.bootProgress) {
      elements.bootProgress.style.width = `${value}%`;
    }
    if (elements.progressValue) {
      elements.progressValue.textContent = `${value}%`;
    }
  }

  function initLogin() {
    if (!elements.loginForm || !elements.passwordInput) {
      return;
    }

    elements.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = elements.passwordInput.value.trim();

      if (value === ALLOWED_PASSWORD) {
        handleLoginSuccess();
        return;
      }

      handleLoginError();
    });
  }

  function handleLoginSuccess() {
    setStatus(elements.loginStatus, "SYSTEM ACCESS GRANTED", "success");

    const submitButton = elements.loginForm ? elements.loginForm.querySelector("button[type='submit']") : null;
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (elements.passwordInput) {
      elements.passwordInput.disabled = true;
    }

    window.setTimeout(() => {
      if (elements.loginScreen) {
        elements.loginScreen.classList.remove("is-active");
      }
      if (elements.entryTransition) {
        elements.entryTransition.classList.add("is-active");
      }

      window.setTimeout(() => {
        if (elements.entryTransition) {
          elements.entryTransition.classList.add("transition-exit");
        }
      }, 1150);

      window.setTimeout(() => {
        if (elements.entryTransition) {
          elements.entryTransition.classList.remove("transition-exit", "is-active");
        }
        if (elements.mainApp) {
          elements.mainApp.classList.add("is-active");
        }
        activateSection("home-section", true);
      }, 1900);
    }, 600);
  }

  function handleLoginError() {
    setStatus(elements.loginStatus, "ACCESS DENIED // INVALID KEY", "error");

    if (elements.terminalShell) {
      elements.terminalShell.classList.add("shake");
      window.setTimeout(() => elements.terminalShell && elements.terminalShell.classList.remove("shake"), 420);
    }

    if (elements.loginScreen) {
      elements.loginScreen.classList.add("login-failure");
      window.setTimeout(() => elements.loginScreen && elements.loginScreen.classList.remove("login-failure"), 460);
    }

    if (elements.passwordInput) {
      elements.passwordInput.focus();
      elements.passwordInput.select();
    }
  }

  function initNavigation() {
    const clickTargets = document.querySelectorAll("[data-target]");
    clickTargets.forEach((target) => {
      target.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = target.getAttribute("data-target");
        if (!sectionId) {
          return;
        }
        activateSection(sectionId, false);
      });
    });

    if (elements.navToggle && elements.navLinksWrap) {
      elements.navToggle.addEventListener("click", () => {
        const isOpen = elements.navLinksWrap.classList.toggle("is-open");
        elements.navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closeMobileNav();
      }
    });
  }

  function activateSection(sectionId, force) {
    if (!force && state.activeSectionId === sectionId) {
      return;
    }

    const targetSection = elements.sections.find((section) => section.id === sectionId);
    if (!targetSection) {
      return;
    }

    state.activeSectionId = sectionId;

    elements.sections.forEach((section) => {
      section.classList.toggle("is-visible", section.id === sectionId);
    });

    elements.navLinks.forEach((button) => {
      button.classList.toggle("is-selected", button.getAttribute("data-target") === sectionId);
    });

    if (!force) {
      targetSection.scrollTo({ top: 0, behavior: "smooth" });
    }

    closeMobileNav();
    revealSection(targetSection);

    if (sectionId === "description-section") {
      startTypingEffect();
    }
  }

  function closeMobileNav() {
    if (!elements.navLinksWrap || !elements.navToggle) {
      return;
    }
    elements.navLinksWrap.classList.remove("is-open");
    elements.navToggle.setAttribute("aria-expanded", "false");
  }

  function revealSection(section) {
    const reveals = Array.from(section.querySelectorAll(".reveal"));
    reveals.forEach((node, index) => {
      if (node.classList.contains("reveal-in")) {
        return;
      }
      window.setTimeout(() => node.classList.add("reveal-in"), 90 + index * 80);
    });
  }

  function startTypingEffect() {
    if (state.typingStarted || !elements.typingText) {
      return;
    }

    state.typingStarted = true;
    const content = elements.typingText.getAttribute("data-fulltext") || "";
    elements.typingText.textContent = "";

    let index = 0;
    const timer = window.setInterval(() => {
      index += Math.random() > 0.8 ? 2 : 1;
      elements.typingText.textContent = content.slice(0, index);

      if (index >= content.length) {
        window.clearInterval(timer);
      }
    }, 24);
  }

  function buildGallery() {
    renderGalleryCards(elements.imageGallery, IMAGE_FILES, "image");
    renderGalleryCards(elements.videoGallery, VIDEO_FILES, "video");
  }

  function renderGalleryCards(container, files, kind) {
    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!files.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = kind === "image"
        ? "Ajoute des images dans assets/images/ pour remplir la galerie."
        : "Ajoute des videos dans assets/videos/ pour remplir la galerie.";
      container.appendChild(empty);
      return;
    }

    files.forEach((fileName) => {
      const card = document.createElement("article");
      card.className = "media-card reveal";
      card.tabIndex = 0;
      card.setAttribute("role", "button");

      const label = prettifyLabel(fileName);
      const src = encodeURI(`assets/${kind === "image" ? "images" : "videos"}/${fileName}`);
      card.setAttribute("aria-label", `${kind === "image" ? "Ouvrir l'image" : "Ouvrir la video"} ${label}`);

      if (kind === "image") {
        const image = document.createElement("img");
        image.src = src;
        image.alt = label;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          card.classList.add("field-invalid");
          const caption = card.querySelector(".media-caption");
          if (caption) {
            caption.textContent = `Fichier introuvable: ${fileName}`;
          }
        });
        card.appendChild(image);
      } else {
        const preview = document.createElement("video");
        preview.src = src;
        preview.muted = true;
        preview.playsInline = true;
        preview.preload = "metadata";
        preview.loop = true;
        preview.controls = false;
        card.appendChild(preview);

        const pill = document.createElement("span");
        pill.className = "play-pill";
        pill.textContent = "VIDEO";
        card.appendChild(pill);

        card.addEventListener("pointerenter", () => {
          preview.play().catch(() => undefined);
        });

        card.addEventListener("pointerleave", () => {
          preview.pause();
          preview.currentTime = 0;
        });
      }

      const caption = document.createElement("p");
      caption.className = "media-caption";
      caption.textContent = label;
      card.appendChild(caption);

      card.addEventListener("click", () => openMediaModal(kind, src, label));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMediaModal(kind, src, label);
        }
      });

      container.appendChild(card);
    });
  }

  function prettifyLabel(fileName) {
    return fileName.replace(/\.[^.]+$/, "").replace(/\s+/g, " ").trim();
  }

  function initModal() {
    if (!elements.mediaModal || !elements.modalClose || !elements.modalBody) {
      return;
    }

    elements.modalClose.addEventListener("click", closeMediaModal);

    elements.mediaModal.addEventListener("click", (event) => {
      if (event.target === elements.mediaModal) {
        closeMediaModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && elements.mediaModal.classList.contains("is-open")) {
        closeMediaModal();
      }
    });
  }

  function openMediaModal(kind, src, label) {
    if (!elements.mediaModal || !elements.modalBody) {
      return;
    }

    elements.modalBody.innerHTML = "";

    let mediaElement;
    if (kind === "image") {
      mediaElement = document.createElement("img");
      mediaElement.src = src;
      mediaElement.alt = label;
    } else {
      mediaElement = document.createElement("video");
      mediaElement.src = src;
      mediaElement.autoplay = true;
      mediaElement.controls = true;
      mediaElement.playsInline = true;
      mediaElement.preload = "auto";
    }

    elements.modalBody.appendChild(mediaElement);
    elements.mediaModal.classList.add("is-open");
    elements.mediaModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeMediaModal() {
    if (!elements.mediaModal || !elements.modalBody) {
      return;
    }

    const activeVideo = elements.modalBody.querySelector("video");
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.removeAttribute("src");
      activeVideo.load();
    }

    elements.modalBody.innerHTML = "";
    elements.mediaModal.classList.remove("is-open");
    elements.mediaModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function initContactForm() {
    if (!elements.contactForm || !elements.contactStatus) {
      return;
    }

    const fields = {
      name: elements.contactForm.querySelector("#contactName"),
      email: elements.contactForm.querySelector("#contactEmail"),
      message: elements.contactForm.querySelector("#contactMessage")
    };

    Object.values(fields).forEach((field) => {
      if (!field) {
        return;
      }
      field.addEventListener("input", () => {
        field.classList.remove("field-invalid");
      });
    });

    elements.contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameValue = fields.name ? fields.name.value.trim() : "";
      const emailValue = fields.email ? fields.email.value.trim() : "";
      const messageValue = fields.message ? fields.message.value.trim() : "";

      const checks = [
        { field: fields.name, valid: nameValue.length > 1 },
        { field: fields.email, valid: isValidEmail(emailValue) },
        { field: fields.message, valid: messageValue.length >= 10 }
      ];

      checks.forEach((check) => {
        if (!check.field) {
          return;
        }
        check.field.classList.toggle("field-invalid", !check.valid);
      });

      const hasError = checks.some((check) => !check.valid);
      if (hasError) {
        setStatus(elements.contactStatus, "Merci de completer correctement nom, email et message (10 caracteres minimum).", "error");
        return;
      }

      setStatus(elements.contactStatus, "Message envoye. Nous revenons vers vous tres vite.", "success");
      elements.contactForm.reset();
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  function setStatus(target, message, type) {
    if (!target) {
      return;
    }

    target.textContent = message;
    target.classList.remove("status-success", "status-error");

    if (type === "success") {
      target.classList.add("status-success");
      return;
    }
    if (type === "error") {
      target.classList.add("status-error");
    }
  }

  function initTiltEffects() {
    const tiltNodes = document.querySelectorAll(".nav-link, .brand");
    tiltNodes.forEach((node) => {
      node.addEventListener("pointermove", (event) => {
        const bounds = node.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width;
        const relativeY = (event.clientY - bounds.top) / bounds.height;
        const rx = ((0.5 - relativeY) * 10).toFixed(2);
        const ry = ((relativeX - 0.5) * 12).toFixed(2);

        node.style.setProperty("--rx", `${rx}deg`);
        node.style.setProperty("--ry", `${ry}deg`);
        node.classList.add("tilt-active");
      });

      node.addEventListener("pointerleave", () => {
        node.classList.remove("tilt-active");
        node.style.removeProperty("--rx");
        node.style.removeProperty("--ry");
      });
    });
  }

  function initParticles() {
    if (!elements.particlesCanvas) {
      return;
    }

    const context = elements.particlesCanvas.getContext("2d");
    if (!context) {
      return;
    }

    let particles = [];
    const maxDistance = window.innerWidth < 780 ? 90 : 130;
    const particleCount = window.innerWidth < 780 ? 35 : 70;

    function createParticle(width, height) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.7 + 0.6,
        alpha: Math.random() * 0.5 + 0.2
      };
    }

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      elements.particlesCanvas.width = Math.floor(width * dpr);
      elements.particlesCanvas.height = Math.floor(height * dpr);
      elements.particlesCanvas.style.width = `${width}px`;
      elements.particlesCanvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: particleCount }, () => createParticle(width, height));
    }

    function drawParticles() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
        }
        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
        }

        context.beginPath();
        context.fillStyle = `rgba(116, 194, 255, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const first = particles[i];
          const second = particles[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.25;
            context.strokeStyle = `rgba(132, 186, 255, ${opacity})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      window.requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    drawParticles();
    window.addEventListener("resize", resizeCanvas);
  }
})();
