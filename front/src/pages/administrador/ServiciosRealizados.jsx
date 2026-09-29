import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PedidoDetalleModal from "../../components/modal/PedidoDetalleModal";

function ListaServiciosRealizados() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/servicios-realizados`, {
        withCredentials: true,
      });
      setPedidos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msgError =
        err.response?.data?.message ||
        "No se pudo cargar la lista de servicios";
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

  const filteredPedidos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return pedidos.filter((item) => {
      const clienteNombre = (item.cliente_nombre || "").toLowerCase();
      const nroRecibo = (
        item.nro_recibo || String(item.pedido_id)
      ).toLowerCase();

      const matchesText =
        !query || clienteNombre.includes(query) || nroRecibo.includes(query);

      let matchesDate = true;
      if (item.fecha_pedido) {
        const fechaStr = getLocalDateString(item.fecha_pedido);
        if (fechaInicio && fechaStr < fechaInicio) matchesDate = false;
        if (fechaFin && fechaStr > fechaFin) matchesDate = false;
      }

      return matchesText && matchesDate;
    });
  }, [pedidos, searchTerm, fechaInicio, fechaFin]);

  const handleExportPDF = () => {
    if (filteredPedidos.length === 0) {
      Swal.fire("Atención", "No hay datos para exportar", "warning");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Gazzella Express - Reporte de Servicios Realizados", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Fecha de reporte: ${new Date().toLocaleDateString(
        "es-VE"
      )} ${new Date().toLocaleTimeString("es-VE")}`,
      14,
      22
    );

    const tableColumn = [
      "Pedido #",
      "Cliente",
      "Repartidor",
      "Fecha",
      "Monto (USD)",
      "Estatus",
    ];

    const tableRows = filteredPedidos.map((p) => {
      const fechaObj = p.fecha_pedido ? new Date(p.fecha_pedido) : null;
      const fechaFmt =
        fechaObj && !isNaN(fechaObj.getTime())
          ? fechaObj.toLocaleString("es-VE")
          : "N/A";

      return [
        p.nro_recibo || p.pedido_id,
        p.cliente_nombre || "N/A",
        p.repartidor_nombre || "Sin Asignar",
        fechaFmt,
        `$${Number(p.total_dolar || 0).toFixed(2)}`,
        p.estado.toUpperCase(),
      ];
    });

    autoTable(doc, {
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [0, 191, 255] },
    });

    doc.save(`Servicios_Realizados_${Date.now()}.pdf`);
  };

  return (
    <div className="content-area">
      <div className="admin-table-container">
        {/* Cabecera y Filtros */}
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
              Servicios Realizados
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredPedidos.length}</strong> de{" "}
              {pedidos.length} pedidos
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
              <input
                type="text"
                placeholder="Nro. pedido o Nombre cliente..."
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
                disabled={filteredPedidos.length === 0 || loading}
                style={{
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  cursor:
                    filteredPedidos.length === 0 || loading
                      ? "not-allowed"
                      : "pointer",
                  opacity: filteredPedidos.length === 0 || loading ? 0.5 : 1,
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

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Nro. Pedido</th>
                <th style={{ textAlign: "center" }}>Cliente</th>
                <th style={{ textAlign: "center" }}>Repartidor</th>
                <th style={{ textAlign: "center" }}>Fecha y Hora</th>
                <th style={{ textAlign: "center" }}>Monto (USD)</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
                {/* <th style={{ textAlign: "center" }}>Acción</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#666",
                    }}
                  >
                    Cargando servicios realizados...
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((p) => {
                  const fechaObj = p.fecha_pedido
                    ? new Date(p.fecha_pedido)
                    : null;
                  const fechaFormateada =
                    fechaObj && !isNaN(fechaObj.getTime())
                      ? fechaObj.toLocaleString("es-VE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "N/A";

                  return (
                    <tr
                      key={p.pedido_id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedPedido(p)}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "var(--color-primary, #000)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {`#${p.pedido_id}`}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#222",
                        }}
                      >
                        {p.cliente_nombre || "N/A"}
                      </td>
                      <td style={{ textAlign: "center", color: "#555" }}>
                        {p.repartidor_nombre || "Sin Asignar"}
                      </td>
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {fechaFormateada}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          color: "#16a34a",
                          fontWeight: "bold",
                        }}
                      >
                        ${Number(p.total_dolar || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            display: "inline-block",
                            textTransform: "uppercase",
                            backgroundColor:
                              p.estado === "entregado" ||
                              p.estado === "finalizado"
                                ? "#f0fdf4"
                                : "#fff7ed",
                            color:
                              p.estado === "entregado" ||
                              p.estado === "finalizado"
                                ? "#166534"
                                : "#c2410c",
                            border: `1px solid ${
                              p.estado === "entregado" ||
                              p.estado === "finalizado"
                                ? "#bbf7d0"
                                : "#ffedd5"
                            }`,
                          }}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedPedido(p)}
                          style={{
                            backgroundColor: "var(--color-primary, #00BFFF)",
                            color: "#000",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredPedidos.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron servicios realizados con los criterios
            seleccionados.
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <PedidoDetalleModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  );
}

export default ListaServiciosRealizados;
