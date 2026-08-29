import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function HistorialPagosRepartidores() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchHistorialPagos();
  }, []);

  const fetchHistorialPagos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/historial-pagos`, {
        withCredentials: true,
      });
      setPagos(res.data || []);
    } catch (err) {
      Swal.fire(
        "Error",
        "No se pudo cargar el historial de pagos realizados",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setFechaInicio("");
    setFechaFin("");
  };

  // Lógica de Filtrado (Texto + Rango de Fechas)
  const filteredPagos = pagos.filter((item) => {
    // 1. Filtro por texto (Nombre, Apellido, Código Repartidor, Número de Referencia)
    const query = searchTerm.toLowerCase();
    const nombreCompleto = `${item.nombre || ""} ${item.apellido || ""}`.toLowerCase();
    const codigoRepartidor = (item.codigo_repartidor || "").toLowerCase();
    const numRef = (item.numero_referencia || "").toLowerCase();

    const matchesText =
      nombreCompleto.includes(query) ||
      codigoRepartidor.includes(query) ||
      numRef.includes(query);

    // 2. Filtro por Rango de Fechas
    let matchesDate = true;
    if (item.fecha_pago) {
      const fechaPagoStr = new Date(item.fecha_pago).toISOString().split("T")[0];

      if (fechaInicio && fechaPagoStr < fechaInicio) {
        matchesDate = false;
      }
      if (fechaFin && fechaPagoStr > fechaFin) {
        matchesDate = false;
      }
    }

    return matchesText && matchesDate;
  });

  // Exportar PDF con los registros filtrados
  const handleExportPDF = () => {
    if (filteredPagos.length === 0) {
      Swal.fire(
        "Atención",
        "No hay datos filtrados para exportar en el PDF",
        "warning"
      );
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Gazzella Express - Historial de Pagos Realizados", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Fecha de reporte: ${new Date().toLocaleDateString("es-VE")} ${new Date().toLocaleTimeString("es-VE")}`,
      14,
      22
    );

    const tableColumn = [
      "Código",
      "Conductor",
      "Referencia",
      "Fecha Pago",
      "Monto (USD)",
      "Tasa (Bs)",
      "Monto Pagado (Bs)",
    ];

    const tableRows = filteredPagos.map((p) => {
      const fechaFmt = p.fecha_pago
        ? new Date(p.fecha_pago).toLocaleString("es-VE", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "N/A";

      const tasa = Number(p.tasa_pago_bs || 0);
      const usd = Number(p.monto_usd || 0);
      const montoBsCalculado = tasa > 0 ? usd * tasa : Number(p.monto_bs_original || 0);

      return [
        p.codigo_repartidor || "N/A",
        `${p.nombre || ""} ${p.apellido || ""}`.trim(),
        p.numero_referencia || "N/A",
        fechaFmt,
        `$${usd.toFixed(2)}`,
        `${tasa.toFixed(2)} Bs`,
        `${montoBsCalculado.toFixed(2)} Bs.`,
      ];
    });

    autoTable(doc, {
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [22, 163, 74] }, // Verde para pagos completados
    });

    doc.save(`Historial_Pagos_Conductores_${Date.now()}.pdf`);
  };

  return (
    <div className="content-area">
      <div className="admin-table-container">
        {/* CABECERA Y BARRA DE BÚSQUEDA Y FILTROS */}
        <div
          style={{
            padding: "var(--spacing-lg)",
            borderBottom: "1px solid #eee",
            backgroundColor: "#fff",
          }}
        >
          {/* TÍTULO Y CONTADOR */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
              Historial de Pagos Realizados
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredPagos.length}</strong> de{" "}
              {pagos.length} pagos
            </span>
          </div>

          {/* CONTROLES DE FILTRADO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              alignItems: "end",
            }}
          >
            {/* Input Nombre / Código / Referencia */}
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "#555",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Buscar:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Nombre, código o referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Fecha Desde */}
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "#555",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Desde:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "#555",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Hasta:
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Botones de Acción */}
            <div style={{ display: "flex", gap: "8px" }}>
              {(searchTerm || fechaInicio || fechaFin) && (
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    color: "#555",
                    cursor: "pointer",
                  }}
                  title="Limpiar filtros"
                >
                  Limpiar
                </button>
              )}

              <button
                className="btn-secondary"
                onClick={handleExportPDF}
                disabled={filteredPagos.length === 0 || loading}
                style={{
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  cursor: filteredPagos.length === 0 ? "not-allowed" : "pointer",
                  opacity: filteredPagos.length === 0 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>

        {/* TABLA DE HISTORIAL DE PAGOS */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Código</th>
                <th style={{ textAlign: "center" }}>Conductor</th>
                <th style={{ textAlign: "center" }}>Referencia Pago</th>
                <th style={{ textAlign: "center" }}>Fecha y Hora</th>
                <th style={{ textAlign: "center" }}>Monto (USD)</th>
                <th style={{ textAlign: "center" }}>Tasa Aplicada</th>
                <th style={{ textAlign: "center" }}>Monto Pagado (Bs)</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#666",
                    }}
                  >
                    Cargando historial de pagos...
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p) => {
                  const tasa = Number(p.tasa_pago_bs || 0);
                  const usd = Number(p.monto_usd || 0);
                  const montoBsCalculado =
                    tasa > 0 ? usd * tasa : Number(p.monto_bs_original || 0);

                  const fechaFormateada = p.fecha_pago
                    ? new Date(p.fecha_pago).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "N/A";

                  return (
                    <tr key={p.liquidacion_id}>
                      {/* Código del Repartidor */}
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "var(--color-primary)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {p.codigo_repartidor || "N/A"}
                      </td>

                      {/* Nombre completo */}
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#222",
                        }}
                      >
                        {p.nombre} {p.apellido}
                      </td>

                      {/* Referencia */}
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "600",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {p.numero_referencia || "N/A"}
                      </td>

                      {/* Fecha de Pago */}
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {fechaFormateada}
                      </td>

                      {/* Monto USD */}
                      <td
                        style={{
                          textAlign: "center",
                          color: "#16a34a",
                          fontWeight: "bold",
                        }}
                      >
                        ${usd.toFixed(2)}
                      </td>

                      {/* Tasa de Pago */}
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {tasa > 0 ? `${tasa.toFixed(2)} Bs.` : "N/A"}
                      </td>

                      {/* Monto en Bolívares */}
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {montoBsCalculado.toFixed(2)} Bs.
                      </td>

                      {/* Pill Status: PAGADO */}
                      <td style={{ textAlign: "center", width: "1%" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            width: "90px",
                            display: "inline-block",
                            textAlign: "center",
                            textTransform: "uppercase",
                            border: "1px solid #bbf7d0",
                            backgroundColor: "#f0fdf4",
                            color: "#166534",
                          }}
                        >
                          PAGADO
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MENSAJE CUANDO NO HAY RESULTADOS */}
        {!loading && filteredPagos.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron pagos realizados con los criterios seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}

export default HistorialPagosRepartidores;