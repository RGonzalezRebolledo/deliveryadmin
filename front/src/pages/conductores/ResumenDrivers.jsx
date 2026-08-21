import React, { useEffect, useState } from "react";
import axios from "axios";
import DriverRegisterModal from "./DriverRegisterModal";
import DriverDetailModal from "./DriverDetailModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDriverVerification = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
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

  const filteredDrivers = drivers.filter((d) => {
    const query = searchTerm.toLowerCase();
    const estatusReal = !d.repartidor_id
      ? "pendiente"
      : d.is_active.toLowerCase();

    // Búsqueda por nombre, email o código de conductor
    const coincideBusqueda =
      (d.nombre && d.nombre.toLowerCase().includes(query)) ||
      (d.email && d.email.toLowerCase().includes(query)) ||
      (d.codigo_conductor && d.codigo_conductor.toLowerCase().includes(query));

    const coincideEstatus =
      statusFilter === "todos" || estatusReal === statusFilter;

    return coincideBusqueda && coincideEstatus;
  });

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
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
              Gestión de Conductores
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredDrivers.length}</strong> de{" "}
              {drivers.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 3 }}>
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="todos">Todos los estatus</option>
              <option value="activo">Activos</option>
              <option value="suspendido">Suspendidos</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Código</th>
                <th style={{ textAlign: "center" }}>Nombre</th>
                <th style={{ textAlign: "center" }}>Email</th>
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
                  <tr key={d.usuario_id}>
                    {/* CELDA DE CÓDIGO DE CONDUCTOR */}
                    <td style={{ textAlign: "center", fontWeight: "bold", color: "var(--color-primary)" }}>
                      {d.codigo_conductor || "--"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => {
                          setDriverToView(d);
                          setShowViewModal(true);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          boxShadow: "none",
                          color: "#222",
                          textDecoration: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          padding: "8px 0",
                          margin: 0,
                          fontSize: "0.95rem",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
                        onMouseLeave={(e) => (e.target.style.color = "#222")}
                        title="Click para ver expediente completo"
                      >
                        {d.nombre}
                      </button>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{d.email}</td>

                    <td style={{ textAlign: "center", width: "1%" }}>
                      <span
                        style={{
                          padding: "4px 4px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          width: "100px",
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
                    </td>

                    <td style={{ textAlign: "center", width: "1%" }}>
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
            No se encontraron conductores.
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
// import DriverDetailModal from "./DriverDetailModal"; // IMPORTACIÓN DEL NUEVO COMPONENTE

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AdminDriverVerification = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("todos");
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

//   const filteredDrivers = drivers.filter((d) => {
//     const query = searchTerm.toLowerCase();
//     const estatusReal = !d.repartidor_id
//       ? "pendiente"
//       : d.is_active.toLowerCase();

//     const coincideBusqueda =
//       d.nombre.toLowerCase().includes(query) ||
//       d.email.toLowerCase().includes(query);
//     const coincideEstatus =
//       statusFilter === "todos" || estatusReal === statusFilter;

//     return coincideBusqueda && coincideEstatus;
//   });

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
//               Gestión de Conductores
//             </h2>
//             <span style={{ fontSize: "0.8rem", color: "#777" }}>
//               Mostrando <strong>{filteredDrivers.length}</strong> de{" "}
//               {drivers.length}
//             </span>
//           </div>

//           <div style={{ display: "flex", gap: "10px" }}>
//             <div style={{ position: "relative", flex: 3 }}>
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

//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               style={{
//                 flex: 1,
//                 padding: "10px",
//                 borderRadius: "8px",
//                 border: "1px solid #ddd",
//                 fontSize: "0.9rem",
//                 outline: "none",
//                 backgroundColor: "#fff",
//                 cursor: "pointer",
//               }}
//             >
//               <option value="todos">Todos los estatus</option>
//               <option value="activo">Activos</option>
//               <option value="suspendido">Suspendidos</option>
//               <option value="pendiente">Pendientes</option>
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="admin-table">
//             <thead>
//               <tr>
//                 <th style={{ textAlign: "center" }}>ID</th> {/* COLUMNA AGREGADA */}
//                 <th style={{ textAlign: "center" }}>Nombre</th>
//                 <th style={{ textAlign: "center" }}>Email</th>
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
//                   <tr key={d.usuario_id}>
//                     {/* CELDA DE ID AGREGADA */}
//                     <td style={{ textAlign: "center", fontWeight: "bold", color: "#666" }}>
//                         #{d.usuario_id}
//                     </td>
//                     <td style={{ textAlign: "center" }}>
//                       <button
//                         onClick={() => {
//                           setDriverToView(d);
//                           setShowViewModal(true);
//                         }}
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             width: "100%",
//                             background: "transparent", 
//                             border: "none",
//                             outline: "none",
//                             boxShadow: "none",
//                             color: "#222",
//                             textDecoration: "none",
//                             cursor: "pointer",
//                             fontWeight: "bold",
//                             padding: "8px 0",
//                             margin: 0,
//                             fontSize: "0.95rem",
//                             transition: "color 0.2s"
//                         }}
//                         onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
//                         onMouseLeave={(e) => (e.target.style.color = "#222")}
//                         title="Click para ver expediente completo"
//                       >
//                         {d.nombre}
//                       </button>
//                     </td>
//                     <td style={{ fontSize: "0.85rem" }}>{d.email}</td>

//                     <td style={{ textAlign: "center", width: "1%" }}>
//                       <span
//                         style={{
//                           padding: "4px 4px",
//                           borderRadius: "5px",
//                           fontSize: "11px",
//                           fontWeight: "bold",
//                           width: "100px",
//                           display: "inline-block",
//                           textAlign: "center",
//                           textTransform: "uppercase",
//                           border: "1px solid #ccc",
//                           backgroundColor: esNuevo ? "#f0f0f0" : esSuspendido ? "#ffebee" : "#e8f5e9",
//                           color: esNuevo ? "#666" : esSuspendido ? "#c62828" : "#2e7d32",
//                         }}
//                       >
//                         {esNuevo ? "PENDIENTE" : d.is_active}
//                       </span>
//                     </td>

//                     <td style={{ textAlign: "center", width: "1%" }}>
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
//             No se encontraron conductores.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDriverVerification;
