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
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
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

    // Click/touch fora do menu fecha. Usa pointerdown para responder
    // antes do click — mais confiável em iOS Safari e Android Chrome,
    // onde o evento `click` às vezes não dispara em elementos sem listener.
    const handleOutsidePointer = (event) => {
        if (!mobileMenu.classList.contains("active")) return;

        const clickedOutside =
            !mobileMenu.contains(event.target) &&
            !openBtn.contains(event.target);

        if (clickedOutside) {
            closeMenu();
        }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    // Fallback para navegadores sem Pointer Events (raros em 2026, mas seguro)
    document.addEventListener("click", handleOutsidePointer);

    // Scroll na página fecha o menu (padrão UX comum em menus mobile)
    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        if (!mobileMenu.classList.contains("active")) return;
        // Ignora micro-movimentos (< 5px) que podem vir do iOS rubber-band
        if (Math.abs(window.scrollY - lastScrollY) < 5) return;
        closeMenu();
        lastScrollY = window.scrollY;
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
            closeMenu();
            openBtn.focus();
        }
    });

}


/* ============================================================
   Professores — botões "Agendar particular" e "Valores" abrem
   o WhatsApp da Alliance com mensagem personalizada por professor.
   ============================================================ */
const ALLIANCE_PHONE = "5565996768010";

document.querySelectorAll(".professor-card").forEach((card) => {
    const name = card.querySelector(".professor-name")?.textContent.trim();
    if (!name) return;

    const openWhatsApp = (text) => {
        const url = `https://wa.me/${ALLIANCE_PHONE}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const agendarBtn = card.querySelector(".btn-primary");
    const valoresBtn = card.querySelector(".btn-secondary:not(.btn-icon-only)");

    agendarBtn?.addEventListener("click", () => {
        openWhatsApp(`Oi, quero agendar uma particular com o professor ${name}.`);
    });
    valoresBtn?.addEventListener("click", () => {
        openWhatsApp(`Oi, quero saber os valores da particular do professor ${name}.`);
    });
});


/* ============================================================
   Form → Formspree (envia email pra alliancemoinho@gmail.com).
   HTML5 required já bloqueia envio sem campos obrigatórios.
   Mensagem (textarea) é opcional. Estados visuais:
     - Enviando: spinner azul/cinza
     - Sucesso:  verde com check (volta após 4s)
     - Erro:     vermelho com aviso (volta após 4s)
   ============================================================ */
const contactForm = document.querySelector(".form");
if (contactForm) {
    // ⚠️ Substitua YOUR_FORM_ID pelo endpoint da sua conta Formspree
    // (https://formspree.io → New Form → copie o URL do POST)
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

    const submitBtn  = contactForm.querySelector("button.btn");
    const timeLabels = { morning: "Manhã", afternoon: "Tarde", evening: "Noite" };

    const setState = (cls, html) => {
        submitBtn.classList.remove("btn--sending", "btn--success", "btn--error");
        if (cls) submitBtn.classList.add(cls);
        submitBtn.innerHTML = html;
    };

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = new FormData(contactForm);

        // Traduz o valor do rádio pra rótulo legível antes de mandar
        const rawTime = data.get("time");
        if (rawTime && timeLabels[rawTime]) data.set("time", timeLabels[rawTime]);

        // Formata a data como dd/mm/aaaa
        const rawDate = data.get("date");
        if (rawDate) {
            const formatted = new Date(`${rawDate}T00:00:00`).toLocaleDateString("pt-BR");
            data.set("date", formatted);
        }

        // Linha de assunto bonita no email
        data.set("_subject", `Nova aula experimental — ${data.get("name") || "(sem nome)"}`);

        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        setState("btn--sending", '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Enviando...');

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" },
            });

            if (!response.ok) throw new Error("submit-failed");

            setState("btn--success", '<i class="fa-solid fa-check" aria-hidden="true"></i> Mensagem enviada!');
            contactForm.reset();

            setTimeout(() => {
                setState(null, originalHTML);
                submitBtn.disabled = false;
            }, 4000);
        } catch (err) {
            setState("btn--error", '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Erro — tente de novo');

            setTimeout(() => {
                setState(null, originalHTML);
                submitBtn.disabled = false;
            }, 4000);
        }
    });
}

