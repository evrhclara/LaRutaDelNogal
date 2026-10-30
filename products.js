/**
 * products.js — FUENTE DE DATOS DEL MENÚ
 * ----------------------------------------------------------------
 * Este archivo es la "base de datos" del menú digital. Contiene
 * únicamente información de productos: nada de HTML ni de estilos.
 *
 * Origen: hoja de cálculo proporcionada por el cliente
 *         ("Hoja_de_cálculo_sin_título_-_Hoja_1.pdf").
 *
 * Campos por producto:
 *   id          -> identificador único y estable (usar en el futuro
 *                  para editar/eliminar un producto puntual)
 *   nombre      -> nombre del platillo/bebida
 *   descripcion -> descripción del producto
 *   categoria   -> nombre de la categoría a la que pertenece
 *   precio      -> número (MXN), sin símbolos
 *   imagen      -> URL de la imagen (columna "ID IMAGEN" de la hoja)
 *   disponible  -> true/false. Si es false, el producto se muestra
 *                  marcado como "No disponible" pero permanece en el menú
 *   destacado   -> true/false. Resalta el producto como especialidad
 *
 * ACTUALIZAR EL MENÚ:
 *   - Agregar un platillo nuevo  -> agregar un objeto nuevo al arreglo
 *   - Cambiar precio/descripción -> editar el campo correspondiente
 *   - Quitar un platillo del menú (sin borrar el registro) -> disponible: false
 *   - Nada de esto requiere tocar index.html ni styles.css.
 *
 * NOTA SOBRE LA CATEGORÍA:
 *   La hoja de cálculo original no incluye una columna "Categoría".
 *   Se agregó aquí porque el menú la necesita para organizarse
 *   (ver requisitos del proyecto). Es el único dato que no viene
 *   textualmente de la hoja; el resto de las columnas se respetó
 *   tal cual (Alimento, Descripción, Precio, ID IMAGEN).
 *
 * INTEGRACIÓN FUTURA CON UNA BASE DE DATOS REAL:
 *   Hoy este archivo expone el arreglo en `window.MENU_PRODUCTS`.
 *   El único lugar que lo lee es js/menu.js, en una sola función
 *   (ver `obtenerProductos()`). Para conectar una hoja de cálculo
 *   en vivo, una API o una base de datos real, basta con reemplazar
 *   esa función por una llamada fetch() que devuelva el mismo
 *   formato — no hay que tocar el resto del sitio.
 */

window.MENU_PRODUCTS = [
  {
    id: "hamburguesa",
    nombre: "Hamburguesa",
    descripcion: "Pan, carne de res, queso, lechuga, jitomate, cebolla y aderezos.",
    categoria: "Platos fuertes",
    precio: 180,
    imagen: "https://i.imgur.com/HBESCQy.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "mixiote",
    nombre: "Mixiote",
    descripcion: "Carne sazonada con adobo, envuelta y cocida al vapor, acompañada de guarnición.",
    categoria: "Platos fuertes",
    precio: 150,
    imagen: "https://i.imgur.com/dTZjXmN.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "carne-asada",
    nombre: "Carne asada",
    descripcion: "Carne de res asada, acompañada de guarnición.",
    categoria: "Platos fuertes",
    precio: 180,
    imagen: "https://i.imgur.com/IPFhFwg.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "chile-en-nogada",
    nombre: "Chile en nogada",
    descripcion: "Chile poblano relleno de picadillo, bañado en nogada de nuez y decorado con granada.",
    categoria: "Platos fuertes",
    precio: 380,
    imagen: "https://i.imgur.com/6mBBVfG.jpeg",
    disponible: true,
    destacado: true
  },
  {
    id: "pizza-tlami",
    nombre: "Pizza Tlami",
    descripcion: "Pizza artesanal con ingredientes de la casa.",
    categoria: "Platos fuertes",
    precio: 340,
    imagen: "https://i.imgur.com/oUL3bt5.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "pay-de-queso",
    nombre: "Pay de queso",
    descripcion: "Base de galleta y relleno cremoso de queso.",
    categoria: "Postres",
    precio: 40,
    imagen: "https://i.imgur.com/jF2FJFm.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "helado-de-nogada",
    nombre: "Helado de nogada",
    descripcion: "Helado con sabor a nogada, elaborado a base de nuez y notas dulces.",
    categoria: "Postres",
    precio: 40,
    imagen: "https://i.imgur.com/WW3JB1L.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "nuez",
    nombre: "Nuez",
    descripcion: "Nuez.",
    categoria: "Extras",
    precio: 2,
    imagen: "https://i.imgur.com/GKF8MlD.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "refresco",
    nombre: "Refresco",
    descripcion: "Bebida gaseosa.",
    categoria: "Bebidas",
    precio: 35,
    imagen: "https://i.imgur.com/Rf5xr49.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "agua-de-nuez",
    nombre: "Agua de nuez",
    descripcion: "Bebida preparada con nuez, agua y endulzante.",
    categoria: "Bebidas",
    precio: 40,
    imagen: "https://i.imgur.com/iVw4G9l.jpeg",
    disponible: true,
    destacado: false
  },
  {
    id: "cafe",
    nombre: "Café",
    descripcion: "Café preparado.",
    categoria: "Bebidas",
    precio: 20,
    imagen: "https://i.imgur.com/0IDwhH5.jpeg",
    disponible: true,
    destacado: false
  }
];

/**
 * Orden en que deben aparecer las categorías en la página.
 * Si en el futuro se agrega un producto con una categoría que no
 * está en esta lista, el menú la agrega automáticamente al final
 * (ver js/menu.js), así que no es obligatorio editar esto.
 */
window.MENU_CATEGORY_ORDER = ["Platos fuertes", "Postres", "Bebidas", "Extras"];
