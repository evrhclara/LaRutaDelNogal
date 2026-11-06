/**
 * carrito.js — RENDERIZADO DE LA PÁGINA DEL CARRITO
 * ----------------------------------------------------------------
 * Este archivo YA NO lee/escribe localStorage directamente: toda esa
 * lógica vive en js/carrito-storage.js (window.CarritoStorage), para
 * que el menú (menu.js) y esta página compartan exactamente el mismo
 * carrito. Este archivo solo se encarga de dibujar la tabla y el
 * resumen a partir de lo que devuelve CarritoStorage.
 *
 * IMPORTANTE: carrito-storage.js debe cargarse ANTES que este archivo
 * en el HTML:
 *   <script src="../js/carrito-storage.js"></script>
 *   <script src="carrito.js"></script>
 *
 * IMÁGENES DE PRODUCTOS (pendientes):
 *   Mientras no tengas las fotos, cada fila muestra un ícono como
 *   marcador de posición (ver crearImagenProducto() abajo). En cuanto
 *   tengas las imágenes, solo agrega la URL en el campo "imagen" de
 *   cada producto — no hace falta tocar este archivo para que se
 *   muestren.
 */

(function () {
  "use strict";

  const carritoStorage = window.CarritoStorage;

  if (!carritoStorage) {
    console.error(
      "carrito.js necesita js/carrito-storage.js cargado antes en el HTML."
    );
    return;
  }

  /* ---------- Utilidades ---------- */

  function formatearPrecio(valor) {
    return "$" + Number(valor || 0).toFixed(2);
  }

  function textoCantidad(producto) {
    return producto.unidad ? producto.cantidad + producto.unidad : String(producto.cantidad);
  }

  function calcularSubtotalProducto(producto) {
    return Number(producto.precio || 0) * Number(producto.cantidad || 0);
  }

  /* ---------- Construcción de una fila ---------- */

  function crearImagenProducto(producto) {
    const celda = document.createElement("div");
    celda.className = "cart-row__thumb";

    if (producto.imagen) {
      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre || "";
      img.loading = "lazy";
      img.width = 80;
      img.height = 80;
      celda.appendChild(img);
    } else {
      // COMENTARIO: aquí va la foto del producto cuando la tengas.
      // Por ahora se muestra un ícono genérico como marcador de posición.
      celda.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
        '<path fill="currentColor" d="M21 19H3V5h18v14zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>' +
        "</svg>";
    }

    return celda;
  }

  function crearFila(producto, onCambiar, onQuitar) {
    const fila = document.createElement("tr");
    fila.className = "cart-row";
    fila.dataset.id = producto.id;

    // # (índice visual, se recalcula al renderizar)
    const tdIndex = document.createElement("td");
    tdIndex.className = "cart-row__index";

    // Producto (imagen + nombre)
    const tdProducto = document.createElement("td");
    tdProducto.className = "col-product";
    const wrapProducto = document.createElement("div");
    wrapProducto.className = "cart-row__product";
    wrapProducto.appendChild(crearImagenProducto(producto));
    const nombre = document.createElement("span");
    nombre.className = "cart-row__name";
    nombre.textContent = producto.nombre || "";
    wrapProducto.appendChild(nombre);
    tdProducto.appendChild(wrapProducto);

    // Precio unitario
    const tdPrecio = document.createElement("td");
    tdPrecio.className = "col-price cart-row__price";
    tdPrecio.setAttribute("data-label", "Precio");
    tdPrecio.textContent = formatearPrecio(producto.precio);

    // Cantidad (stepper)
    const tdCantidad = document.createElement("td");
    tdCantidad.className = "col-qty";
    tdCantidad.setAttribute("data-label", "Cantidad");

    const stepper = document.createElement("div");
    stepper.className = "qty-control";

    const valor = document.createElement("span");
    valor.className = "qty-control__value";
    valor.textContent = textoCantidad(producto);

    const botones = document.createElement("div");
    botones.className = "qty-control__buttons";

    const btnMas = document.createElement("button");
    btnMas.type = "button";
    btnMas.setAttribute("aria-label", "Aumentar cantidad de " + producto.nombre);
    btnMas.textContent = "▲";
    btnMas.addEventListener("click", () => onCambiar(producto.id, 1));

    const btnMenos = document.createElement("button");
    btnMenos.type = "button";
    btnMenos.setAttribute("aria-label", "Disminuir cantidad de " + producto.nombre);
    btnMenos.textContent = "▼";
    btnMenos.addEventListener("click", () => onCambiar(producto.id, -1));

    botones.appendChild(btnMas);
    botones.appendChild(btnMenos);
    stepper.appendChild(valor);
    stepper.appendChild(botones);
    tdCantidad.appendChild(stepper);

    // Subtotal
    const tdSubtotal = document.createElement("td");
    tdSubtotal.className = "col-subtotal cart-row__subtotal";
    tdSubtotal.setAttribute("data-label", "Subtotal");
    tdSubtotal.textContent = formatearPrecio(calcularSubtotalProducto(producto));

    // Quitar
    const tdQuitar = document.createElement("td");
    tdQuitar.className = "col-remove";
    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "cart-row__remove";
    btnQuitar.setAttribute("aria-label", "Quitar " + producto.nombre + " del carrito");
    btnQuitar.innerHTML = "&times;";
    btnQuitar.addEventListener("click", () => onQuitar(producto.id));
    tdQuitar.appendChild(btnQuitar);

    fila.appendChild(tdIndex);
    fila.appendChild(tdProducto);
    fila.appendChild(tdPrecio);
    fila.appendChild(tdCantidad);
    fila.appendChild(tdSubtotal);
    fila.appendChild(tdQuitar);

    return fila;
  }

  /* ---------- Render principal ---------- */

  function actualizarResumen(carrito) {
    const { subtotal, descuentos, total } = carritoStorage.calcularTotales(carrito);
    document.getElementById("summary-subtotal").textContent = formatearPrecio(subtotal);
    document.getElementById("summary-discount").textContent = "-" + formatearPrecio(descuentos);
    document.getElementById("summary-total").textContent = formatearPrecio(total);

    const btnFinalizar = document.getElementById("checkout-btn");
    if (btnFinalizar) {
      btnFinalizar.setAttribute("aria-disabled", carrito.length === 0 ? "true" : "false");
      btnFinalizar.disabled = carrito.length === 0;
    }
  }

  function renderizarCarrito() {
    const carrito = carritoStorage.obtener();
    const tbody = document.getElementById("cart-items");
    const tabla = document.getElementById("cart-table");
    const vacio = document.getElementById("cart-empty");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (carrito.length === 0) {
      if (tabla) tabla.hidden = true;
      if (vacio) vacio.hidden = false;
      actualizarResumen(carrito);
      return;
    }

    if (tabla) tabla.hidden = false;
    if (vacio) vacio.hidden = true;

    carrito.forEach((producto) => {
      const fila = crearFila(producto, cambiarCantidad, quitarProducto);
      tbody.appendChild(fila);
    });

    // Numerar filas visualmente (1, 2, 3...)
    tbody.querySelectorAll(".cart-row__index").forEach((celda, i) => {
      celda.textContent = i + 1;
    });

    actualizarResumen(carrito);
  }

  /* ---------- Acciones ---------- */

  function cambiarCantidad(id, delta) {
    carritoStorage.cambiarCantidad(id, delta);
    renderizarCarrito();
  }

  function quitarProducto(id) {
    carritoStorage.quitar(id);
    renderizarCarrito();
  }

  /* ---------- Mantener sincronizado ---------- */

  // "storage" dispara cuando OTRA pestaña/página cambia el carrito.
  window.addEventListener("storage", (evento) => {
    if (evento.key === carritoStorage.CART_KEY) {
      renderizarCarrito();
    }
  });

  // "carrito:actualizado" dispara cuando ESTA misma página lo cambia
  // (ver carrito-storage.js -> guardar()).
  window.addEventListener("carrito:actualizado", renderizarCarrito);

  document.addEventListener("DOMContentLoaded", renderizarCarrito);
  document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("checkout-btn");
    if (!boton) return;
    boton.addEventListener("click", () => {
      const carrito = carritoStorage.obtener();
      if (boton.disabled || carrito.length === 0) return;
      boton.disabled = true;
      const listado = carrito.map((p) =>
        "- " + p.nombre + " x" + p.cantidad + ": $" + Number(p.precio * p.cantidad).toFixed(2)
      ).join("\n");
      const mensaje = encodeURIComponent("Hola, quiero finalizar mi pedido:\n" + listado);
      window.open("https://wa.me/5212221275222?text=" + mensaje, "_blank", "noopener,noreferrer");
      window.setTimeout(() => { renderizarCarrito(); }, 600);
    });
  });
})();
