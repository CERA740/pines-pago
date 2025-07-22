import React, { useState } from "react";
import jsPDF from "jspdf";

const productos = [
  { id: 1, nombre: "BONO COD SOCIO", precio: 14000 },
  { id: 2, nombre: "BONO COD NO SOCIO", precio: 21000 },
  { id: 3, nombre: "BONO CNP SOCIO", precio: 12000 },
  { id: 4, nombre: "BONO CNP NO SOCIO", precio: 18000 },
];

// Genera PIN de 16 caracteres alfanuméricos divididos en bloques de 4
function generarPIN() {
  const chars =
    "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789";
  let pin = "";
  for (let i = 0; i < 16; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin.match(/.{1,4}/g).join("-");
}

// Formato fecha y hora "YYYY-MM-DD HH:mm:ss"
function obtenerFechaHora() {
  const ahora = new Date();
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    ahora.getFullYear() +
    "-" +
    pad(ahora.getMonth() + 1) +
    "-" +
    pad(ahora.getDate()) +
    " " +
    pad(ahora.getHours()) +
    ":" +
    pad(ahora.getMinutes()) +
    ":" +
    pad(ahora.getSeconds())
  );
}

export default function App() {
  const [cantidades, setCantidades] = useState(
    productos.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );
  const [total, setTotal] = useState(0);
  const [estadoPago, setEstadoPago] = useState("inicio"); // 'inicio', 'esperandoConfirmacion', 'pagado'
  const [recibo, setRecibo] = useState(null);

  // Maneja cambio de cantidades
  const handleCantidadChange = (id, value) => {
    const cantidad = Math.min(100, Math.max(0, Number(value) || 0));
    const nuevasCantidades = { ...cantidades, [id]: cantidad };
    setCantidades(nuevasCantidades);
    // Recalcular total
    const nuevoTotal = productos.reduce(
      (sum, p) => sum + p.precio * (nuevasCantidades[p.id] || 0),
      0
    );
    setTotal(nuevoTotal);
  };

  // Simula ir al pago
  const iniciarPago = () => {
    if (total === 0) {
      alert("Debe seleccionar al menos un producto con cantidad mayor a 0");
      return;
    }
    setEstadoPago("esperandoConfirmacion");
  };

  // Simula confirmación del pago
  const confirmarPago = () => {
    // Por cada producto con cantidad > 0 generamos un PIN con fecha
    const fechaGeneracion = obtenerFechaHora();

    const detallesConPIN = productos
      .filter((p) => cantidades[p.id] > 0)
      .map((p) => ({
        pin: generarPIN(),
        producto: p.nombre,
        cantidad: cantidades[p.id],
        precio_unitario: p.precio,
        subtotal: p.precio * cantidades[p.id],
        fecha_generacion: fechaGeneracion,
      }));

    setRecibo({
      total,
      detalles: detallesConPIN,
    });
    setEstadoPago("pagado");
  };

  // Genera y descarga PDF con jsPDF
  const descargarPDF = () => {
    if (!recibo) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Recibo de compra", 14, 22);
    doc.setFontSize(12);
    doc.text(Total: $${recibo.total.toFixed(2)}, 14, 32);

    // Tabla con detalles + PIN + fecha
    let y = 42;
    doc.text("Producto", 14, y);
    doc.text("Cantidad", 70, y);
    doc.text("Precio Unit.", 100, y);
    doc.text("Subtotal", 135, y);
    doc.text("PIN", 170, y);
    doc.text("Fecha/Hora", 210, y);
    y += 6;

    recibo.detalles.forEach((item) => {
      doc.text(item.producto, 14, y);
      doc.text(item.cantidad.toString(), 70, y);
      doc.text($${item.precio_unitario.toFixed(2)}, 100, y);
      doc.text($${item.subtotal.toFixed(2)}, 135, y);
      doc.text(item.pin, 170, y);
      doc.text(item.fecha_generacion, 210, y);
      y += 6;
    });

    doc.save("recibo.pdf");
  };

  // Estilos simplificados (igual que el original)
  const estilos = {
    contenedor: {
      maxWidth: 600,
      margin: "auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#a80000",
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 8,
      boxShadow: "0 0 15px rgba(168, 0, 0, 0.3)",
    },
    titulo: {
      textAlign: "center",
      marginBottom: 20,
      fontWeight: "bold",
      fontSize: 28,
      color: "#a80000",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    tabla: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: 20,
    },
    th: {
      borderBottom: "2px solid #a80000",
      padding: 10,
      color: "#a80000",
      textAlign: "left",
      backgroundColor: "#feeaea",
      fontWeight: "600",
    },
    td: {
      borderBottom: "1px solid #ddd",
      padding: 10,
    },
    inputCantidad: {
      width: 60,
      padding: 6,
      borderRadius: 4,
      border: "1px solid #a80000",
      color: "#a80000",
      fontWeight: "600",
      textAlign: "center",
    },
    boton: {
      backgroundColor: "#a80000",
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      fontSize: 18,
      cursor: "pointer",
      borderRadius: 6,
      fontWeight: "bold",
      width: "100%",
      transition: "background-color 0.3s",
      marginTop: 10,
    },
  };

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Elige productos y cantidad</h2>

      {estadoPago === "inicio" && (
        <>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={estilos.th}>Producto/Servicio</th>
                <th style={estilos.th}>Precio unitario</th>
                <th style={estilos.th}>Cantidad (0-100)</th>
                <th style={estilos.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td style={estilos.td}>{p.nombre}</td>
                  <td style={estilos.td}>${p.precio.toFixed(2)}</td>
                  <td style={estilos.td}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cantidades[p.id] || 0}
                      onChange={(e) => handleCantidadChange(p.id, e.target.value)}
                      style={estilos.inputCantidad}
                    />
                  </td>
                  <td style={estilos.td}>
                    ${(p.precio * (cantidades[p.id] || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ color: "#a80000", fontWeight: "bold", textAlign: "right" }}>
            Total: ${total.toFixed(2)}
          </h3>

          <button style={estilos.boton} onClick={iniciarPago}>
            Pagar
          </button>
        </>
      )}

      {estadoPago === "esperandoConfirmacion" && (
        <>
          <h3 style={{ textAlign: "center", marginBottom: 20 }}>
            Pago en proceso... <br />
            <button style={estilos.boton} onClick={confirmarPago}>
              Confirmar Pago (Simulado)
            </button>
          </h3>
        </>
      )}

      {estadoPago === "pagado" && recibo && (
        <>
          <div style={{ ...estilos.contenedor, marginTop: 20 }}>
            <h3 style={estilos.titulo}>Recibo generado</h3>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Producto</th>
                  <th style={estilos.th}>Precio</th>
                  <th style={estilos.th}>Cantidad</th>
                  <th style={estilos.th}>Subtotal</th>
                  <th style={estilos.th}>PIN</th>
                  <th style={estilos.th}>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {recibo.detalles.map((item, i) => (
                  <tr key={i}>
                    <td style={estilos.td}>{item.producto}</td>
                    <td style={estilos.td}>${item.precio_unitario.toFixed(2)}</td>
                    <td style={estilos.td}>{item.cantidad}</td>
                    <td style={estilos.td}>${item.subtotal.toFixed(2)}</td>
                    <td style={estilos.td}>{item.pin}</td>
                    <td style={estilos.td}>{item.fecha_generacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={estilos.boton} onClick={descargarPDF}>
              Descargar Recibo PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
