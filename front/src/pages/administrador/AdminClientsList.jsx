// Ruta: ruta/a/tu/AdminClientsList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminClientsList = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'verified', 'unverified'

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/admin/clients`, { withCredentials: true });
                setClients(res.data);
            } catch (error) {
                console.error("Error al obtener clientes:", error);
            }
        };
        fetchClients();
    }, []);

    // Lógica combinada de filtrado: Texto + Estado de Verificación
    const filtered = clients.filter(c => {
        const matchesText = 
            (c.nombre && c.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const isVerified = Boolean(c.verificado);

        let matchesStatus = true;
        if (statusFilter === "verified") {
            matchesStatus = isVerified === true;
        } else if (statusFilter === "unverified") {
            matchesStatus = isVerified === false;
        }

        return matchesText && matchesStatus;
    });

    // Estilos de las etiquetas de estado
    const badgeStyle = {
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
        display: "inline-block"
    };

    const verifiedStyle = {
        ...badgeStyle,
        backgroundColor: "#d1fae5",
        color: "#065f46"
    };

    const notVerifiedStyle = {
        ...badgeStyle,
        backgroundColor: "#f3f4f6",
        color: "#1f293b"
    };

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px", backgroundColor: "#fff", borderBottom: "1px solid #eee" }}>
                <h2 style={{ color: "var(--color-primary)", marginBottom: "15px" }}>Directorio de Clientes</h2>
                
                {/* CONTENEDOR DE FILTROS: BUSCADOR Y DESPLEGABLE */}
                <div style={{ 
                    display: "flex", 
                    gap: "10px", 
                    marginBottom: "12px", 
                    flexWrap: "wrap" 
                }}>
                    <input 
                        type="text" 
                        placeholder="Buscar cliente por nombre o email..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            flex: "1 1 250px", 
                            padding: "10px", 
                            borderRadius: "8px", 
                            border: "1px solid #ddd",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    />

                    {/* FILTRO POR ESTADO DE VERIFICACIÓN */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            outline: "none",
                            backgroundColor: "#fff",
                            color: "#333",
                            fontWeight: "500",
                            cursor: "pointer",
                            minWidth: "160px"
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="verified">Verificados</option>
                        <option value="unverified">No Verificados</option>
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
                    <span>Mostrando <b>{filtered.length}</b> clientes</span>
                    <span>Total registrados: <b>{clients.length}</b></span>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>Nombre</th>
                        <th style={{ textAlign: "center" }}>Email</th>
                        <th style={{ textAlign: "center" }}>Teléfono</th>
                        <th style={{ textAlign: "center" }}>Estado</th>
                        <th style={{ textAlign: "center" }}>Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map(c => {
                            const isVerified = Boolean(c.verificado);

                            return (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {c.nombre}
                                    </td>
                                    <td>{c.email}</td>
                                    <td>{c.telefono || 'N/A'}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {isVerified ? (
                                            <span style={verifiedStyle}>Verificado</span>
                                        ) : (
                                            <span style={notVerifiedStyle}>No Verificado</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {c.fecha_creacion ? new Date(c.fecha_creacion).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                                No se encontraron clientes que coincidan con la búsqueda o el filtro seleccionado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminClientsList;
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AdminClientsList = () => {
//     const [clients, setClients] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");

//     useEffect(() => {
//         const fetchClients = async () => {
//             try {
//                 const res = await axios.get(`${API_BASE_URL}/admin/clients`, { withCredentials: true });
//                 setClients(res.data);
//             } catch (error) {
//                 console.error("Error al obtener clientes:", error);
//             }
//         };
//         fetchClients();
//     }, []);

//     const filtered = clients.filter(c => 
//         c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
//         c.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="admin-table-container">
//             <div style={{ padding: "20px", backgroundColor: "#fff", borderBottom: "1px solid #eee" }}>
//                 <h2 style={{ color: "var(--color-primary)", marginBottom: "10px" }}>Directorio de Clientes</h2>
                
//                 <input 
//                     type="text" 
//                     placeholder="Buscar cliente por nombre o email..." 
//                     className="search-input"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     style={{ 
//                         width: '100%', 
//                         padding: '10px', 
//                         marginBottom: '12px', 
//                         borderRadius: '8px', 
//                         border: '1px solid #ddd',
//                         outline: 'none'
//                     }}
//                 />

//                 {/* LÍNEA DE CONTEO */}
//                 <div style={{ 
//                     fontSize: "13px", 
//                     color: "#666", 
//                     display: "flex", 
//                     justifyContent: "space-between",
//                     padding: "0 5px" 
//                 }}>
//                     <span>Mostrando <b>{filtered.length}</b> clientes</span>
//                     <span>Total registrados: <b>{clients.length}</b></span>
//                 </div>
//             </div>

//             <table className="admin-table">
//                 <thead>
//                     <tr>
//                         <th style={{ textAlign: "center" }}>Nombre</th>
//                         <th style={{ textAlign: "center" }}>Email</th>
//                         <th style={{ textAlign: "center" }}>Teléfono</th>
//                         <th style={{ textAlign: "center" }}>Registro</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filtered.length > 0 ? (
//                         filtered.map(c => (
//                             <tr key={c.id}>
//                                 <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
//                                     {c.nombre}
//                                 </td>
//                                 <td>{c.email}</td>
//                                 <td>{c.telefono || 'N/A'}</td>
//                                 <td style={{ textAlign: "center" }}>
//                                     {new Date(c.fecha_creacion).toLocaleDateString()}
//                                 </td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
//                                 No se encontraron clientes que coincidan con la búsqueda.
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default AdminClientsList;

