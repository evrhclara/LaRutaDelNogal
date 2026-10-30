(function () {
  "use strict";

  /**
   * Carga un fragmento HTML (como header.html o footer.html)
   * y lo inyecta dentro del contenedor especificado por su id.
   */
  function cargarComponente(url, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    fetch(url)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(url + " respondió " + respuesta.status);
        }
        return respuesta.text();
      })
      .then((html) => {
        contenedor.innerHTML = html;
        marcarPaginaActiva();
      })
      .catch((error) => {
        console.error("No se pudo cargar " + url + ":", error);
      });
  }

  /**
   * Resalta en el menú de navegación el enlace correspondiente a la página actual,
   * comparando el atributo data-page de cada enlace con <body data-page="...">.
   */
  function marcarPaginaActiva() {
    const pagina = document.body.getAttribute("data-page");
    if (!pagina) return;

    document.querySelectorAll(".nav-link[data-page]").forEach((enlace) => {
      enlace.classList.toggle("active", enlace.getAttribute("data-page") === pagina);
    });
  }

  // Carga de componentes mediante rutas relativas
  cargarComponente("header.html", "header");
  cargarComponente("footer.html", "footer");
})();