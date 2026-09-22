import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminActiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [resettingId, setResettingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/active-orders`, { withCredentials: true });
            setOrders(res.data || []);
        } catch (error) {
            console.error("Error al obtener pedidos:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    // Función para liberar y reiniciar los conductores descartados de un pedido
    // const handleResetRejected = async (orderId) => {
    //     if (!window.confirm(`¿Deseas reiniciar la lista de conductores rechazados para el Pedido #${orderId}? Volverá a ofrecerse a todos los conductores disponibles respetando la cola.`)) {
    //         return;
    //     }

    //     setResettingId(orderId);
    //     try {
    //         await axios.put(
    //             `${API_BASE_URL}/admin/reset-rejected-drivers/${orderId}`,
    //             {},
    //             { withCredentials: true }
    //         );
    //         alert(`✅ Pedido #${orderId} liberado con éxito. Se reanudó la búsqueda de repartidores.`);
    //         fetchOrders();
    //     } catch (error) {
    //         alert(error.response?.data?.error || "Error al reiniciar el pedido.");
    //     } finally {
    //         setResettingId(null);
    //     }
    // };

    // Función para definir los colores del estatus
    const getStatusStyles = (status) => {
        switch ((status || "").toLowerCase()) {
            case 'pendiente':
                return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' }; // Amarillo/Dorado
            case 'asignado':
                return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }; // Azul claro
            case 'en_camino':
                return { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' }; // Azul vibrante
            case 'entregado':
                return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' }; // Gris
            default:
                return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }; // Rojo
        }
    };

    // Lógica de filtrado
    const filteredOrders = orders.filter(o => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            o.id.toString().includes(query) || 
            (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(query)) ||
            (o.codigo_conductor && o.codigo_conductor.toLowerCase().includes(query));

        const matchesStatus = statusFilter === "todos" || o.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px", borderBottom: "1px solid #eee", backgroundColor: "#fff" }}>
                <h2 style={{ color: "var(--color-primary)", marginBottom: "15px" }}>Servicios en Curso</h2>
                
                {/* BARRA DE BÚSQUEDA Y FILTRO */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por Nro Pedido, Cliente o Código Conductor..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 2,
                            minWidth: "220px",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            outline: "none"
                        }}
                    />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: "160px",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            backgroundColor: "white",
                            cursor: "pointer"
                        }}
                    >
                        <option value="todos">Todos los estatus</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="asignado">Asignado</option>
                        <option value="en_camino">En camino</option>
                    </select>
                </div>

                {/* LÍNEA DE CONTEO */}
                <div style={{ 
                    fontSize: "13px", 
                    color: "#666", 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "0 5px"
                }}>
                    <span>Mostrando <b>{filteredOrders.length}</b> servicios en la lista</span>
                    <span>Total activos: <b>{orders.length}</b></span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>ID Servicio</th>
                            <th style={{ textAlign: "center" }}>Vehículo</th>
                            <th style={{ textAlign: "center" }}>Cliente</th>
                            <th style={{ textAlign: "center" }}>Estatus</th>
                            <th style={{ textAlign: "center" }}>Monto</th>
                            <th style={{ textAlign: "center" }}>Código</th>
                            <th style={{ textAlign: "center" }}>Conductor</th>
                            {/* <th style={{ textAlign: "center" }}>Acción</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(o => {
                                const styles = getStatusStyles(o.estado);
                                const esPendiente = o.estado === "pendiente";

                                return (
                                    <tr key={o.id}>
                                        {/* ID PEDIDO */}
                                        <td style={{ fontWeight: 'bold', textAlign: "center", color: "var(--color-primary)" }}>
                                            #{o.id}
                                        </td>

                                        {/* TIPO DE VEHÍCULO */}
                                        <td style={{ textAlign: "center", fontWeight: "600" }}>
                                            {o.tipo_vehiculo || o.vehiculo_descript || "--"}
                                        </td>

                                        {/* CLIENTE */}
                                        <td style={{ textAlign: "center" }}>{o.cliente_nombre}</td>

                                        {/* ESTATUS */}
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{ 
                                                padding: '5px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                backgroundColor: styles.bg, 
                                                color: styles.color,
                                                border: `1px solid ${styles.border}`,
                                                textTransform: 'uppercase',
                                                display: 'inline-block',
                                                minWidth: '90px'
                                            }}>
                                                {(o.estado || "").replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* MONTO */}
                                        <td style={{ textAlign: "center", fontWeight: "600", color: "#000" }}>
                                            ${o.total_dolar} / Bs {o.total}
                                        </td>

                                        {/* CÓDIGO CONDUCTOR */}
                                        <td style={{ textAlign: "center", fontWeight: "bold", color: "#007bff" }}>
                                            {o.codigo_conductor || "--"}
                                        </td>

                                        {/* NOMBRE REPARTIDOR */}
                                        <td style={{ 
                                            textAlign: "center", 
                                            color: o.repartidor_nombre ? '#2e7d32' : '#d32f2f',
                                            fontWeight: o.repartidor_nombre ? "bold" : "normal"
                                        }}>
                                            {o.repartidor_nombre || 'Buscando Conductor...'}
                                        </td>

                                        {/* BOTÓN DE ACCIÓN / LIBERAR PEDIDO */}
                                        {/* <td style={{ textAlign: "center", width: "1%" }}>
                                            {esPendiente ? (
                                                <button
                                                    onClick={() => handleResetRejected(o.id)}
                                                    disabled={resettingId === o.id}
                                                    style={{
                                                        backgroundColor: "#27ae60",
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "6px 12px",
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "bold",
                                                        cursor: resettingId === o.id ? "not-allowed" : "pointer",
                                                        opacity: resettingId === o.id ? 0.6 : 1,
                                                        whiteSpace: "nowrap"
                                                    }}
                                                    title="Limpiar rechazados para volver a ofrecer este servicio a todos los conductores disponibles"
                                                >
                                                    {resettingId === o.id ? "Liberando..." : "🔄 Reasignar"}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: "0.75rem", color: "#aaa" }}>--</span>
                                            )}
                                        </td> */}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                                    No se encontraron pedidos con esos criterios.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminActiveOrders;

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AdminActiveOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [statusFilter, setStatusFilter] = useState("todos");

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 const res = await axios.get(`${API_BASE_URL}/admin/active-orders`, { withCredentials: true });
//                 setOrders(res.data);
//             } catch (error) {
//                 console.error("Error al obtener pedidos:", error);
//             }
//         };
//         fetchOrders();
//         const interval = setInterval(fetchOrders, 10000);
//         return () => clearInterval(interval);
//     }, []);

//     // Función para definir los colores del estatus (Actualizado con Azul para En Camino)
//     const getStatusStyles = (status) => {
//         switch (status.toLowerCase()) {
//             case 'pendiente':
//                 return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' }; // Amarillo/Dorado
//             case 'asignado':
//                 return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }; // Azul claro
//             case 'en_camino':
//                 return { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' }; // Azul vibrante (Nuevo)
//             case 'entregado':
//                 return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' }; // Gris
//             default:
//                 return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }; // Rojo (error/cancelado)
//         }
//     };

//     // Lógica de filtrado
//     const filteredOrders = orders.filter(o => {
//         const matchesSearch = o.id.toString().includes(searchTerm) || 
//                             o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === "todos" || o.estado === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     return (
//         <div className="admin-table-container">
//             <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
//                 <h2 style={{ color: "var(--color-primary)", marginBottom: "15px" }}>Pedidos en Curso</h2>
                
//                 {/* BARRA DE BÚSQUEDA Y FILTRO */}
//                 <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
//                     <input 
//                         type="text" 
//                         placeholder="Buscar por Nro Pedido o Cliente..." 
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             flex: 2,
//                             padding: "10px",
//                             borderRadius: "8px",
//                             border: "1px solid #ddd",
//                             outline: "none"
//                         }}
//                     />
//                     <select 
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         style={{
//                             flex: 1,
//                             padding: "10px",
//                             borderRadius: "8px",
//                             border: "1px solid #ddd",
//                             backgroundColor: "white",
//                             cursor: "pointer"
//                         }}
//                     >
//                         <option value="todos">Todos los estatus</option>
//                         <option value="pendiente">Pendiente</option>
//                         <option value="asignado">Asignado</option>
//                         <option value="en_camino">En camino</option>
//                     </select>
//                 </div>

//                 {/* LÍNEA DE CONTEO (Actualización solicitada) */}
//                 <div style={{ 
//                     fontSize: "13px", 
//                     color: "#666", 
//                     display: "flex", 
//                     justifyContent: "space-between",
//                     padding: "0 5px"
//                 }}>
//                     <span>Mostrando <b>{filteredOrders.length}</b> pedidos en la lista</span>
//                     <span>Total activos: <b>{orders.length}</b></span>
//                 </div>
//             </div>

//             <table className="admin-table">
//                 <thead>
//                     <tr>
//                         <th style={{ textAlign: "center" }}>ID Pedido</th>
//                         <th style={{ textAlign: "center" }}>Cliente</th>
//                         <th style={{ textAlign: "center" }}>Estatus</th>
//                         <th style={{ textAlign: "center" }}>Monto</th>
//                         <th style={{ textAlign: "center" }}>Repartidor</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredOrders.length > 0 ? (
//                         filteredOrders.map(o => {
//                             const styles = getStatusStyles(o.estado);
//                             return (
//                                 <tr key={o.id}>
//                                     <td style={{ fontWeight: 'bold', textAlign: "center" }}>#{o.id}</td>
//                                     <td style={{ textAlign: "center" }}>{o.cliente_nombre}</td>
//                                     <td style={{ textAlign: "center" }}>
//                                         <span style={{ 
//                                             padding: '5px 10px', 
//                                             borderRadius: '6px', 
//                                             fontSize: '11px', 
//                                             fontWeight: 'bold', 
//                                             backgroundColor: styles.bg, 
//                                             color: styles.color,
//                                             border: `1px solid ${styles.border}`,
//                                             textTransform: 'uppercase',
//                                             display: 'inline-block',
//                                             minWidth: '90px'
//                                         }}>
//                                             {o.estado.replace('_', ' ')}
//                                         </span>
//                                     </td>
//                                     <td style={{ textAlign: "center", fontWeight: "600", color: "#000" }}>
//                                         ${o.total_dolar} / Bs {o.total}
//                                     </td>
//                                     <td style={{ 
//                                         textAlign: "center", 
//                                         color: o.repartidor_nombre ? '#2e7d32' : '#d32f2f',
//                                         fontWeight: o.repartidor_nombre ? "bold" : "normal"
//                                     }}>
//                                         {o.repartidor_nombre || 'Buscando repartidor...'}
//                                     </td>
//                                 </tr>
//                             );
//                         })
//                     ) : (
//                         <tr>
//                             <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
//                                 No se encontraron pedidos con esos criterios.
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default AdminActiveOrders;

