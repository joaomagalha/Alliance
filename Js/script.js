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
  if (document.documentElement.classList.contains("skip-preloader")) {
    // Veio da setinha "voltar" — remove direto, sem animação nem scroll lock
    preloader.remove();
  } else {
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
}

/* ============================================================
   Flashlight effect — atualiza CSS custom properties --mouse-x e
   --mouse-y nos cards quando o mouse passa, alimentando o radial
   gradient que segue o cursor.
   ============================================================ */
const flashlightCards = document.querySelectorAll(
  ".pricingCard, .classCard, .benefitCard, .testimonialCard, .faqSectionCard, .professor-card, .differentialCard"
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

  // Itens do hero entram por escalonamento (delay-1..5) assim que a página carrega.
  // Sem isso, os que ficam no rodapé do hero (como as estatísticas) esperam o scroll,
  // pois o observer ignora os 10% de baixo da tela.
  document.querySelectorAll(".heroSection .animate-on-scroll").forEach((el) => {
    el.classList.add("animate");
    io.unobserve(el);
  });
}


/* FAQ: acordeão com abertura e fechamento suaves (Web Animations API sobre o <details> nativo).
   Um aberto por vez; o que fecha anima junto com o que abre. Sem JS, o <details> segue funcionando. */
(() => {
  const cards = [...document.querySelectorAll(".faqSectionCard")];
  if (!cards.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const anims = new Map();

  const parts = (card) => ({
    box: card.querySelector(".faqContent"),
    text: card.querySelector(".faqContent > *"),
  });

  const stop = (card) => {
    const a = anims.get(card);
    if (a) { a.forEach((x) => x.cancel()); anims.delete(card); }
  };

  const open = (card) => {
    const { box, text } = parts(card);
    // fechado de verdade parte de 0; se estava no meio do fechamento, continua do ponto atual
    const from = card.classList.contains("is-closing") ? box.getBoundingClientRect().height : 0;
    stop(card);
    card.classList.remove("is-closing");
    card.open = true;
    if (reduce.matches) return;
    const to = box.scrollHeight;
    const a = [
      box.animate([{ height: from + "px" }, { height: to + "px" }], { duration: 420, easing: EASE }),
      text.animate([{ opacity: 0, transform: "translateY(-0.6rem)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: EASE }),
    ];
    anims.set(card, a);
    a[0].onfinish = () => anims.delete(card);
  };

  const close = (card) => {
    const { box, text } = parts(card);
    const from = box.getBoundingClientRect().height;
    stop(card);
    if (reduce.matches) { card.open = false; return; }
    card.classList.add("is-closing"); // o visual de "fechado" (ícone, borda) começa junto com a animação
    const a = [
      box.animate([{ height: from + "px" }, { height: "0px" }], { duration: 360, easing: EASE, fill: "forwards" }),
      text.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: "ease-out", fill: "forwards" }),
    ];
    anims.set(card, a);
    a[0].onfinish = () => {
      card.open = false;
      card.classList.remove("is-closing");
      a.forEach((x) => x.cancel());
      anims.delete(card);
    };
  };

  cards.forEach((card) => {
    card.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      const opening = !card.open || card.classList.contains("is-closing");
      if (opening) {
        cards.forEach((other) => { if (other !== card && other.open && !other.classList.contains("is-closing")) close(other); });
        open(card);
      } else {
        close(card);
      }
    });
  });
})();

/* ============================================================
   Tablist genérico — usado nas abas da Grade de Horários e nas
   de categoria dos Planos. Cada tab aponta pro painel via
   aria-controls. Segue o padrão ARIA APG (ativação automática,
   navegação por seta/Home/End, roving tabindex).
   ============================================================ */
function initTablist(tablist, opts = {}) {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const activate = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.toggle("active", on);
        panel.toggleAttribute("hidden", !on);
      }
    });
    if (opts.onActivate) {
      const active = document.getElementById(tab.getAttribute("aria-controls"));
      if (active) opts.onActivate(active);
    }
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));

  tablist.addEventListener("keydown", (e) => {
    const idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    activate(tabs[next]);
    tabs[next].focus();
  });
}

const scheduleTablist = document.querySelector(".scheduleSectionDays");
if (scheduleTablist) {
  initTablist(scheduleTablist, {
    // Reinicia o scroll e replica o efeito de revelação em cascata das
    // linhas a cada troca de dia (mesmo efeito das abas dos Planos).
    onActivate: (panel) => {
      panel.scrollTop = 0;
      panel.classList.remove("replay");
      void panel.offsetWidth; // força reflow pra reiniciar a animação CSS
      panel.classList.add("replay");
    },
  });
}

const pricingTablist = document.querySelector(".pricingCategories");
if (pricingTablist) {
  initTablist(pricingTablist, {
    // Reinicia o efeito de revelação dos cards a cada troca de categoria.
    onActivate: (panel) => {
      const list = panel.querySelector(".animate-on-scroll-list");
      if (!list) return;
      list.classList.remove("animate");
      void list.offsetWidth; // força reflow pra reiniciar a animação CSS
      list.classList.add("animate");
    },
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
   Back arrow das páginas internas — se o usuário veio do próprio
   site, usa history.back() pra restaurar a posição do scroll
   (browser cuida disso). Fallback pra navegação normal (index.html)
   quando referrer for externo ou inexistente.
   ============================================================ */
const headerPageMenu = document.getElementById("headerPageMenu");
if (headerPageMenu) {
    headerPageMenu.addEventListener("click", (e) => {
        try {
            const ref = document.referrer;
            if (ref && new URL(ref).origin === location.origin && window.history.length > 1) {
                e.preventDefault();
                sessionStorage.setItem("alliance:skip-preloader", "1");
                history.back();
            }
        } catch {
            /* referrer inválido — segue navegação normal */
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
   Agendamento da aula (formulário por etapas)
   Aula → Dia → Dados → Revisão. Ao confirmar, abre o WhatsApp da Alliance
   com a mensagem montada. Sem JS, o formulário aparece inteiro (sem etapas).
   ============================================================ */
(() => {
    const form = document.querySelector(".contactForm");
    if (!form) return;
    const card = form.closest(".contactCard");
    const steps = [...form.querySelectorAll(".formStep")];
    const segs = [...card.querySelectorAll(".stepBar i")];
    const count = card.querySelector(".stepCount strong");
    const btnBack = form.querySelector(".stepNav .stepBack");
    const btnNext = form.querySelector(".stepNext");
    const btnSubmit = form.querySelector(".stepSubmit");
    const success = card.querySelector(".formSuccess");
    const again = card.querySelector(".successAgain");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const labels = {
        tipo: { introdutoria: "Aula introdutória", experimental: "Aula experimental" },
        quem: { mim: "Para mim", filho: "Para meu filho ou filha" },
        time: { morning: "Manhã", afternoon: "Tarde", evening: "Noite" },
    };
    let current = 0;

    form.classList.add("is-stepped");

    // data mínima = hoje (fuso local)
    const dateInput = form.querySelector("#date");
    const today = new Date();
    const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    dateInput.min = iso;

    // máscara do WhatsApp: (65) 99999-9999
    const phone = form.querySelector("#phone");
    phone.addEventListener("input", () => {
        const d = phone.value.replace(/\D/g, "").slice(0, 11);
        let out = d;
        if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
        if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        phone.value = out;
    });

    // "para meu filho ou filha": rótulo de responsável + campo da criança
    const nameLabel = form.querySelector('label[for="name"]');
    const childField = form.querySelector(".childField");
    form.querySelectorAll('input[name="quem"]').forEach((r) => r.addEventListener("change", () => {
        const filho = form.quem.value === "filho";
        nameLabel.textContent = filho ? nameLabel.dataset.labelFilho : nameLabel.dataset.labelMim;
        childField.hidden = !filho;
    }));

    const showError = (id, show, field) => {
        const el = form.querySelector("#" + id);
        if (el) el.hidden = !show;
        if (field) field.setAttribute("aria-invalid", show ? "true" : "false");
        return !show;
    };

    const validate = (n) => {
        let ok = true;
        if (n === 0) {
            ok = showError("err-tipo", !form.tipo.value) && ok;
            ok = showError("err-quem", !form.quem.value) && ok;
        }
        if (n === 1) {
            ok = showError("err-date", !dateInput.value || dateInput.value < iso, dateInput) && ok;
            ok = showError("err-time", !form.time.value) && ok;
        }
        if (n === 2) {
            const name = form.querySelector("#name");
            const email = form.querySelector("#email");
            ok = showError("err-name", !name.value.trim(), name) && ok;
            ok = showError("err-phone", phone.value.replace(/\D/g, "").length < 10, phone) && ok;
            const emailOk = showError("err-email", !!email.value.trim() && !email.checkValidity(), email);
            if (!emailOk) form.querySelector(".moreFields").open = true; // erro no e-mail: abre o bloco para mostrar
            ok = emailOk && ok;
        }
        if (!ok) {
            const first = steps[n].querySelector('[aria-invalid="true"], input:not([type="hidden"])');
            const firstErr = steps[n].querySelector(".fieldError:not([hidden])");
            (steps[n].querySelector('[aria-invalid="true"]') || firstErr?.previousElementSibling?.querySelector("input") || first)?.focus?.();
        }
        return ok;
    };

    const data = () => {
        const f = new FormData(form);
        const get = (k) => (f.get(k) || "").toString().trim();
        const date = get("date");
        return {
            tipo: labels.tipo[get("tipo")] || "",
            tipoKey: get("tipo"),
            quem: labels.quem[get("quem")] || "",
            quemKey: get("quem"),
            name: get("name"),
            child: get("child"),
            phone: get("phone"),
            email: get("email"),
            date: date ? new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) : "",
            dateShort: date ? new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR") : "",
            time: labels.time[get("time")] || "",
            message: get("message"),
        };
    };

    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // resumo do que já foi escolhido, no topo da etapa de dados
    const buildSummary = () => {
        const d = data();
        const dia = d.date.split(",")[0];
        card.querySelector(".summaryText").textContent = `${d.tipo} · ${dia.slice(0, 3)}, ${d.dateShort.slice(0, 5)} · ${d.time}`;
    };

    const message = () => {
        const d = data();
        const lines = [
            `Olá! Gostaria de agendar minha ${d.tipo.toLowerCase()}.`,
            "",
            `*Para quem:* ${d.quem}`,
            `*${d.quemKey === "filho" ? "Responsável" : "Nome"}:* ${d.name}`,
        ];
        if (d.quemKey === "filho" && d.child) lines.push(`*Criança:* ${d.child}`);
        lines.push(`*WhatsApp:* ${d.phone}`);
        if (d.email) lines.push(`*Email:* ${d.email}`);
        lines.push(`*Data:* ${d.dateShort}`, `*Período:* ${d.time}`);
        if (d.message) lines.push("", `*Observação:* ${d.message}`);
        return `https://wa.me/${ALLIANCE_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
    };

    const render = (n, dir = 1) => {
        const prev = steps[current];
        const next = steps[n];
        if (n === steps.length - 1) buildSummary();
        const startH = form.offsetHeight;
        steps.forEach((s, i) => s.classList.toggle("is-active", i === n));
        segs.forEach((g, i) => g.classList.toggle("is-on", i <= n));
        count.textContent = n + 1;
        btnBack.hidden = n === 0;
        btnNext.hidden = n === steps.length - 1;
        btnSubmit.hidden = n !== steps.length - 1;
        if (!reduce.matches && prev !== next) {
            const endH = form.offsetHeight;
            form.animate([{ height: startH + "px" }, { height: endH + "px" }], { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
            next.animate([{ opacity: 0, transform: `translateX(${dir * 2.4}rem)` }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        }
        current = n;
        next.querySelector(".stepTitle").focus({ preventScroll: true });
    };

    btnNext.addEventListener("click", () => { if (validate(current)) render(current + 1, 1); });
    btnBack.addEventListener("click", () => render(current - 1, -1));
    form.addEventListener("click", (e) => {
        if (e.target.closest(".summaryEdit")) render(0, -1);
    });
    // Enter avança (menos na observação, onde quebra linha)
    form.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
        e.preventDefault();
        if (current < steps.length - 1) btnNext.click(); else form.requestSubmit(btnSubmit);
    });
    // limpar o erro assim que a pessoa corrige
    form.addEventListener("change", () => validateSoft());
    form.addEventListener("input", () => validateSoft());
    const validateSoft = () => {
        form.querySelectorAll(".fieldError:not([hidden])").forEach((err) => {
            const id = err.id;
            const fixed =
                (id === "err-tipo" && form.tipo.value) || (id === "err-quem" && form.quem.value) ||
                (id === "err-time" && form.time.value) || (id === "err-date" && dateInput.value >= iso) ||
                (id === "err-name" && form.querySelector("#name").value.trim()) ||
                (id === "err-phone" && phone.value.replace(/\D/g, "").length >= 10) ||
                (id === "err-email" && (!form.querySelector("#email").value.trim() || form.querySelector("#email").checkValidity()));
            if (fixed) { err.hidden = true; err.closest(".formStep").querySelector('[aria-describedby="' + id + '"]')?.setAttribute("aria-invalid", "false"); }
        });
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        for (let n = 0; n < steps.length; n++) { if (!validate(n)) { render(n, -1); validate(n); return; } }
        const url = message();
        window.open(url, "_blank", "noopener,noreferrer");
        again.href = url;
        form.hidden = true;
        card.querySelector(".stepHead").hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
    });

    card.querySelector(".successReset").addEventListener("click", () => {
        form.reset();
        childField.hidden = true;
        nameLabel.textContent = nameLabel.dataset.labelMim;
        success.hidden = true;
        form.hidden = false;
        card.querySelector(".stepHead").hidden = false;
        form.querySelector(".moreFields").open = false;
        current = 0;
        render(0, -1);
    });

    render(0);
    // não roubar o foco ao carregar a página
    steps[0].querySelector(".stepTitle").blur();
})();



/* ==========================================================
   Navbar: transparente no topo, vidro fosco ao rolar
   ========================================================== */
(() => {
    const header = document.querySelector(".header");
    if (!header) return;
    let ticking = false;
    const update = () => {
        header.classList.toggle("isScrolled", window.scrollY > 24);
        ticking = false;
    };
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
})();


/* ==========================================================
   Estatísticas: contagem de 0 até o valor, uma vez, ao aparecer
   ========================================================== */
(() => {
    const card = document.getElementById("statsBand");
    if (!card) return;
    const nums = card.querySelectorAll("[data-count]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return; // valor final já está no HTML
    nums.forEach((n) => { n.textContent = "0"; });
    const run = () => {
        const dur = 1100;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            nums.forEach((n) => { n.textContent = String(Math.round(Number(n.dataset.count) * e)); });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); run(); }
    }, { threshold: 0.4 });
    io.observe(card);
})();
