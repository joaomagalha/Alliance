/* ============================================================
   On-scroll reveal — fade + slide-up + blur, com stagger.
   Pausa a animação CSS até o elemento entrar na viewport.
   Respeita prefers-reduced-motion (CSS desabilita a animação).
   ============================================================ */
/* ============================================================
   Preloader — esconde a tela inicial após o load. Garante um
   tempo mínimo de exibição (1.6s) pra animação ser apreciada,
   mesmo se a página já tiver carregado rápido.
   ============================================================ */
const preloader = document.getElementById("preloader");
if (preloader) {
  const MIN_DISPLAY = 1600;
  const startedAt = performance.now();
  // Trava o scroll enquanto o preloader está visível
  document.body.style.overflow = "hidden";

  const hidePreloader = () => {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_DISPLAY - elapsed);
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.style.overflow = "";
      // Remove do DOM depois do fade (acessibilidade)
      setTimeout(() => preloader.remove(), 700);
    }, wait);
  };

  if (document.readyState === "complete") {
    hidePreloader();
  } else {
    window.addEventListener("load", hidePreloader);
  }
}


/* ============================================================
   Flashlight effect — atualiza CSS custom properties --mouse-x e
   --mouse-y nos cards quando o mouse passa, alimentando o radial
   gradient que segue o cursor.
   ============================================================ */
const flashlightCards = document.querySelectorAll(
  ".pricingCard, .classCard, .benefitCard, .testimonialCard, .professor-card, .differentialCard"
);
flashlightCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  });
});


const animateTargets = document.querySelectorAll(".animate-on-scroll, .animate-on-scroll-list");
if (animateTargets.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target); // anima uma vez só
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
  animateTargets.forEach((el) => io.observe(el));
}


const detalhes = document.querySelectorAll(".faqSectionCard");

detalhes.forEach((item) => {
  item.addEventListener("toggle", () => {
    
    if (item.open) {
      detalhes.forEach((outro) => {
        if (outro !== item) {
          outro.removeAttribute("open");
        }
      });
    }

  });
});

const tabs = document.querySelectorAll(".tab");
const tables = document.querySelectorAll(".scheduleTable");
const tablist = document.querySelector(".scheduleSectionDays");

function activateTab(tab) {
  tabs.forEach(t => {
    const isActive = t === tab;
    t.classList.toggle("active", isActive);
    t.setAttribute("aria-selected", isActive ? "true" : "false");
    t.setAttribute("tabindex", isActive ? "0" : "-1");
  });
  tables.forEach(t => t.classList.remove("active"));
  document.getElementById(tab.dataset.tab).classList.add("active");
  document.querySelector(".scheduleTables").scrollTop = 0;
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => activateTab(tab));
});

// navegação por teclado entre tabs (padrão ARIA APG — automatic activation)
if (tablist) {
  tablist.addEventListener("keydown", (e) => {
    const idx = Array.from(tabs).indexOf(document.activeElement);
    if (idx === -1) return;
    let next = idx;
    if (e.key === "ArrowRight")     next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home")      next = 0;
    else if (e.key === "End")       next = tabs.length - 1;
    else return;
    e.preventDefault();
    activateTab(tabs[next]);
    tabs[next].focus();
  });
}


const openBtn = document.getElementById("headerMenu");
const closeBtn = document.getElementById("closeBtn");
const mobileMenu = document.getElementById("mobileMenu");

// O menu mobile só existe na index.html. Sem esta guarda, openBtn/closeBtn
// são null nas páginas internas e .addEventListener lança TypeError.
if (openBtn && closeBtn && mobileMenu) {

    const openMenu = () => {
        mobileMenu.classList.add("active");
        mobileMenu.removeAttribute("inert"); // reativa antes de focar
        openBtn.setAttribute("aria-expanded", "true");
        closeBtn.focus(); // move o foco para dentro do menu
    };

    const closeMenu = () => {
        mobileMenu.classList.remove("active");
        mobileMenu.setAttribute("inert", ""); // tira links escondidos do tab/leitor de tela
        openBtn.setAttribute("aria-expanded", "false");
    };

    openBtn.addEventListener("click", openMenu);

    closeBtn.addEventListener("click", () => {
        closeMenu();
        openBtn.focus(); // devolve o foco a quem abriu o menu
    });

    document.addEventListener("click", (event) => {

        const clickedOutside =
            !mobileMenu.contains(event.target) &&
            !openBtn.contains(event.target);

        if (clickedOutside) {
            closeMenu();
        }

    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
            closeMenu();
            openBtn.focus();
        }
    });

}

