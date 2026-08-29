import React, { useState, useEffect, useMemo } from "react";
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
      setPagos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msgError =
        err.response?.data?.message ||
        "No se pudo cargar el historial de pagos realizados";
      Swal.fire("Error", msgError, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFechaInicio("");
    setFechaFin("");
  };

  const getLocalDateString = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredPagos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return pagos.filter((item) => {
      const nombreCompleto = (item.nombre || "").toLowerCase();
      const codigoRepartidor = (item.codigo_repartidor || "").toLowerCase();
      const numRef = (item.numero_referencia || "").toLowerCase();

      const matchesText =
        !query ||
        nombreCompleto.includes(query) ||
        codigoRepartidor.includes(query) ||
        numRef.includes(query);

      let matchesDate = true;
      if (item.fecha_pago) {
        const fechaPagoStr = getLocalDateString(item.fecha_pago);
        if (fechaInicio && fechaPagoStr < fechaInicio) matchesDate = false;
        if (fechaFin && fechaPagoStr > fechaFin) matchesDate = false;
      }

      return matchesText && matchesDate;
    });
  }, [pagos, searchTerm, fechaInicio, fechaFin]);

  const handleExportPDF = () => {
    if (filteredPagos.length === 0) {
      Swal.fire("Atención", "No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Gazzella Express - Resumen de Pagos por Referencia", 14, 15);
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
      "Servicios",
      "Fecha Pago",
      "Monto (USD)",
      "Tasa (Bs)",
      "Monto Pagado (Bs)",
    ];

    const tableRows = filteredPagos.map((p) => {
      const fechaObj = p.fecha_pago ? new Date(p.fecha_pago) : null;
      const fechaFmt =
        fechaObj && !isNaN(fechaObj.getTime())
          ? fechaObj.toLocaleString("es-VE", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "N/A";

      const tasa = Number(p.tasa_pago_bs || 0);
      const usd = Number(p.monto_usd || 0);
      const montoBsCalculado =
        tasa > 0 ? usd * tasa : Number(p.monto_bs_original || 0);

      return [
        p.codigo_repartidor || "N/A",
        p.nombre || "N/A",
        p.numero_referencia || "N/A",
        p.total_servicios || 1,
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
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`Resumen_Pagos_Conductores_${Date.now()}.pdf`);
  };

  return (
    <div className="content-area">
      <div className="admin-table-container">
        <div
          style={{
            padding: "var(--spacing-lg, 16px)",
            borderBottom: "1px solid #eee",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "var(--color-primary, #000)", margin: 0 }}>
              Historial de Pagos Realizados
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredPagos.length}</strong> de{" "}
              {pagos.length} transferencias
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#555", display: "block", marginBottom: "4px" }}>
                Buscar:
              </label>
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
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#555", display: "block", marginBottom: "4px" }}>
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

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#555", display: "block", marginBottom: "4px" }}>
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
                  cursor: filteredPagos.length === 0 || loading ? "not-allowed" : "pointer",
                  opacity: filteredPagos.length === 0 || loading ? 0.5 : 1,
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

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Código</th>
                <th style={{ textAlign: "center" }}>Conductor</th>
                <th style={{ textAlign: "center" }}>Referencia Pago</th>
                <th style={{ textAlign: "center" }}>Cant. Servicios</th>
                <th style={{ textAlign: "center" }}>Fecha y Hora</th>
                <th style={{ textAlign: "center" }}>Monto Total (USD)</th>
                <th style={{ textAlign: "center" }}>Tasa Aplicada</th>
                <th style={{ textAlign: "center" }}>Monto Total (Bs)</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    Cargando historial de pagos...
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p, index) => {
                  const tasa = Number(p.tasa_pago_bs || 0);
                  const usd = Number(p.monto_usd || 0);
                  const montoBsCalculado =
                    tasa > 0 ? usd * tasa : Number(p.monto_bs_original || 0);

                  const fechaObj = p.fecha_pago ? new Date(p.fecha_pago) : null;
                  const fechaFormateada =
                    fechaObj && !isNaN(fechaObj.getTime())
                      ? fechaObj.toLocaleString("es-VE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "N/A";

                  return (
                    <tr key={`${p.repartidor_id}-${p.numero_referencia}-${index}`}>
                      <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--color-primary, #000)", fontSize: "0.85rem" }}>
                        {p.codigo_repartidor || "N/A"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold", color: "#222" }}>
                        {p.nombre || "N/A"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "600", letterSpacing: "0.5px" }}>
                        {p.numero_referencia || "N/A"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        <span style={{ backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
                          {p.total_servicios || 1}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {fechaFormateada}
                      </td>
                      <td style={{ textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>
                        ${usd.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {tasa > 0 ? `${tasa.toFixed(2)} Bs.` : "N/A"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {montoBsCalculado.toFixed(2)} Bs.
                      </td>
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