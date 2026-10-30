/**
 * menu.js — LÓGICA DE CONEXIÓN Y RENDERIZADO
 * ----------------------------------------------------------------
 * Este archivo lee los productos desde la fuente de datos y construye
 * el HTML del menú dinámicamente. No contiene texto de productos
 * "hardcodeado": todo nombre, precio, descripción e imagen que se ve
 * en la página proviene de data/products.js.
 *
 * Si en el futuro los productos se sirven desde una hoja de cálculo
 * en vivo, una API o una base de datos, solo hay que reemplazar la
 * función obtenerProductos() de abajo por un fetch() que devuelva el
 * mismo formato de arreglo. El resto del archivo no necesita cambios.
 */

(function () {
  "use strict";

  // Módulo compartido del carrito (js/carrito-storage.js debe cargarse
  // ANTES que este archivo). Si no está presente, los botones de
  // "Agregar al carrito" simplemente no se muestran, para no romper
  // el menú si alguien lo abre sin esa dependencia.
  const carritoStorage = window.CarritoStorage || null;

  /**
   * Punto único de acceso a los datos.
   * Hoy lee un arreglo local (data/products.js).
   * Mañana puede ser: `return fetch('/api/productos').then(r => r.json());`
   */
  function obtenerProductos() {
    return Promise.resolve(window.MENU_PRODUCTS || []);
  }

  function obtenerOrdenCategorias() {
    return window.MENU_CATEGORY_ORDER || [];
  }

  function formatearPrecio(precio) {
    return "$" + Number(precio).toLocaleString("es-MX");
  }

  function agruparPorCategoria(productos, ordenPreferido) {
    const grupos = new Map();

    productos.forEach((producto) => {
      const categoria = producto.categoria || "Otros";
      if (!grupos.has(categoria)) {
        grupos.set(categoria, []);
      }
      grupos.get(categoria).push(producto);
    });

    // Categorías en el orden preferido primero, luego cualquier
    // categoría nueva que no estuviera contemplada, en el orden
    // en que apareció en los datos.
    const categoriasOrdenadas = [
      ...ordenPreferido.filter((c) => grupos.has(c)),
      ...[...grupos.keys()].filter((c) => !ordenPreferido.includes(c)),
    ];

    return categoriasOrdenadas.map((categoria) => ({
      categoria,
      productos: grupos.get(categoria),
    }));
  }

  function idParaCategoria(categoria) {
    return (
      "cat-" +
      categoria
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  }

  function crearTarjetaProducto(producto) {
    const articulo = document.createElement("article");
    articulo.className = "product-card";
    if (producto.disponible === false) {
      articulo.classList.add("product-card--unavailable");
    }

    const figura = document.createElement("div");
    figura.className = "product-card__media";

    if (producto.imagen) {
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre || "";
      img.loading = "lazy";
      figura.appendChild(img);
    }

    if (producto.destacado) {
      const insignia = document.createElement("span");
      insignia.className = "badge badge--destacado";
      insignia.textContent = "Especialidad";
      figura.appendChild(insignia);
    }

    if (producto.disponible === false) {
      const insignia = document.createElement("span");
      insignia.className = "badge badge--agotado";
      insignia.textContent = "No disponible";
      figura.appendChild(insignia);
    }

    const cuerpo = document.createElement("div");
    cuerpo.className = "product-card__body";

    const encabezado = document.createElement("div");
    encabezado.className = "product-card__heading";

    const nombre = document.createElement("h3");
    nombre.className = "product-card__name";
    nombre.textContent = producto.nombre || "";

    const precio = document.createElement("span");
    precio.className = "product-card__price";
    precio.textContent = formatearPrecio(producto.precio);

    encabezado.appendChild(nombre);
    encabezado.appendChild(precio);

    const descripcion = document.createElement("p");
    descripcion.className = "product-card__description";
    descripcion.textContent = producto.descripcion || "";

    cuerpo.appendChild(encabezado);
    cuerpo.appendChild(descripcion);

    const boton = crearBotonAgregar(producto);
    if (boton) cuerpo.appendChild(boton);

    articulo.appendChild(figura);
    articulo.appendChild(cuerpo);

    return articulo;
  }

  /* ---------- Botón "Agregar al carrito" ---------- */

  /**
   * Crea el botón de agregar al carrito para un producto, o null si el
   * módulo del carrito no está cargado o el producto no está disponible.
   */
  function crearBotonAgregar(producto) {
    if (!carritoStorage) return null;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn-agregar";

    if (producto.disponible === false) {
      boton.textContent = "No disponible";
      boton.disabled = true;
      return boton;
    }

    const textoOriginal = "Agregar al carrito";
    boton.textContent = textoOriginal;

    boton.addEventListener("click", () => {
      carritoStorage.agregar(
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          unidad: "",
        },
        1
      );

      actualizarContadorCarrito();

      // Retroalimentación visual breve, sin alert() ni salir de la página.
      boton.textContent = "Agregado ✓";
      boton.classList.add("btn-agregar--confirmado");
      boton.disabled = true;

      window.setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.classList.remove("btn-agregar--confirmado");
        boton.disabled = false;
      }, 1200);
    });

    return boton;
  }

  function crearSeccionCategoria(grupo) {
    const seccion = document.createElement("section");
    seccion.className = "menu-section";
    seccion.id = idParaCategoria(grupo.categoria);

    const encabezado = document.createElement("div");
    encabezado.className = "menu-section__heading";

    const titulo = document.createElement("h2");
    titulo.textContent = grupo.categoria;

    const contador = document.createElement("span");
    contador.className = "menu-section__count";
    const cantidad = grupo.productos.length;
    contador.textContent = cantidad + (cantidad === 1 ? " platillo" : " platillos");

    encabezado.appendChild(titulo);
    encabezado.appendChild(contador);

    const grid = document.createElement("div");
    grid.className = "product-grid";

    grupo.productos.forEach((producto) => {
      grid.appendChild(crearTarjetaProducto(producto));
    });

    seccion.appendChild(encabezado);
    seccion.appendChild(grid);

    return seccion;
  }

  function crearNavegacion(grupos) {
    const nav = document.getElementById("category-nav");
    if (!nav) return;

    nav.innerHTML = "";

    grupos.forEach((grupo) => {
      const enlace = document.createElement("a");
      enlace.href = "#" + idParaCategoria(grupo.categoria);
      enlace.className = "category-nav__link";
      enlace.textContent = grupo.categoria;
      nav.appendChild(enlace);
    });
  }

  function mostrarError(contenedor) {
    contenedor.innerHTML =
      '<p class="menu-error">No se pudo cargar el menú en este momento. ' +
      "Verifica el archivo de datos e intenta de nuevo.</p>";
  }

  /* ---------- Franja de destacados ---------- */

  function crearTarjetaDestacada(producto) {
    const contenedor = document.createElement("div");
    contenedor.className = "featured-card";

    const enlace = document.createElement("a");
    enlace.className = "featured-card__link";
    enlace.href = "#" + idParaCategoria(producto.categoria || "");

    const media = document.createElement("div");
    media.className = "featured-card__media";
    if (producto.imagen) {
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre || "";
      img.loading = "lazy";
      media.appendChild(img);
    }

    const overlay = document.createElement("div");
    overlay.className = "featured-card__overlay";

    const tag = document.createElement("span");
    tag.className = "featured-card__tag";
    tag.textContent = "Especialidad";

    const nombre = document.createElement("p");
    nombre.className = "featured-card__name";
    nombre.textContent = producto.nombre || "";

    const precio = document.createElement("span");
    precio.className = "featured-card__price";
    precio.textContent = formatearPrecio(producto.precio);

    overlay.appendChild(tag);
    overlay.appendChild(nombre);
    overlay.appendChild(precio);

    enlace.appendChild(media);
    enlace.appendChild(overlay);
    contenedor.appendChild(enlace);

    const boton = crearBotonAgregar(producto);
    if (boton) {
      boton.classList.add("btn-agregar--destacado");
      contenedor.appendChild(boton);
    }

    return contenedor;
  }

  function renderizarDestacados(productos) {
    const seccion = document.getElementById("destacados");
    const track = document.getElementById("featured-track");
    if (!seccion || !track) return;

    const destacados = productos.filter((p) => p.destacado && p.disponible !== false);

    if (destacados.length === 0) {
      seccion.hidden = true;
      return;
    }

    track.innerHTML = "";
    destacados.forEach((producto) => {
      track.appendChild(crearTarjetaDestacada(producto));
    });
    seccion.hidden = false;
  }

  /* ---------- Scroll-spy: resalta la categoría visible en el nav ---------- */

  function activarScrollSpy(grupos) {
    const enlaces = document.querySelectorAll(".category-nav__link");
    if (!("IntersectionObserver" in window) || enlaces.length === 0) return;

    const mapaEnlaces = new Map();
    enlaces.forEach((enlace) => {
      mapaEnlaces.set(enlace.getAttribute("href").slice(1), enlace);
    });

    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          const enlace = mapaEnlaces.get(entrada.target.id);
          if (!enlace) return;
          if (entrada.isIntersecting) {
            enlaces.forEach((e) => e.classList.remove("is-active"));
            enlace.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    grupos.forEach((grupo) => {
      const seccion = document.getElementById(idParaCategoria(grupo.categoria));
      if (seccion) observer.observe(seccion);
    });
  }

  /* ---------- Animación de aparición al hacer scroll ---------- */

  function activarAnimacionDeAparicion() {
    const tarjetas = document.querySelectorAll(".product-card");
    if (!("IntersectionObserver" in window) || tarjetas.length === 0) {
      tarjetas.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            obs.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    tarjetas.forEach((tarjeta) => observer.observe(tarjeta));
  }

  /* ---------- Contador flotante del carrito ---------- */

  /**
   * Actualiza el número en el ícono flotante del carrito. Se llama al
   * cargar la página y cada vez que se agrega un producto.
   */
  function actualizarContadorCarrito() {
    if (!carritoStorage) return;
    const contador = document.getElementById("cart-count");
    if (!contador) return;

    const total = carritoStorage.contarArticulos();
    contador.textContent = total;
    contador.hidden = total === 0;
  }

  function inicializarBotonCarrito() {
    if (!carritoStorage) return;
    const enlace = document.getElementById("cart-float-link");
    if (enlace) enlace.hidden = false;

    actualizarContadorCarrito();

    // Si el carrito cambia desde otra pestaña (o desde la propia página
    // del carrito), mantiene el número sincronizado sin recargar.
    window.addEventListener("storage", (evento) => {
      if (evento.key === carritoStorage.CART_KEY) actualizarContadorCarrito();
    });
    window.addEventListener("carrito:actualizado", actualizarContadorCarrito);
  }

  /* ---------- Barra de categorías con sombra al hacer scroll + botón arriba ---------- */

  function activarEfectosDeScroll() {
    const nav = document.getElementById("category-nav");
    const boton = document.getElementById("scroll-top");

    window.addEventListener(
      "scroll",
      () => {
        const desplazado = window.scrollY > 40;
        if (nav) nav.classList.toggle("is-scrolled", desplazado);

        if (boton) {
          const mostrar = window.scrollY > 480;
          boton.hidden = false;
          boton.classList.toggle("is-shown", mostrar);
        }
      },
      { passive: true }
    );

    if (boton) {
      boton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function iniciar() {
    const contenedor = document.getElementById("menu");
    if (!contenedor) return;

    obtenerProductos()
      .then((productos) => {
        if (!productos || productos.length === 0) {
          contenedor.innerHTML = '<p class="menu-empty">Aún no hay productos en el menú.</p>';
          return;
        }

        const grupos = agruparPorCategoria(productos, obtenerOrdenCategorias());

        crearNavegacion(grupos);
        renderizarDestacados(productos);

        contenedor.innerHTML = "";
        grupos.forEach((grupo) => {
          contenedor.appendChild(crearSeccionCategoria(grupo));
        });

        activarScrollSpy(grupos);
        activarAnimacionDeAparicion();
        activarEfectosDeScroll();
        inicializarBotonCarrito();
      })
      .catch(() => mostrarError(contenedor));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
