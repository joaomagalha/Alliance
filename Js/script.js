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

  });
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".scheduleTables").scrollTop = 0;
  });
});


const openBtn = document.getElementById("headerMenu");
const closeBtn = document.getElementById("closeBtn");
const mobileMenu = document.getElementById("mobileMenu");

openBtn.addEventListener("click", () => {
    mobileMenu.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
});

document.addEventListener("click", (event) => {

    const clickedOutside =
        !mobileMenu.contains(event.target) &&
        !openBtn.contains(event.target);

    if (clickedOutside) {
        mobileMenu.classList.remove("active");
    }

});

