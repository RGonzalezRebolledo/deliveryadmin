import React, { useEffect, useState } from "react";
import axios from "axios";
import DriverRegisterModal from "./DriverRegisterModal";
import DriverDetailModal from "./DriverDetailModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDriverVerification = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChangeId, setLoadingChangeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // ESTADOS PARA LA VISTA DE DETALLE (SOLO LECTURA)
  const [showViewModal, setShowViewModal] = useState(false);
  const [driverToView, setDriverToView] = useState(null);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/driver/getdrivers`, {
        withCredentials: true,
      });
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando conductores:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Función para convertir Conductor a Cliente
  const handleConvertToClient = async (driver) => {
    const confirmMsg = `¿Estás seguro de convertir a ${driver.nombre} en Cliente? Su perfil de conductor será removido.`;
    if (!window.confirm(confirmMsg)) return;

    setLoadingChangeId(driver.usuario_id);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/driver/convert-to-client/${driver.usuario_id}`,
        {},
        { withCredentials: true }
      );

      alert(response.data.mensaje);
      fetchDrivers();
    } catch (error) {
      const msg = error.response?.data?.mensaje || "Error al intentar cambiar el rol a cliente.";
      alert(msg);
    } finally {
      setLoadingChangeId(null);
    }
  };

  // FILTRADO Y ORDENAMIENTO (De mayor a menor por fecha)
  const filteredDrivers = drivers
    .filter((d) => {
      const tieneCodigo = Boolean(d.codigo_conductor && d.codigo_conductor.trim() !== "");
      if (tieneCodigo) return false;

      const query = searchTerm.toLowerCase();

      const coincideBusqueda =
        (d.nombre && d.nombre.toLowerCase().includes(query)) ||
        (d.email && d.email.toLowerCase().includes(query));

      return coincideBusqueda;
    })
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

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
      fetchDrivers();
    } catch (error) {
      alert(error.response?.data?.error || "Error al procesar la solicitud");
    }
  };

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

  return (
    <div className="content-area">
      {/* MODAL DE REGISTRO/EDICIÓN */}
      {showModal && (
        <DriverRegisterModal
          driver={selectedDriver}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
          }}
          onSuccess={fetchDrivers}
        />
      )}

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
              justify: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
              Gestión de Conductores (Sin Código)
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredDrivers.length}</strong> pendientes de código
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Nombre</th>
                <th style={{ textAlign: "center" }}>Email</th>
                <th style={{ textAlign: "center" }}>Fecha Registro</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
                <th style={{ textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => {
                const esNuevo = !d.repartidor_id;
                const esSuspendido = d.is_active === "suspendido";
                const esActivo = d.is_active === "activo";

                return (
                  <tr
                    key={d.usuario_id}
                    onClick={() => handleRowClick(d)}
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                    className="clickable-row"
                    title="Hacer clic para ver expediente completo"
                  >
                    <td style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.95rem" }}>
                      {d.nombre}
                    </td>

                    <td style={{ fontSize: "0.85rem", textAlign: "center" }}>{d.email}</td>

                    <td style={{ textAlign: "center", fontSize: "0.85rem", color: "#555" }}>
                      {formatDate(d.fecha_creacion)}
                    </td>

                    <td style={{ textAlign: "center", width: "1%" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                        <span
                          style={{
                            padding: "4px 4px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            width: "110px",
                            display: "inline-block",
                            textAlign: "center",
                            textTransform: "uppercase",
                            border: "1px solid #ccc",
                            backgroundColor: esNuevo ? "#f0f0f0" : esSuspendido ? "#ffebee" : "#e8f5e9",
                            color: esNuevo ? "#666" : esSuspendido ? "#c62828" : "#2e7d32",
                          }}
                        >
                          {esNuevo ? "PENDIENTE" : d.is_active}
                        </span>

                        {esNuevo && (
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: "bold",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: d.verificado ? "#e3f2fd" : "#fff3e0",
                              color: d.verificado ? "#1565c0" : "#e65100",
                              border: d.verificado ? "1px solid #90caf9" : "1px solid #ffe0b2",
                              width: "110px",
                              boxSizing: "border-box"
                            }}
                          >
                            {d.verificado ? "✓ VERIFICADO" : "POR VERIFICAR"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td 
                      style={{ textAlign: "center", width: "1%" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        {esNuevo && (
                          <button
                            className="btn-success"
                            style={{ fontSize: "0.7rem", padding: "6px 12px", minWidth: "90px", borderRadius: "4px" }}
                            onClick={() => {
                              setSelectedDriver(d);
                              setShowModal(true);
                            }}
                          >
                            Registrar
                          </button>
                        )}

                        {esActivo && (
                          <button
                            className="btn-primary"
                            style={{ fontSize: "0.7rem", padding: "6px 12px", minWidth: "90px", borderRadius: "4px" }}
                            onClick={() => handleAction(d, "suspender")}
                          >
                            Suspender
                          </button>
                        )}

                        {esSuspendido && (
                          <button
                            style={{
                              fontSize: "0.7rem",
                              padding: "6px 12px",
                              minWidth: "90px",
                              backgroundColor: "#00BFFF",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                            onClick={() => handleAction(d, "activar")}
                          >
                            Activar
                          </button>
                        )}

                        {!esNuevo && (
                          <button
                            style={{
                              fontSize: "0.7rem",
                              padding: "6px 12px",
                              minWidth: "90px",
                              backgroundColor: "#2c3e50",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedDriver(d);
                              setShowModal(true);
                            }}
                          >
                            Editar
                          </button>
                        )}

                        {/* BOTÓN: CAMBIAR A CLIENTE */}
                        <button
                          disabled={loadingChangeId === d.usuario_id}
                          style={{
                            fontSize: "0.7rem",
                            padding: "6px 12px",
                            minWidth: "110px",
                            backgroundColor: "#8b5cf6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            cursor: loadingChangeId === d.usuario_id ? "not-allowed" : "pointer",
                            opacity: loadingChangeId === d.usuario_id ? 0.6 : 1,
                          }}
                          onClick={() => handleConvertToClient(d)}
                        >
                          {loadingChangeId === d.usuario_id ? "Cambiando..." : "Cambiar a Cliente"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDrivers.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron conductores sin código.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDriverVerification;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import DriverRegisterModal from "./DriverRegisterModal";
// import DriverDetailModal from "./DriverDetailModal";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AdminDriverVerification = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedDriver, setSelectedDriver] = useState(null);

//   // ESTADOS PARA LA VISTA DE DETALLE (SOLO LECTURA)
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [driverToView, setDriverToView] = useState(null);

//   const fetchDrivers = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/driver/getdrivers`, {
//         withCredentials: true,
//       });
//       setDrivers(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error cargando conductores:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDrivers();
//   }, []);

//   // FILTRADO Y ORDENAMIENTO (De mayor a menor por fecha)
//   const filteredDrivers = drivers
//     .filter((d) => {
//       const tieneCodigo = Boolean(d.codigo_conductor && d.codigo_conductor.trim() !== "");
//       if (tieneCodigo) return false;

//       const query = searchTerm.toLowerCase();

//       // Búsqueda por nombre o email
//       const coincideBusqueda =
//         (d.nombre && d.nombre.toLowerCase().includes(query)) ||
//         (d.email && d.email.toLowerCase().includes(query));

//       return coincideBusqueda;
//     })
//     .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

//   const handleAction = async (driver, actionType) => {
//     const confirmMsg =
//       actionType === "activar"
//         ? `¿Deseas activar a ${driver.nombre}?`
//         : `¿Estás seguro de suspender a ${driver.nombre}?`;

//     if (!window.confirm(confirmMsg)) return;

//     try {
//       const endpoint =
//         actionType === "suspender"
//           ? `${API_BASE_URL}/driver/suspend-driver`
//           : `${API_BASE_URL}/driver/activate-driver`;

//       await axios.put(
//         endpoint,
//         { usuario_id: driver.usuario_id },
//         { withCredentials: true }
//       );
//       alert(
//         `Conductor ${
//           actionType === "activar" ? "activado" : "suspendido"
//         } con éxito`
//       );
//       fetchDrivers();
//     } catch (error) {
//       alert(error.response?.data?.error || "Error al procesar la solicitud");
//     }
//   };

//   // Función para dar formato legible a la fecha
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

//   return (
//     <div className="content-area">
//       {/* MODAL DE REGISTRO/EDICIÓN */}
//       {showModal && (
//         <DriverRegisterModal
//           driver={selectedDriver}
//           onClose={() => {
//             setShowModal(false);
//             setSelectedDriver(null);
//           }}
//           onSuccess={fetchDrivers}
//         />
//       )}

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
//               Gestión de Conductores (Sin Código)
//             </h2>
//             <span style={{ fontSize: "0.8rem", color: "#777" }}>
//               Mostrando <strong>{filteredDrivers.length}</strong> pendientes de código
//             </span>
//           </div>

//           <div style={{ display: "flex", gap: "10px" }}>
//             <div style={{ position: "relative", flex: 1 }}>
//               <input
//                 type="text"
//                 placeholder="Buscar por nombre o email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "10px 15px",
//                   borderRadius: "8px",
//                   border: "1px solid #ddd",
//                   fontSize: "0.9rem",
//                   outline: "none",
//                   boxSizing: "border-box"
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
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="admin-table">
//             <thead>
//               <tr>
//                 <th style={{ textAlign: "center" }}>Nombre</th>
//                 <th style={{ textAlign: "center" }}>Email</th>
//                 <th style={{ textAlign: "center" }}>Fecha Registro</th>
//                 <th style={{ textAlign: "center" }}>Estatus</th>
//                 <th style={{ textAlign: "center" }}>Acción</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredDrivers.map((d) => {
//                 const esNuevo = !d.repartidor_id;
//                 const esSuspendido = d.is_active === "suspendido";
//                 const esActivo = d.is_active === "activo";

//                 return (
//                   <tr
//                     key={d.usuario_id}
//                     onClick={() => handleRowClick(d)}
//                     style={{ cursor: "pointer", transition: "background-color 0.2s" }}
//                     className="clickable-row"
//                     title="Hacer clic para ver expediente completo"
//                   >
//                     <td style={{ textAlign: "center", fontWeight: "bold", fontSize: "0.95rem" }}>
//                       {d.nombre}
//                     </td>

//                     <td style={{ fontSize: "0.85rem", textAlign: "center" }}>{d.email}</td>

//                     {/* FECHA DE REGISTRO */}
//                     <td style={{ textAlign: "center", fontSize: "0.85rem", color: "#555" }}>
//                       {formatDate(d.fecha_creacion)}
//                     </td>

//                     {/* ESTATUS + INDICADOR DE VERIFICACIÓN */}
//                     <td style={{ textAlign: "center", width: "1%" }}>
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
//                         <span
//                           style={{
//                             padding: "4px 4px",
//                             borderRadius: "5px",
//                             fontSize: "11px",
//                             fontWeight: "bold",
//                             width: "110px",
//                             display: "inline-block",
//                             textAlign: "center",
//                             textTransform: "uppercase",
//                             border: "1px solid #ccc",
//                             backgroundColor: esNuevo ? "#f0f0f0" : esSuspendido ? "#ffebee" : "#e8f5e9",
//                             color: esNuevo ? "#666" : esSuspendido ? "#c62828" : "#2e7d32",
//                           }}
//                         >
//                           {esNuevo ? "PENDIENTE" : d.is_active}
//                         </span>

//                         {/* SUB-BADGE: ESTADO DE VERIFICACIÓN SI ES PENDIENTE */}
//                         {esNuevo && (
//                           <span
//                             style={{
//                               fontSize: "9px",
//                               fontWeight: "bold",
//                               padding: "2px 6px",
//                               borderRadius: "4px",
//                               backgroundColor: d.verificado ? "#e3f2fd" : "#fff3e0",
//                               color: d.verificado ? "#1565c0" : "#e65100",
//                               border: d.verificado ? "1px solid #90caf9" : "1px solid #ffe0b2",
//                               width: "110px",
//                               boxSizing: "border-box"
//                             }}
//                           >
//                             {d.verificado ? "✓ VERIFICADO" : "POR VERIFICAR"}
//                           </span>
//                         )}
//                       </div>
//                     </td>

//                     <td 
//                       style={{ textAlign: "center", width: "1%" }}
//                       onClick={(e) => e.stopPropagation()} // Evita abrir el modal de detalle al interactuar con los botones
//                     >
//                       <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
//                         {esNuevo && (
//                           <button
//                             className="btn-success"
//                             style={{ fontSize: "0.7rem", padding: "6px 12px", minWidth: "90px", borderRadius: "4px" }}
//                             onClick={() => {
//                               setSelectedDriver(d);
//                               setShowModal(true);
//                             }}
//                           >
//                             Registrar
//                           </button>
//                         )}

//                         {esActivo && (
//                           <button
//                             className="btn-primary"
//                             style={{ fontSize: "0.7rem", padding: "6px 12px", minWidth: "90px", borderRadius: "4px" }}
//                             onClick={() => handleAction(d, "suspender")}
//                           >
//                             Suspender
//                           </button>
//                         )}

//                         {esSuspendido && (
//                           <button
//                             style={{
//                               fontSize: "0.7rem",
//                               padding: "6px 12px",
//                               minWidth: "90px",
//                               backgroundColor: "#00BFFF",
//                               color: "#fff",
//                               border: "none",
//                               borderRadius: "4px",
//                               fontWeight: "bold",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => handleAction(d, "activar")}
//                           >
//                             Activar
//                           </button>
//                         )}

//                         {!esNuevo && (
//                           <button
//                             style={{
//                               fontSize: "0.7rem",
//                               padding: "6px 12px",
//                               minWidth: "90px",
//                               backgroundColor: "#2c3e50",
//                               color: "#fff",
//                               border: "none",
//                               borderRadius: "4px",
//                               fontWeight: "bold",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => {
//                               setSelectedDriver(d);
//                               setShowModal(true);
//                             }}
//                           >
//                             Editar
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {filteredDrivers.length === 0 && (
//           <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
//             No se encontraron conductores sin código.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDriverVerification;

