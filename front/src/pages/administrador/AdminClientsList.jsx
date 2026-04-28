import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminClientsList = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchClients = async () => {
            const res = await axios.get(`${API_BASE_URL}/admin/clients`, { withCredentials: true });
            setClients(res.data);
        };
        fetchClients();
    }, []);

    const filtered = clients.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px", backgroundColor: "#fff" }}>
                <h2 style={{ color: "var(--color-primary)" }}>Directorio de Clientes</h2>
                <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    className="search-input"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c.id}>
                            <td style={{ fontWeight: 'bold' }}>{c.nombre}</td>
                            <td>{c.email}</td>
                            <td>{c.telefono || 'N/A'}</td>
                            <td>{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminClientsList;