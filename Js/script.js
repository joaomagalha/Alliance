/* ============================================================
   On-scroll reveal — fade + slide-up + blur, com stagger.
   Pausa a animação CSS até o elemento entrar na viewport.
   Respeita prefers-reduced-motion (CSS desabilita a animação).
   ============================================================ */
const animateTargets = document.querySelectorAll(".animate-on-scroll");
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

