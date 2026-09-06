// Ruta: ruta/a/tu/AdminClientsList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminClientsList = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filtered = clients.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Estilos para las etiquetas de estado
    const badgeStyle = {
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase"
    };

    const verifiedStyle = {
        ...badgeStyle,
        backgroundColor: "#d1fae5", // Verde claro
        color: "#065f46"            // Verde oscuro
    };

    const notVerifiedStyle = {
        ...badgeStyle,
        backgroundColor: "#f3f4f6", // Gris claro
        color: "#1f293b"            // Gris oscuro
    };

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px", backgroundColor: "#fff", borderBottom: "1px solid #eee" }}>
                <h2 style={{ color: "var(--color-primary)", marginBottom: "10px" }}>Directorio de Clientes</h2>
                
                <input 
                    type="text" 
                    placeholder="Buscar cliente por nombre o email..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        marginBottom: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        outline: 'none',
                        boxSizing: 'border-box' // Asegura que el padding no afecte el ancho total
                    }}
                />

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
                        <th style={{ textAlign: "center" }}>Estado</th> {/* <--- NUEVA CABECERA */}
                        <th style={{ textAlign: "center" }}>Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                    {c.nombre}
                                </td>
                                <td>{c.email}</td>
                                <td>{c.telefono || 'N/A'}</td>
                                {/* NUEVA CELDA CON LÓGICA DE VERIFICACIÓN */}
                                <td style={{ textAlign: "center" }}>
                                    {c.verificado ? (
                                        <span style={verifiedStyle}>Verificado</span>
                                    ) : (
                                        <span style={notVerifiedStyle}>No Verificado</span>
                                    )}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    {new Date(c.fecha_creacion).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* Actualizado colSpan a 5 */}
                            <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                                No se encontraron clientes que coincidan con la búsqueda.
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

