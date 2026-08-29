import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../../hooks/AuthContext"; // Ajusta la ruta si es necesario

function LiquidacionRepartidoresAdmin() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Tasa del dólar desde AuthContext
  const { exchangeRate } = useAuth();
  const tasaBs = Number(exchangeRate || 0);

  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal de Referencia de Pago
  const [showModal, setShowModal] = useState(false);
  const [numeroReferencia, setNumeroReferencia] = useState("");

  useEffect(() => {
    fetchPendientes();
  }, []);

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/pendientes`, {
        withCredentials: true,
      });

      // Filtrar únicamente los registros pendientes de liquidar
      const pendientesData = (res.data || []).filter(
        (d) =>
          !d.estatus ||
          d.estatus.toLowerCase() === "pendiente" ||
          Number(d.total_pedidos_pendientes) > 0
      );

      setDrivers(pendientesData);
      setSelectedDriverIds([]);
    } catch (err) {
      Swal.fire(
        "Error",
        "No se pudieron cargar las liquidaciones pendientes",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrado dinámico por búsqueda
  const filteredDrivers = drivers.filter((d) => {
    const query = searchTerm.toLowerCase();
    const nombreCompleto = `${d.nombre || ""} ${d.apellido || ""}`.toLowerCase();
    const cedula = (d.cedula || "").toLowerCase();

    return nombreCompleto.includes(query) || cedula.includes(query);
  });

  // Selección de checkboxes (considera los elementos filtrados)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDriverIds(filteredDrivers.map((d) => d.repartidor_id));
    } else {
      setSelectedDriverIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedDriverIds.includes(id)) {
      setSelectedDriverIds(selectedDriverIds.filter((item) => item !== id));
    } else {
      setSelectedDriverIds([...selectedDriverIds, id]);
    }
  };

  const getSelectedLiquidacionIds = () => {
    return drivers
      .filter((d) => selectedDriverIds.includes(d.repartidor_id))
      .flatMap((d) => d.liquidacion_ids || []);
  };

  // Cálculos de Totales sobre los seleccionados
  const selectedDriversData = drivers.filter((d) =>
    selectedDriverIds.includes(d.repartidor_id)
  );
  const totalUSD = selectedDriversData.reduce(
    (acc, curr) => acc + Number(curr.total_usd || 0),
    0
  );
  const totalBsCalculado = totalUSD * tasaBs;

  // Reporte PDF
  const handleExportPDF = () => {
    if (selectedDriversData.length === 0) {
      Swal.fire(
        "Atención",
        "Seleccione al menos un conductor para generar el PDF",
        "warning"
      );
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Gazzella Express - Relación de Pago a Conductores", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-VE")} ${new Date().toLocaleTimeString("es-VE")}`,
      14,
      22
    );
    doc.text(`Tasa Oficial del Sistema: ${tasaBs.toFixed(2)} Bs/USD`, 14, 27);

    const tableColumn = [
      "Conductor",
      "Cédula",
      "Teléfono",
      "Pedidos",
      "Monto USD",
      "Monto (Bs)",
      "Estatus",
    ];
    const tableRows = selectedDriversData.map((d) => [
      `${d.nombre || ""} ${d.apellido || ""}`.trim(),
      d.cedula || "N/A",
      d.telefono || "N/A",
      d.total_pedidos_pendientes || 0,
      `$${Number(d.total_usd || 0).toFixed(2)}`,
      `${(Number(d.total_usd || 0) * tasaBs).toFixed(2)} Bs.`,
      "PENDIENTE",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] },
      columnStyles: {
        6: { fontStyle: "bold", textColor: [217, 119, 6] },
      },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 32) + 10;
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text(`Total en USD: $${totalUSD.toFixed(2)}`, 14, finalY);
    doc.text(
      `Total a Transferir (Bs): ${totalBsCalculado.toFixed(2)} Bs.`,
      14,
      finalY + 6
    );

    doc.save(`Pago_Conductores_Pendientes_${Date.now()}.pdf`);
  };

  // Procesar Liquidación
  const handleConfirmarPago = async () => {
    const liquidacionIds = getSelectedLiquidacionIds();

    if (!numeroReferencia.trim()) {
      Swal.fire(
        "Campo Requerido",
        "Por favor ingrese el número de referencia del pago",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/procesar-pago`,
        {
          liquidacionIds,
          numeroReferencia: numeroReferencia.trim(),
          tasaPagoBs: tasaBs,
        },
        { withCredentials: true }
      );

      setShowModal(false);
      setNumeroReferencia("");
      Swal.fire("¡Éxito!", "Pagos liquidados correctamente", "success");
      fetchPendientes();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "No se pudo procesar el pago",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area">
      <div className="admin-table-container">
        {/* CABECERA Y FILTROS INTEGRADOS CON EL PATRÓN */}
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
              Liquidación y Pago a Conductores
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredDrivers.length}</strong> de{" "}
              {drivers.length}
            </span>
          </div>

          {/* BÚSQUEDA Y TASA / ACCIONES */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Input de Búsqueda por Nombre / Cédula */}
            <div style={{ position: "relative", flex: 3, minWidth: "220px" }}>
              <input
                type="text"
                placeholder="Buscar por nombre o cédula del conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Input de Tasa del Sistema */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                minWidth: "180px",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  color: "#555",
                  whiteSpace: "nowrap",
                }}
              >
                Tasa:
              </label>
              <input
                type="text"
                value={tasaBs ? `${tasaBs.toFixed(2)} Bs.` : "Cargando..."}
                disabled
                readOnly
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  cursor: "not-allowed",
                  outline: "none",
                }}
              />
            </div>

            {/* Botones de Acción */}
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <button
                className="btn-secondary"
                onClick={handleExportPDF}
                disabled={selectedDriverIds.length === 0 || loading}
                style={{
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  cursor:
                    selectedDriverIds.length === 0 ? "not-allowed" : "pointer",
                  opacity: selectedDriverIds.length === 0 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                📄 PDF
              </button>

              <button
                className="btn-success"
                onClick={() => setShowModal(true)}
                disabled={selectedDriverIds.length === 0 || loading}
                style={{
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor:
                    selectedDriverIds.length === 0 ? "not-allowed" : "pointer",
                  opacity: selectedDriverIds.length === 0 ? 0.5 : 1,
                }}
              >
                💳 Liquidar ({selectedDriverIds.length})
              </button>
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS ADAPTADA AL CSS GLOBAL DEL PANEL */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredDrivers.length > 0 &&
                      filteredDrivers.every((d) =>
                        selectedDriverIds.includes(d.repartidor_id)
                      )
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ textAlign: "center" }}>Conductor</th>
                <th style={{ textAlign: "center" }}>Cédula</th>
                <th style={{ textAlign: "center" }}>Pedidos Pendientes</th>
                <th style={{ textAlign: "center" }}>Monto (USD)</th>
                <th style={{ textAlign: "center" }}>Monto A Pagar (Bs)</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    Cargando datos...
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => {
                  const isSelected = selectedDriverIds.includes(d.repartidor_id);
                  const montoBs = Number(d.total_usd || 0) * tasaBs;

                  return (
                    <tr key={d.repartidor_id}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(d.repartidor_id)}
                        />
                      </td>

                      {/* Nombre con estilo destacado similar al patrón */}
                      <td style={{ textAlign: "center", fontWeight: "bold", color: "#222" }}>
                        {d.nombre} {d.apellido}
                      </td>

                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {d.cedula || "N/A"}
                      </td>

                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {d.total_pedidos_pendientes}
                      </td>

                      <td style={{ textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>
                        ${Number(d.total_usd || 0).toFixed(2)}
                      </td>

                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {montoBs.toFixed(2)} Bs.
                      </td>

                      {/* Pill Status integrado */}
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
                            border: "1px solid #ffe0b2",
                            backgroundColor: "#fff3e0",
                            color: "#e65100",
                          }}
                        >
                          PENDIENTE
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
        {!loading && filteredDrivers.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron liquidaciones pendientes.
          </div>
        )}
      </div>

      {/* MODAL PARA INGRESAR REFERENCIA DE PAGO */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "var(--color-primary)" }}>
              Procesar Liquidación
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "16px" }}>
              Vas a pagar a <strong>{selectedDriverIds.length}</strong> conductor(es) un total de{" "}
              <strong>{totalBsCalculado.toFixed(2)} Bs.</strong> (${totalUSD.toFixed(2)} USD).
            </p>

            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "bold",
                display: "block",
                marginBottom: "6px",
                color: "#333",
              }}
            >
              Número de Referencia del Pago:
            </label>
            <input
              type="text"
              placeholder="Ej. 00123456"
              value={numeroReferencia}
              onChange={(e) => setNumeroReferencia(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "20px",
                boxSizing: "border-box",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNumeroReferencia("");
                }}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: "#eee",
                  color: "#333",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-success"
                onClick={handleConfirmarPago}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Procesando..." : "Confirmar y Pagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiquidacionRepartidoresAdmin;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { useAuth } from '../../hooks/AuthContext'; // Ajusta la ruta a tu AuthContext

// function LiquidacionRepartidoresAdmin() {
//     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
//     // Obtenemos la tasa del dólar directamente del AuthContext
//     const { exchangeRate } = useAuth(); 

//     const [drivers, setDrivers] = useState([]);
//     const [selectedDriverIds, setSelectedDriverIds] = useState([]);
//     const [loading, setLoading] = useState(false);
    
//     // Usamos el valor directamente de exchangeRate (convertido a número)
//     const tasaBs = Number(exchangeRate || 0);

//     // Modal de Referencia de Pago
//     const [showModal, setShowModal] = useState(false);
//     const [numeroReferencia, setNumeroReferencia] = useState('');

//     useEffect(() => {
//         fetchPendientes();
//     }, []);

//     const fetchPendientes = async () => {
//         setLoading(true);
//         try {
//             const res = await axios.get(`${API_BASE_URL}/pendientes`, { withCredentials: true });
            
//             // Filtrar únicamente los registros pendientes de liquidar
//             const pendientesData = (res.data || []).filter(d => 
//                 !d.estatus || d.estatus.toLowerCase() === 'pendiente' || Number(d.total_pedidos_pendientes) > 0
//             );
            
//             setDrivers(pendientesData);
//             setSelectedDriverIds([]);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudieron cargar las liquidaciones pendientes', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSelectAll = (e) => {
//         if (e.target.checked) {
//             setSelectedDriverIds(drivers.map(d => d.repartidor_id));
//         } else {
//             setSelectedDriverIds([]);
//         }
//     };

//     const handleSelectOne = (id) => {
//         if (selectedDriverIds.includes(id)) {
//             setSelectedDriverIds(selectedDriverIds.filter(item => item !== id));
//         } else {
//             setSelectedDriverIds([...selectedDriverIds, id]);
//         }
//     };

//     const getSelectedLiquidacionIds = () => {
//         return drivers
//             .filter(d => selectedDriverIds.includes(d.repartidor_id))
//             .flatMap(d => d.liquidacion_ids || []);
//     };

//     // Cálculos de Totales
//     const selectedDriversData = drivers.filter(d => selectedDriverIds.includes(d.repartidor_id));
//     const totalUSD = selectedDriversData.reduce((acc, curr) => acc + Number(curr.total_usd || 0), 0);
//     const totalBsCalculado = totalUSD * tasaBs;

//     // Reporte PDF
//     const handleExportPDF = () => {
//         if (selectedDriversData.length === 0) {
//             Swal.fire('Atención', 'Seleccione al menos un conductor para generar el PDF', 'warning');
//             return;
//         }

//         const doc = new jsPDF();

//         doc.setFontSize(16);
//         doc.text('Gazzella Express - Relación de Pago a Conductores', 14, 15);
//         doc.setFontSize(10);
//         doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}`, 14, 22);
//         doc.text(`Tasa Oficial del Sistema: ${tasaBs.toFixed(2)} Bs/USD`, 14, 27);

//         const tableColumn = ["Conductor", "Cédula", "Teléfono", "Pedidos", "Monto USD", "Monto (Bs)", "Estatus"];
//         const tableRows = selectedDriversData.map(d => [
//             `${d.nombre || ''} ${d.apellido || ''}`.trim(),
//             d.cedula || 'N/A',
//             d.telefono || 'N/A',
//             d.total_pedidos_pendientes || 0,
//             `$${Number(d.total_usd || 0).toFixed(2)}`,
//             `${(Number(d.total_usd || 0) * tasaBs).toFixed(2)} Bs.`,
//             'PENDIENTE'
//         ]);

//         autoTable(doc, {
//             startY: 32,
//             head: [tableColumn],
//             body: tableRows,
//             theme: 'striped',
//             headStyles: { fillColor: [249, 115, 22] },
//             columnStyles: {
//                 6: { fontStyle: 'bold', textColor: [217, 119, 6] }
//             }
//         });

//         const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 32) + 10;
//         doc.setFontSize(11);
//         doc.setFont(undefined, 'bold');
//         doc.text(`Total en USD: $${totalUSD.toFixed(2)}`, 14, finalY);
//         doc.text(`Total a Transferir (Bs): ${totalBsCalculado.toFixed(2)} Bs.`, 14, finalY + 6);

//         doc.save(`Pago_Conductores_Pendientes_${Date.now()}.pdf`);
//     };

//     // Procesar Liquidación
//     const handleConfirmarPago = async () => {
//         const liquidacionIds = getSelectedLiquidacionIds();

//         if (!numeroReferencia.trim()) {
//             Swal.fire('Campo Requerido', 'Por favor ingrese el número de referencia del pago', 'warning');
//             return;
//         }

//         try {
//             setLoading(true);
//             await axios.post(`${API_BASE_URL}/procesar-pago`, {
//                 liquidacionIds,
//                 numeroReferencia: numeroReferencia.trim(),
//                 tasaPagoBs: tasaBs
//             }, { withCredentials: true });

//             setShowModal(false);
//             setNumeroReferencia('');
//             Swal.fire('¡Éxito!', 'Pagos liquidados correctamente', 'success');
//             fetchPendientes();
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo procesar el pago', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
//             <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
//                 🛵 Liquidación y Pago a Conductores
//             </h2>

//             {/* Visualización de Tasa (Inmodificable) y Acciones */}
//             <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tasa del Sistema (Bs/USD):</label>
//                     <input 
//                         type="text" 
//                         value={tasaBs ? `${tasaBs.toFixed(2)} Bs.` : 'Cargando...'} 
//                         disabled
//                         readOnly
//                         style={{ 
//                             width: '130px', 
//                             padding: '8px', 
//                             borderRadius: '6px', 
//                             border: '1px solid #cbd5e1', 
//                             fontWeight: 'bold', 
//                             backgroundColor: '#e2e8f0', // Fondo gris que indica inhabilitado
//                             color: '#334155',
//                             cursor: 'not-allowed'
//                         }}
//                     />
//                 </div>

//                 <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
//                     <button 
//                         onClick={handleExportPDF}
//                         disabled={selectedDriverIds.length === 0 || loading}
//                         style={{ padding: '10px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: selectedDriverIds.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedDriverIds.length === 0 ? 0.5 : 1 }}
//                     >
//                         📄 Exportar PDF
//                     </button>

//                     <button 
//                         onClick={() => setShowModal(true)}
//                         disabled={selectedDriverIds.length === 0 || loading}
//                         style={{ padding: '10px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: selectedDriverIds.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedDriverIds.length === 0 ? 0.5 : 1 }}
//                     >
//                         💳 Liquidar Seleccionados ({selectedDriverIds.length})
//                     </button>
//                 </div>
//             </div>

//             {/* Tabla de Resultados */}
//             <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
//                     <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
//                         <tr>
//                             <th style={{ padding: '12px 16px', width: '40px' }}>
//                                 <input 
//                                     type="checkbox" 
//                                     checked={drivers.length > 0 && selectedDriverIds.length === drivers.length}
//                                     onChange={handleSelectAll}
//                                 />
//                             </th>
//                             <th style={{ padding: '12px 16px' }}>Conductor</th>
//                             <th style={{ padding: '12px 16px' }}>Cédula</th>
//                             <th style={{ padding: '12px 16px' }}>Pedidos Pendientes</th>
//                             <th style={{ padding: '12px 16px' }}>Monto (USD)</th>
//                             <th style={{ padding: '12px 16px' }}>Monto a Pagar (Bs)</th>
//                             <th style={{ padding: '12px 16px' }}>Estatus</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading && drivers.length === 0 ? (
//                             <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Cargando datos...</td></tr>
//                         ) : drivers.length === 0 ? (
//                             <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No hay pagos pendientes de repartidores.</td></tr>
//                         ) : (
//                             drivers.map((d) => (
//                                 <tr key={d.repartidor_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
//                                     <td style={{ padding: '12px 16px' }}>
//                                         <input 
//                                             type="checkbox" 
//                                             checked={selectedDriverIds.includes(d.repartidor_id)}
//                                             onChange={() => handleSelectOne(d.repartidor_id)}
//                                         />
//                                     </td>
//                                     <td style={{ padding: '12px 16px', fontWeight: '600' }}>{d.nombre} {d.apellido}</td>
//                                     <td style={{ padding: '12px 16px' }}>{d.cedula || 'N/A'}</td>
//                                     <td style={{ padding: '12px 16px' }}>{d.total_pedidos_pendientes}</td>
//                                     <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 'bold' }}>${Number(d.total_usd || 0).toFixed(2)}</td>
//                                     <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{(Number(d.total_usd || 0) * tasaBs).toFixed(2)} Bs.</td>
//                                     <td style={{ padding: '12px 16px' }}>
//                                         <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
//                                             PENDIENTE
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Modal para ingresar la referencia de pago */}
//             {showModal && (
//                 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
//                     <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
//                         <h3 style={{ margin: '0 0 12px 0' }}>Procesar Liquidación</h3>
//                         <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
//                             Vas a pagar a <strong>{selectedDriverIds.length}</strong> conductor(es) un total de <strong>{totalBsCalculado.toFixed(2)} Bs.</strong> (${totalUSD.toFixed(2)} USD).
//                         </p>

//                         <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Número de Referencia del Pago:</label>
//                         <input 
//                             type="text"
//                             placeholder="Ej. 00123456"
//                             value={numeroReferencia}
//                             onChange={(e) => setNumeroReferencia(e.target.value)}
//                             style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
//                         />

//                         <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//                             <button 
//                                 onClick={() => { setShowModal(false); setNumeroReferencia(''); }} 
//                                 disabled={loading} 
//                                 style={{ padding: '8px 16px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}
//                             >
//                                 Cancelar
//                             </button>
//                             <button 
//                                 onClick={handleConfirmarPago} 
//                                 disabled={loading} 
//                                 style={{ padding: '8px 16px', border: 'none', background: '#16a34a', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
//                             >
//                                 {loading ? 'Procesando...' : 'Confirmar y Pagar'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default LiquidacionRepartidoresAdmin;