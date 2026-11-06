(function () {
  "use strict";
  function cargarComponente(url, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    contenedor.setAttribute("aria-busy", "true");
    fetch(url)
      .then((respuesta) => { if (!respuesta.ok) throw new Error(url + " respondió " + respuesta.status); return respuesta.text(); })
      .then((html) => {
        contenedor.innerHTML = html;
        contenedor.removeAttribute("aria-busy");
        marcarPaginaActiva();
        configurarMenuMovil();
      })
      .catch((error) => {
        contenedor.removeAttribute("aria-busy");
        console.error("No se pudo cargar " + url + ":", error);
      });
  }
  function marcarPaginaActiva() {
    const pagina = document.body.getAttribute("data-page");
    if (!pagina) return;
    document.querySelectorAll(".nav-link[data-page]").forEach((enlace) => {
      enlace.classList.toggle("active", enlace.getAttribute("data-page") === pagina);
      if (enlace.getAttribute("data-page") === pagina) enlace.setAttribute("aria-current", "page");
      else enlace.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-page]").forEach((elemento) => {
      if (elemento.classList.contains("nav-link")) return;
      if (elemento.getAttribute("data-page") === pagina) elemento.setAttribute("aria-current", "page");
      else elemento.removeAttribute("aria-current");
    });
  }
  function configurarMenuMovil() {
    const boton = document.querySelector(".header-menu-button");
    const nav = document.querySelector(".header-nav");
    if (!boton || !nav || boton.dataset.ready) return;
    boton.dataset.ready = "true";

    function establecerMenu(abierto, devolverFoco = false) {
      boton.setAttribute("aria-expanded", String(abierto));
      nav.classList.toggle("is-open", abierto);
      const etiqueta = boton.querySelector(".sr-only");
      if (etiqueta) etiqueta.textContent = abierto ? "Cerrar menú" : "Abrir menú";
      document.body.classList.toggle("menu-abierto", abierto);
      if (!abierto && devolverFoco) boton.focus();
    }

    boton.addEventListener("click", () => {
      establecerMenu(boton.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (evento) => {
      if (evento.target.closest("a")) {
        establecerMenu(false);
      }
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
        establecerMenu(false, true);
      }
    });
    document.addEventListener("click", (evento) => {
      if (
        boton.getAttribute("aria-expanded") === "true" &&
        !nav.contains(evento.target) &&
        !boton.contains(evento.target)
      ) establecerMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) establecerMenu(false);
    });
  }
  ["header.css", "footer.css"].forEach((archivo) => {
    if (!document.querySelector('link[href*="' + archivo + '"]')) {
      const enlace = document.createElement("link");
      enlace.rel = "stylesheet";
      enlace.href = "CSS/" + archivo;
      document.head.appendChild(enlace);
    }
  });
  cargarComponente("header.html", "header");
  cargarComponente("footer.html", "footer");
})();