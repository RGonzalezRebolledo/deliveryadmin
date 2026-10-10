import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminActiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [loadingId, setLoadingId] = useState(null);
    const [now, setNow] = useState(new Date());

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
        const timerInterval = setInterval(() => setNow(new Date()), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, []);

    // Función para calcular tiempo transcurrido / restante
    const renderTimeStatus = (order) => {
        if (order.estado === "asignado" && order.fecha_limite_confirmacion) {
            const limit = new Date(order.fecha_limite_confirmacion);
            const diffMs = limit - now;

            if (diffMs > 0) {
                const mins = Math.floor(diffMs / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                return (
                    <span style={{ color: "#d97706", fontWeight: "bold", fontSize: "11px" }}>
                        ⏳ {mins}:{secs < 10 ? `0${secs}` : secs} min
                    </span>
                );
            } else {
                return (
                    <span style={{ color: "#dc2626", fontWeight: "bold", fontSize: "11px" }}>
                        ⚠️ Expirando...
                    </span>
                );
            }
        }

        if (order.fecha_pedido) {
            const created = new Date(order.fecha_pedido);
            const elapsedMins = Math.floor((now - created) / 60000);
            return (
                <span style={{ color: "#6b7280", fontSize: "11px" }}>
                    ⏱️ Hace {elapsedMins} min
                </span>
            );
        }

        return <span style={{ fontSize: "11px", color: "#aaa" }}>--</span>;
    };

    // Función para desvincular conductor
    const handleUnassignOrder = async (orderId, driverName) => {
        const confirmMsg = `¿Estás seguro de quitar el servicio #${orderId} del conductor ${driverName || 'asignado'}?\n\nEl servicio volverá a estado PENDIENTE para ser asignado a otro conductor.`;
        
        if (!window.confirm(confirmMsg)) return;

        setLoadingId(orderId);
        try {
            await axios.post(
                `${API_BASE_URL}/admin/unassign-order`,
                { pedidoId: orderId },
                { withCredentials: true }
            );
            alert(`✅ Servicio #${orderId} desvinculado correctamente.`);
            fetchOrders();
        } catch (error) {
            console.error("Error al desvincular el servicio:", error);
            const apiError = error.response?.data?.error || "No se pudo desvincular el servicio.";
            alert(`⚠️ Error: ${apiError}`);
        } finally {
            setLoadingId(null);
        }
    };

    // Estilos de estatus
    const getStatusStyles = (status) => {
        switch ((status || "").toLowerCase()) {
            case 'pendiente':
                return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' };
            case 'asignado':
                return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' };
            case 'en_camino':
                return { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' };
            case 'entregado':
                return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
            default:
                return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
        }
    };

    const filteredOrders = orders.filter(o => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
            o.id.toString().includes(query) || 
            (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(query)) ||
            (o.codigo_conductor && o.codigo_conductor.toLowerCase().includes(query)) ||
            (o.tipo_vehiculo && o.tipo_vehiculo.toLowerCase().includes(query));

        const matchesStatus = statusFilter === "todos" || o.estado === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-table-container">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", backgroundColor: "#fff" }}>
                <h3 style={{ color: "var(--color-primary)", marginBottom: "10px", fontSize: "16px", fontWeight: "700" }}>
                    Servicios en Curso
                </h3>
                
                {/* BARRA DE BÚSQUEDA Y FILTRO */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por Nro Pedido, Cliente, Vehículo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 2,
                            minWidth: "200px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            outline: "none",
                            fontSize: "12px"
                        }}
                    />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: "140px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            backgroundColor: "white",
                            cursor: "pointer",
                            fontSize: "12px"
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
                    fontSize: "11px", 
                    color: "#666", 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "0 2px"
                }}>
                    <span>Mostrando <b>{filteredOrders.length}</b> servicios</span>
                    <span>Total activos: <b>{orders.length}</b></span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="admin-table" style={{ fontSize: "12px" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>ID</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Vehículo</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Cliente</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Estatus</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Rechazos</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Tiempo</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Monto</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Código</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Conductor</th>
                            <th style={{ textAlign: "center", padding: "8px 10px", fontSize: "11px" }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(o => {
                                const styles = getStatusStyles(o.estado);
                                const isUnassignable = (o.estado === 'asignado' || o.estado === 'en_camino') && o.repartidor_nombre;
                                const totalRechazos = o.total_rechazos || 0;

                                return (
                                    <tr key={o.id} style={{ height: "36px" }}>
                                        {/* ID PEDIDO */}
                                        <td style={{ fontWeight: 'bold', textAlign: "center", color: "var(--color-primary)", padding: "6px 8px" }}>
                                            #{o.id}
                                        </td>

                                        {/* TIPO DE VEHÍCULO */}
                                        <td style={{ textAlign: "center", fontWeight: "600", textTransform: "capitalize", padding: "6px 8px" }}>
                                            {o.tipo_vehiculo || "--"}
                                        </td>

                                        {/* CLIENTE */}
                                        <td style={{ textAlign: "center", padding: "6px 8px" }}>{o.cliente_nombre}</td>

                                        {/* ESTATUS */}
                                        <td style={{ textAlign: "center", padding: "6px 8px" }}>
                                            <span style={{ 
                                                padding: '3px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '10px', 
                                                fontWeight: 'bold', 
                                                backgroundColor: styles.bg, 
                                                color: styles.color,
                                                border: `1px solid ${styles.border}`,
                                                textTransform: 'uppercase',
                                                display: 'inline-block',
                                                minWidth: '75px'
                                            }}>
                                                {(o.estado || "").replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* RECHAZOS */}
                                        <td style={{ textAlign: "center", padding: "6px 8px" }}>
                                            <span style={{
                                                padding: "2px 6px",
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                backgroundColor: totalRechazos > 0 ? "#fee2e2" : "#f3f4f6",
                                                color: totalRechazos > 0 ? "#991b1b" : "#6b7280"
                                            }}>
                                                ❌ {totalRechazos}
                                            </span>
                                        </td>

                                        {/* TIEMPO DE ESPERA / CONFIRMACIÓN */}
                                        <td style={{ textAlign: "center", padding: "6px 8px" }}>
                                            {renderTimeStatus(o)}
                                        </td>

                                        {/* MONTO */}
                                        <td style={{ textAlign: "center", fontWeight: "600", color: "#000", padding: "6px 8px" }}>
                                            ${o.total_dolar} / Bs {o.total}
                                        </td>

                                        {/* CÓDIGO CONDUCTOR */}
                                        <td style={{ textAlign: "center", fontWeight: "bold", color: "#007bff", padding: "6px 8px" }}>
                                            {o.codigo_conductor || "--"}
                                        </td>

                                        {/* NOMBRE REPARTIDOR */}
                                        <td style={{ 
                                            textAlign: "center", 
                                            color: o.repartidor_nombre ? '#2e7d32' : '#d32f2f',
                                            fontWeight: o.repartidor_nombre ? "bold" : "normal",
                                            padding: "6px 8px"
                                        }}>
                                            {o.repartidor_nombre || 'Buscando...'}
                                        </td>

                                        {/* BOTÓN DESVINCULAR */}
                                        <td style={{ textAlign: "center", padding: "6px 8px" }}>
                                            {isUnassignable ? (
                                                <button
                                                    onClick={() => handleUnassignOrder(o.id, o.repartidor_nombre)}
                                                    disabled={loadingId === o.id}
                                                    style={{
                                                        backgroundColor: "#dc3545",
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "bold",
                                                        cursor: loadingId === o.id ? "not-allowed" : "pointer",
                                                        opacity: loadingId === o.id ? 0.6 : 1,
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    title="Quitar pedido al conductor y dejarlo disponible"
                                                >
                                                    {loadingId === o.id ? "..." : "Desvincular"}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: "11px", color: "#aaa" }}>--</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center", padding: "20px", color: "#999", fontSize: "12px" }}>
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

//     const fetchOrders = async () => {
//         try {
//             const res = await axios.get(`${API_BASE_URL}/admin/active-orders`, { withCredentials: true });
//             setOrders(res.data || []);
//         } catch (error) {
//             console.error("Error al obtener pedidos:", error);
//         }
//     };

//     useEffect(() => {
//         fetchOrders();
//         const interval = setInterval(fetchOrders, 10000);
//         return () => clearInterval(interval);
//     }, []);

//     // Función para definir los colores del estatus
//     const getStatusStyles = (status) => {
//         switch ((status || "").toLowerCase()) {
//             case 'pendiente':
//                 return { bg: '#fff3cd', color: '#856404', border: '#ffeeba' }; // Amarillo/Dorado
//             case 'asignado':
//                 return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }; // Azul claro
//             case 'en_camino':
//                 return { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' }; // Azul vibrante
//             case 'entregado':
//                 return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' }; // Gris
//             default:
//                 return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }; // Rojo
//         }
//     };

//     // Lógica de filtrado
//     const filteredOrders = orders.filter(o => {
//         const query = searchTerm.toLowerCase();
//         const matchesSearch = 
//             o.id.toString().includes(query) || 
//             (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(query)) ||
//             (o.codigo_conductor && o.codigo_conductor.toLowerCase().includes(query)) ||
//             (o.tipo_vehiculo && o.tipo_vehiculo.toLowerCase().includes(query));

//         const matchesStatus = statusFilter === "todos" || o.estado === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     return (
//         <div className="admin-table-container">
//             <div style={{ padding: "20px", borderBottom: "1px solid #eee", backgroundColor: "#fff" }}>
//                 <h2 style={{ color: "var(--color-primary)", marginBottom: "15px" }}>Servicios en Curso</h2>
                
//                 {/* BARRA DE BÚSQUEDA Y FILTRO */}
//                 <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
//                     <input 
//                         type="text" 
//                         placeholder="Buscar por Nro Pedido, Cliente, Vehículo o Código Conductor..." 
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             flex: 2,
//                             minWidth: "220px",
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
//                             minWidth: "160px",
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

//                 {/* LÍNEA DE CONTEO */}
//                 <div style={{ 
//                     fontSize: "13px", 
//                     color: "#666", 
//                     display: "flex", 
//                     justifyContent: "space-between",
//                     padding: "0 5px"
//                 }}>
//                     <span>Mostrando <b>{filteredOrders.length}</b> servicios en la lista</span>
//                     <span>Total activos: <b>{orders.length}</b></span>
//                 </div>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="admin-table">
//                     <thead>
//                         <tr>
//                             <th style={{ textAlign: "center" }}>ID Servicio</th>
//                             <th style={{ textAlign: "center" }}>Vehículo</th>
//                             <th style={{ textAlign: "center" }}>Cliente</th>
//                             <th style={{ textAlign: "center" }}>Estatus</th>
//                             <th style={{ textAlign: "center" }}>Monto</th>
//                             <th style={{ textAlign: "center" }}>Código</th>
//                             <th style={{ textAlign: "center" }}>Conductor</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredOrders.length > 0 ? (
//                             filteredOrders.map(o => {
//                                 const styles = getStatusStyles(o.estado);

//                                 return (
//                                     <tr key={o.id}>
//                                         {/* ID PEDIDO */}
//                                         <td style={{ fontWeight: 'bold', textAlign: "center", color: "var(--color-primary)" }}>
//                                             #{o.id}
//                                         </td>

//                                         {/* TIPO DE VEHÍCULO */}
//                                         <td style={{ textAlign: "center", fontWeight: "600", textTransform: "capitalize" }}>
//                                             {o.tipo_vehiculo || "--"}
//                                         </td>

//                                         {/* CLIENTE */}
//                                         <td style={{ textAlign: "center" }}>{o.cliente_nombre}</td>

//                                         {/* ESTATUS */}
//                                         <td style={{ textAlign: "center" }}>
//                                             <span style={{ 
//                                                 padding: '5px 10px', 
//                                                 borderRadius: '6px', 
//                                                 fontSize: '11px', 
//                                                 fontWeight: 'bold', 
//                                                 backgroundColor: styles.bg, 
//                                                 color: styles.color,
//                                                 border: `1px solid ${styles.border}`,
//                                                 textTransform: 'uppercase',
//                                                 display: 'inline-block',
//                                                 minWidth: '90px'
//                                             }}>
//                                                 {(o.estado || "").replace('_', ' ')}
//                                             </span>
//                                         </td>

//                                         {/* MONTO */}
//                                         <td style={{ textAlign: "center", fontWeight: "600", color: "#000" }}>
//                                             ${o.total_dolar} / Bs {o.total}
//                                         </td>

//                                         {/* CÓDIGO CONDUCTOR */}
//                                         <td style={{ textAlign: "center", fontWeight: "bold", color: "#007bff" }}>
//                                             {o.codigo_conductor || "--"}
//                                         </td>

//                                         {/* NOMBRE REPARTIDOR */}
//                                         <td style={{ 
//                                             textAlign: "center", 
//                                             color: o.repartidor_nombre ? '#2e7d32' : '#d32f2f',
//                                             fontWeight: o.repartidor_nombre ? "bold" : "normal"
//                                         }}>
//                                             {o.repartidor_nombre || 'Buscando Conductor...'}
//                                         </td>
//                                     </tr>
//                                 );
//                             })
//                         ) : (
//                             <tr>
//                                 <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
//                                     No se encontraron pedidos con esos criterios.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default AdminActiveOrders;
