/**
 * carrito-storage.js — MÓDULO COMPARTIDO DEL CARRITO
 * ----------------------------------------------------------------
 * Única fuente de verdad para leer/escribir el carrito en localStorage.
 * Lo usan tanto js/menu.js (para agregar productos) como carrito.js
 * (para mostrarlos, cambiarles cantidad o quitarlos).
 *
 * Inclúyelo ANTES de menu.js y ANTES de carrito.js en el HTML:
 *   <script src="../js/carrito-storage.js"></script>
 *   <script src="js/menu.js"></script>
 *
 * FORMATO DE CADA PRODUCTO GUARDADO:
 *   {
 *     id: "chile-en-nogada",   // identificador único (string)
 *     nombre: "Chile en nogada",
 *     precio: 380,              // precio unitario (número)
 *     cantidad: 1,                // número
 *     unidad: "",                  // opcional: "kg", "pz"... ("" = sin unidad)
 *     imagen: "https://..."         // opcional: URL de la foto del producto
 *   }
 */

(function (global) {
  "use strict";

  const CART_KEY = "carritoRutaDelNogal";

  function obtener() {
    try {
      const datos = localStorage.getItem(CART_KEY);
      if (!datos) return [];
      const valor = JSON.parse(datos);
      if (!Array.isArray(valor)) throw new Error("Formato de carrito inválido");
      return valor
        .filter((p) => p && typeof p === "object" && typeof p.id === "string" && p.id.length > 0)
        .map((p) => ({
          id: p.id.slice(0, 100),
          nombre: typeof p.nombre === "string" ? p.nombre.slice(0, 200) : "",
          precio: Math.max(0, Number.isFinite(Number(p.precio)) ? Number(p.precio) : 0),
          cantidad: Math.max(1, Math.min(100, Math.floor(Number.isFinite(Number(p.cantidad)) ? Number(p.cantidad) : 1))),
          unidad: typeof p.unidad === "string" ? p.unidad.slice(0, 20) : "",
          imagen: typeof p.imagen === "string" ? p.imagen.slice(0, 1000) : "",
        }));
    } catch (error) {
      console.error("No se pudo leer el carrito de localStorage:", error);
      return [];
    }
  }

  function guardar(carrito) {
    try {
      if (!Array.isArray(carrito)) throw new Error("El carrito debe ser una lista");
      const seguro = carrito.filter((p) => p && typeof p.id === "string").map((p) => ({
        ...p,
        precio: Math.max(0, Number(p.precio) || 0),
        cantidad: Math.max(1, Math.min(100, Math.floor(Number(p.cantidad) || 1))),
      }));
      localStorage.setItem(CART_KEY, JSON.stringify(seguro));
      // Avisa a la propia pestaña (el evento "storage" nativo solo dispara
      // en OTRAS pestañas). Así, cualquier parte de la página que esté
      // escuchando "carrito:actualizado" puede refrescarse al instante.
      global.dispatchEvent(new CustomEvent("carrito:actualizado", { detail: carrito }));
    } catch (error) {
      console.error("No se pudo guardar el carrito en localStorage:", error);
    }
  }

  /**
   * Agrega un producto al carrito. Si ya existe (mismo id), suma la
   * cantidad en vez de duplicar la fila.
   * producto: { id, nombre, precio, unidad, imagen }
   */
  function agregar(producto, cantidad) {
    if (!producto || !producto.id) {
      console.error("agregar() necesita un producto con id.");
      return obtener();
    }

    cantidad = Number(cantidad) || 1;

    const carrito = obtener();
    const existente = carrito.find((p) => p.id === producto.id);

    if (existente) {
      existente.cantidad = Number(existente.cantidad || 0) + cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre || "",
        precio: Number(producto.precio) || 0,
        cantidad: cantidad,
        unidad: producto.unidad || "",
        imagen: producto.imagen || "",
      });
    }

    guardar(carrito);
    return carrito;
  }

  function cambiarCantidad(id, delta) {
    const carrito = obtener();
    const producto = carrito.find((p) => p.id === id);
    if (!producto) return carrito;

    producto.cantidad = Math.max(1, Number(producto.cantidad || 0) + delta);
    guardar(carrito);
    return carrito;
  }

  function quitar(id) {
    const carrito = obtener().filter((p) => p.id !== id);
    guardar(carrito);
    return carrito;
  }

  function vaciar() {
    guardar([]);
  }

  /** Total de artículos (suma de cantidades), para mostrar en un badge. */
  function contarArticulos() {
    return obtener().reduce((total, p) => total + Number(p.cantidad || 0), 0);
  }

  function calcularTotales(carrito) {
    carrito = carrito || obtener();
    const subtotal = carrito.reduce(
      (suma, p) => suma + Number(p.precio || 0) * Number(p.cantidad || 0),
      0
    );
    const descuentos = 0;
    const total = subtotal - descuentos;
    return { subtotal, descuentos, total };
  }

  global.CarritoStorage = {
    CART_KEY,
    obtener,
    guardar,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    contarArticulos,
    calcularTotales,
  };
})(window);
