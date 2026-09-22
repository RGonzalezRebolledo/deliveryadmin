
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DriverDetailModal from "./DriverDetailModal";
import DriverRegisterModal from "./DriverRegisterModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DriverTipe = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoConductorFilter, setTipoConductorFilter] = useState("todos");
  const [tipoVehiculoFilter, setTipoVehiculoFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [driverToView, setDriverToView] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Carga de conductores y tipos de vehículos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/driver/getdrivers`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true })
      ]);

      setDrivers(driversRes.data || []);
      setVehicleTypes(vehiclesRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejo de acciones: Suspender / Activar conductor
  const handleAction = async (driver, actionType) => {
    const confirmMsg =
      actionType === "activar"
        ? `¿Deseas activar a ${driver.nombre}?`
        : `¿Estás seguro de suspender a ${driver.nombre}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint =
        actionType === "suspender"
          ? `${API_BASE_URL}/driver/suspend-driver`
          : `${API_BASE_URL}/driver/activate-driver`;

      await axios.put(
        endpoint,
        { usuario_id: driver.usuario_id },
        { withCredentials: true }
      );
      alert(
        `Conductor ${
          actionType === "activar" ? "activado" : "suspendido"
        } con éxito`
      );
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Error al procesar la solicitud");
    }
  };

  // Lógica de filtrado: SOLO MOSTRAR CONDUCTORES QUE YA TENGAN CÓDIGO
  const filteredDrivers = drivers.filter((d) => {
    const tieneCodigo = Boolean(d.codigo_conductor && d.codigo_conductor.trim() !== "");
    if (!tieneCodigo) return false;

    const query = searchTerm.toLowerCase();

    // Coincidencia por Búsqueda (Nombre, Email, Código Conductor)
    const coincideBusqueda =
      (d.nombre && d.nombre.toLowerCase().includes(query)) ||
      (d.email && d.email.toLowerCase().includes(query)) ||
      (d.codigo_conductor && d.codigo_conductor.toLowerCase().includes(query));

    // Coincidencia por Tipo de Conductor
    const conductorTipo = (d.tipo_conductor || d.tipo || "").toLowerCase();
    const coincideTipoConductor =
      tipoConductorFilter === "todos" || conductorTipo === tipoConductorFilter;

    // Coincidencia por Tipo de Vehículo ID
    const coincideTipoVehiculo =
      tipoVehiculoFilter === "todos" ||
      String(d.tipo_vehiculo_id) === String(tipoVehiculoFilter);

    return coincideBusqueda && coincideTipoConductor && coincideTipoVehiculo;
  });

  // Formateador de fecha
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowClick = (driver) => {
    setDriverToView(driver);
    setShowViewModal(true);
  };

  // Función para exportar la lista filtrada a PDF
  const exportToPDF = () => {
    if (filteredDrivers.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Gazzella Express - Consulta de Conductores", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-VE")} ${new Date().toLocaleTimeString("es-VE")}`,
      14,
      22
    );
    doc.text(`Total registros: ${filteredDrivers.length}`, 14, 27);

    const tableColumn = [
      "Código",
      "Nombre",
      "Email",
      "Tipo Conductor",
      "Vehículo",
      "Fecha Registro",
      "Estatus"
    ];

    const tableRows = filteredDrivers.map((d) => [
      d.codigo_conductor || "--",
      d.nombre || "--",
      d.email || "--",
      d.tipo_conductor || d.tipo || "--",
      d.tipo_vehiculo || d.vehiculo || "--",
      formatDate(d.fecha_creacion),
      !d.repartidor_id ? "PENDIENTE" : (d.is_active || "--").toUpperCase()
    ]);

    autoTable(doc, {
      startY: 32,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] },
      styles: { fontSize: 8 }
    });

    doc.save(`reporte_conductores_${Date.now()}.pdf`);
  };

  return (
    <div className="content-area">
      {/* MODAL DE VISTA DETALLADA */}
      {showViewModal && (
        <DriverDetailModal
          driver={driverToView}
          onClose={() => {
            setShowViewModal(false);
            setDriverToView(null);
          }}
        />
      )}

      {/* MODAL DE EDICIÓN DE CONDUCTOR */}
      {showEditModal && (
        <DriverRegisterModal
          driver={selectedDriver}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDriver(null);
          }}
          onSuccess={fetchData}
        />
      )}

      <div className="admin-table-container">
        <div
          style={{
            padding: "var(--spacing-lg)",
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
            <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
              Consulta de Conductores
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "0.8rem", color: "#777" }}>
                Mostrando <strong>{filteredDrivers.length}</strong> conductores con código
              </span>
              <button
                onClick={exportToPDF}
                disabled={filteredDrivers.length === 0 || loading}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: filteredDrivers.length === 0 || loading ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: filteredDrivers.length === 0 || loading ? 0.6 : 1
                }}
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>

          {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Campo de Búsqueda */}
            <div style={{ position: "relative", flex: "1 1 250px" }}>
              <input
                type="text"
                placeholder="Buscar por código, nombre o email..."
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

            {/* Filtro Tipo Conductor */}
            <select
              value={tipoConductorFilter}
              onChange={(e) => setTipoConductorFilter(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="todos">Todos los Tipos</option>
              <option value="interno">Internos</option>
              <option value="foraneo">Foráneos</option>
            </select>

            {/* Filtro Tipo Vehículo */}
            <select
              value={tipoVehiculoFilter}
              onChange={(e) => setTipoVehiculoFilter(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="todos">Todos los Vehículos</option>
              {vehicleTypes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.descript}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLA DE CONDUCTORES */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Foto</th>
                <th style={{ textAlign: "center" }}>Código</th>
                <th style={{ textAlign: "center" }}>Nombre</th>
                <th style={{ textAlign: "center" }}>Email</th>
                <th style={{ textAlign: "center" }}>Tipo Conductor</th>
                <th style={{ textAlign: "center" }}>Vehículo</th>
                <th style={{ textAlign: "center" }}>Fecha Registro</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
                <th style={{ textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    Cargando datos...
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => {
                  const esNuevo = !d.repartidor_id;
                  const esSuspendido = d.is_active === "suspendido";
                  const esActivo = d.is_active === "activo";
                  const fotoUrl = d.foto || d.foto_perfil;

                  return (
                    <tr
                      key={d.usuario_id}
                      onClick={() => handleRowClick(d)}
                      style={{ cursor: "pointer" }}
                      className="clickable-row"
                    >
                      {/* FOTO DE PERFIL */}
                      <td style={{ textAlign: "center", width: "60px" }}>
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={d.nombre}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #ccc",
                              display: "block",
                              margin: "0 auto",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "#eee",
                              color: "#888",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              margin: "0 auto",
                            }}
                          >
                            {d.nombre ? d.nombre.charAt(0).toUpperCase() : "👤"}
                          </div>
                        )}
                      </td>

                      {/* CÓDIGO */}
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "var(--color-primary)",
                        }}
                      >
                        {d.codigo_conductor || "--"}
                      </td>

                      {/* NOMBRE */}
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {d.nombre}
                      </td>

                      {/* EMAIL */}
                      <td style={{ fontSize: "0.85rem", textAlign: "center" }}>
                        {d.email}
                      </td>

                      {/* TIPO CONDUCTOR */}
                      <td style={{ textAlign: "center", textTransform: "capitalize" }}>
                        {d.tipo_conductor || d.tipo || "--"}
                      </td>

                      {/* TIPO VEHÍCULO */}
                      <td style={{ textAlign: "center" }}>
                        {d.tipo_vehiculo || d.vehiculo || "--"}
                      </td>

                      {/* FECHA DE REGISTRO */}
                      <td
                        style={{
                          textAlign: "center",
                          fontSize: "0.85rem",
                          color: "#555",
                        }}
                      >
                        {formatDate(d.fecha_creacion)}
                      </td>

                      {/* ESTATUS */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            display: "inline-block",
                            textAlign: "center",
                            textTransform: "uppercase",
                            border: "1px solid #ccc",
                            backgroundColor: esNuevo
                              ? "#f0f0f0"
                              : esSuspendido
                              ? "#ffebee"
                              : "#e8f5e9",
                            color: esNuevo
                              ? "#666"
                              : esSuspendido
                              ? "#c62828"
                              : "#2e7d32",
                          }}
                        >
                          {esNuevo ? "PENDIENTE" : d.is_active}
                        </span>
                      </td>

                      {/* BOTONES DE ACCIÓN (SUSPENDER / ACTIVAR Y EDITAR) */}
                      <td style={{ textAlign: "center", width: "1%" }}>
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          {esActivo && (
                            <button
                              className="btn-primary"
                              style={{ fontSize: "0.7rem", padding: "6px 12px", minWidth: "80px", borderRadius: "4px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(d, "suspender");
                              }}
                            >
                              Suspender
                            </button>
                          )}

                          {esSuspendido && (
                            <button
                              style={{
                                fontSize: "0.7rem",
                                padding: "6px 12px",
                                minWidth: "80px",
                                backgroundColor: "#00BFFF",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(d, "activar");
                              }}
                            >
                              Activar
                            </button>
                          )}

                          <button
                            style={{
                              fontSize: "0.7rem",
                              padding: "6px 12px",
                              minWidth: "70px",
                              backgroundColor: "#2c3e50",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriver(d);
                              setShowEditModal(true);
                            }}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MENSAJE CUANDO NO HAY REGISTROS */}
        {!loading && filteredDrivers.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron conductores con código asignado que cumplan los criterios.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTipe;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import DriverDetailModal from "./DriverDetailModal";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const DriverTipe = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [tipoConductorFilter, setTipoConductorFilter] = useState("todos");
//   const [tipoVehiculoFilter, setTipoVehiculoFilter] = useState("todos");
//   const [loading, setLoading] = useState(true);

//   // Estado para la vista de detalle
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [driverToView, setDriverToView] = useState(null);

//   // Carga de conductores y tipos de vehículos
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [driversRes, vehiclesRes] = await Promise.all([
//         axios.get(`${API_BASE_URL}/driver/getdrivers`, { withCredentials: true }),
//         axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true })
//       ]);

//       setDrivers(driversRes.data || []);
//       setVehicleTypes(vehiclesRes.data || []);
//     } catch (error) {
//       console.error("Error al cargar datos:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Lógica de filtrado
//   const filteredDrivers = drivers.filter((d) => {
//     const query = searchTerm.toLowerCase();

//     // Coincidencia por Búsqueda (Nombre, Email, Código Conductor)
//     const coincideBusqueda =
//       (d.nombre && d.nombre.toLowerCase().includes(query)) ||
//       (d.email && d.email.toLowerCase().includes(query)) ||
//       (d.codigo_conductor && d.codigo_conductor.toLowerCase().includes(query));

//     // Coincidencia por Tipo de Conductor
//     const conductorTipo = (d.tipo_conductor || d.tipo || "").toLowerCase();
//     const coincideTipoConductor =
//       tipoConductorFilter === "todos" || conductorTipo === tipoConductorFilter;

//     // Coincidencia por Tipo de Vehículo ID
//     const coincideTipoVehiculo =
//       tipoVehiculoFilter === "todos" ||
//       String(d.tipo_vehiculo_id) === String(tipoVehiculoFilter);

//     return coincideBusqueda && coincideTipoConductor && coincideTipoVehiculo;
//   });

//   // Formateador de fecha
//   const formatDate = (dateString) => {
//     if (!dateString) return "--";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleRowClick = (driver) => {
//     setDriverToView(driver);
//     setShowViewModal(true);
//   };

//   // Función para exportar la lista filtrada a PDF
//   const exportToPDF = () => {
//     if (filteredDrivers.length === 0) return;

//     const doc = new jsPDF();

//     doc.setFontSize(16);
//     doc.text("Gazzella Express - Consulta de Conductores", 14, 15);
//     doc.setFontSize(10);
//     doc.text(
//       `Fecha de emisión: ${new Date().toLocaleDateString("es-VE")} ${new Date().toLocaleTimeString("es-VE")}`,
//       14,
//       22
//     );
//     doc.text(`Total registros: ${filteredDrivers.length}`, 14, 27);

//     const tableColumn = [
//       "Código",
//       "Nombre",
//       "Email",
//       "Tipo Conductor",
//       "Vehículo",
//       "Fecha Registro",
//       "Estatus"
//     ];

//     const tableRows = filteredDrivers.map((d) => [
//       d.codigo_conductor || "--",
//       d.nombre || "--",
//       d.email || "--",
//       d.tipo_conductor || d.tipo || "--",
//       d.tipo_vehiculo || d.vehiculo || "--",
//       formatDate(d.fecha_creacion),
//       !d.repartidor_id ? "PENDIENTE" : (d.is_active || "--").toUpperCase()
//     ]);

//     autoTable(doc, {
//       startY: 32,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "striped",
//       headStyles: { fillColor: [44, 62, 80] },
//       styles: { fontSize: 8 }
//     });

//     doc.save(`reporte_conductores_${Date.now()}.pdf`);
//   };

//   return (
//     <div className="content-area">
//       {/* MODAL DE VISTA DETALLADA */}
//       {showViewModal && (
//         <DriverDetailModal
//           driver={driverToView}
//           onClose={() => {
//             setShowViewModal(false);
//             setDriverToView(null);
//           }}
//         />
//       )}

//       <div className="admin-table-container">
//         <div
//           style={{
//             padding: "var(--spacing-lg)",
//             borderBottom: "1px solid #eee",
//             backgroundColor: "#fff",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: "15px",
//             }}
//           >
//             <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
//               Consulta de Conductores
//             </h2>
//             <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//               <span style={{ fontSize: "0.8rem", color: "#777" }}>
//                 Mostrando <strong>{filteredDrivers.length}</strong> de{" "}
//                 {drivers.length}
//               </span>
//               <button
//                 onClick={exportToPDF}
//                 disabled={filteredDrivers.length === 0 || loading}
//                 style={{
//                   backgroundColor: "#e74c3c",
//                   color: "#fff",
//                   border: "none",
//                   padding: "8px 14px",
//                   borderRadius: "6px",
//                   fontWeight: "bold",
//                   cursor: filteredDrivers.length === 0 || loading ? "not-allowed" : "pointer",
//                   fontSize: "0.85rem",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "6px",
//                   opacity: filteredDrivers.length === 0 || loading ? 0.6 : 1
//                 }}
//               >
//                 📄 Exportar PDF
//               </button>
//             </div>
//           </div>

//           {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
//           <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
//             {/* Campo de Búsqueda */}
//             <div style={{ position: "relative", flex: "1 1 250px" }}>
//               <input
//                 type="text"
//                 placeholder="Buscar por código, nombre o email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "10px 15px",
//                   borderRadius: "8px",
//                   border: "1px solid #ddd",
//                   fontSize: "0.9rem",
//                   outline: "none",
//                   boxSizing: "border-box",
//                 }}
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   style={{
//                     position: "absolute",
//                     right: "10px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     border: "none",
//                     background: "none",
//                     color: "#999",
//                     cursor: "pointer",
//                     fontSize: "1.2rem",
//                   }}
//                 >
//                   ×
//                 </button>
//               )}
//             </div>

//             {/* Filtro Tipo Conductor */}
//             <select
//               value={tipoConductorFilter}
//               onChange={(e) => setTipoConductorFilter(e.target.value)}
//               style={{
//                 flex: "1 1 180px",
//                 padding: "10px",
//                 borderRadius: "8px",
//                 border: "1px solid #ddd",
//                 fontSize: "0.9rem",
//                 outline: "none",
//                 backgroundColor: "#fff",
//                 cursor: "pointer",
//               }}
//             >
//               <option value="todos">Todos los Tipos</option>
//               <option value="interno">Internos</option>
//               <option value="foraneo">Foráneos</option>
//             </select>

//             {/* Filtro Tipo Vehículo */}
//             <select
//               value={tipoVehiculoFilter}
//               onChange={(e) => setTipoVehiculoFilter(e.target.value)}
//               style={{
//                 flex: "1 1 180px",
//                 padding: "10px",
//                 borderRadius: "8px",
//                 border: "1px solid #ddd",
//                 fontSize: "0.9rem",
//                 outline: "none",
//                 backgroundColor: "#fff",
//                 cursor: "pointer",
//               }}
//             >
//               <option value="todos">Todos los Vehículos</option>
//               {vehicleTypes.map((v) => (
//                 <option key={v.id} value={v.id}>
//                   {v.descript}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* TABLA DE CONDUCTORES */}
//         <div className="overflow-x-auto">
//           <table className="admin-table">
//             <thead>
//               <tr>
//                 <th style={{ textAlign: "center" }}>Foto</th>
//                 <th style={{ textAlign: "center" }}>Código</th>
//                 <th style={{ textAlign: "center" }}>Nombre</th>
//                 <th style={{ textAlign: "center" }}>Email</th>
//                 <th style={{ textAlign: "center" }}>Tipo Conductor</th>
//                 <th style={{ textAlign: "center" }}>Vehículo</th>
//                 <th style={{ textAlign: "center" }}>Fecha Registro</th>
//                 <th style={{ textAlign: "center" }}>Estatus</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
//                     Cargando datos...
//                   </td>
//                 </tr>
//               ) : (
//                 filteredDrivers.map((d) => {
//                   const esNuevo = !d.repartidor_id;
//                   const esSuspendido = d.is_active === "suspendido";
//                   const fotoUrl = d.foto || d.foto_perfil;

//                   return (
//                     <tr
//                       key={d.usuario_id}
//                       onClick={() => handleRowClick(d)}
//                       style={{ cursor: "pointer" }}
//                       className="clickable-row"
//                     >
//                       {/* FOTO DE PERFIL */}
//                       <td style={{ textAlign: "center", width: "60px" }}>
//                         {fotoUrl ? (
//                           <img
//                             src={fotoUrl}
//                             alt={d.nombre}
//                             style={{
//                               width: "40px",
//                               height: "40px",
//                               borderRadius: "50%",
//                               objectFit: "cover",
//                               border: "1px solid #ccc",
//                               display: "block",
//                               margin: "0 auto",
//                             }}
//                           />
//                         ) : (
//                           <div
//                             style={{
//                               width: "40px",
//                               height: "40px",
//                               borderRadius: "50%",
//                               backgroundColor: "#eee",
//                               color: "#888",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               fontSize: "0.8rem",
//                               fontWeight: "bold",
//                               margin: "0 auto",
//                             }}
//                           >
//                             {d.nombre ? d.nombre.charAt(0).toUpperCase() : "👤"}
//                           </div>
//                         )}
//                       </td>

//                       {/* CÓDIGO */}
//                       <td
//                         style={{
//                           textAlign: "center",
//                           fontWeight: "bold",
//                           color: "var(--color-primary)",
//                         }}
//                       >
//                         {d.codigo_conductor || "--"}
//                       </td>

//                       {/* NOMBRE */}
//                       <td style={{ textAlign: "center", fontWeight: "bold" }}>
//                         {d.nombre}
//                       </td>

//                       {/* EMAIL */}
//                       <td style={{ fontSize: "0.85rem", textAlign: "center" }}>
//                         {d.email}
//                       </td>

//                       {/* TIPO CONDUCTOR */}
//                       <td style={{ textAlign: "center", textTransform: "capitalize" }}>
//                         {d.tipo_conductor || d.tipo || "--"}
//                       </td>

//                       {/* TIPO VEHÍCULO */}
//                       <td style={{ textAlign: "center" }}>
//                         {d.tipo_vehiculo || d.vehiculo || "--"}
//                       </td>

//                       {/* FECHA DE REGISTRO */}
//                       <td
//                         style={{
//                           textAlign: "center",
//                           fontSize: "0.85rem",
//                           color: "#555",
//                         }}
//                       >
//                         {formatDate(d.fecha_creacion)}
//                       </td>

//                       {/* ESTATUS */}
//                       <td style={{ textAlign: "center" }}>
//                         <span
//                           style={{
//                             padding: "4px 8px",
//                             borderRadius: "5px",
//                             fontSize: "11px",
//                             fontWeight: "bold",
//                             display: "inline-block",
//                             textAlign: "center",
//                             textTransform: "uppercase",
//                             border: "1px solid #ccc",
//                             backgroundColor: esNuevo
//                               ? "#f0f0f0"
//                               : esSuspendido
//                               ? "#ffebee"
//                               : "#e8f5e9",
//                             color: esNuevo
//                               ? "#666"
//                               : esSuspendido
//                               ? "#c62828"
//                               : "#2e7d32",
//                           }}
//                         >
//                           {esNuevo ? "PENDIENTE" : d.is_active}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* MENSAJE CUANDO NO HAY REGISTROS */}
//         {!loading && filteredDrivers.length === 0 && (
//           <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
//             No se encontraron conductores con los criterios seleccionados.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DriverTipe;


