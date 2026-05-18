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

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    // remove ativos
    tabs.forEach(t => t.classList.remove("active"));
    tables.forEach(t => t.classList.remove("active"));

    // ativa botão
    tab.classList.add("active");

    // ativa tabela correspondente
    const target = tab.dataset.tab;
    document.getElementById(target).classList.add("active");

    // volta a rolagem da tabela para o topo
    document.querySelector(".scheduleTables").scrollTop = 0;

  });
});


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

