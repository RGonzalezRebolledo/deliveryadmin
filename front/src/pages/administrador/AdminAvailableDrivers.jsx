import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminAvailableDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("todos");

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/managment/drivers/available`, { withCredentials: true });
                setDrivers(res.data);
            } catch (error) {
                console.error("Error al obtener conductores:", error);
            }
        };
        fetchDrivers();
        const interval = setInterval(fetchDrivers, 10000); 
        return () => clearInterval(interval);
    }, []);

    const getVehicleStyles = (type) => {
        switch (type.toLowerCase()) {
            case 'moto': return { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' };
            case 'carro': return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' };
            case 'bicicleta': return { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9' };
            default: return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
        }
    };

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = 
            d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            d.usuario_id.toString().includes(searchTerm);
        const matchesVehicle = vehicleFilter === "todos" || d.tipo_vehiculo.toLowerCase() === vehicleFilter.toLowerCase();
        return matchesSearch && matchesVehicle;
    });

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
                <h2 style={{ color: "var(--color-primary)", marginBottom: "15px" }}>Conductores en Línea</h2>
                
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, correo o ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
                    />
                    <select 
                        value={vehicleFilter}
                        onChange={(e) => setVehicleFilter(e.target.value)}
                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "white", cursor: "pointer" }}
                    >
                        <option value="todos">Todos los vehículos</option>
                        <option value="moto">Moto</option>
                        <option value="carro">Carro</option>
                        <option value="bicicleta">Bicicleta</option>
                    </select>
                </div>

                <div style={{ fontSize: "13px", color: "#666", display: "flex", justifyContent: "space-between", padding: "0 5px" }}>
                    <span>Mostrando <b>{filteredDrivers.length}</b> disponibles</span>
                    <span>Total en línea: <b>{drivers.length}</b></span>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th style={{ textAlign: "left" }}>Conductor</th>
                        <th style={{ textAlign: "left" }}>Correo Electrónico</th> {/* NUEVA COLUMNA */}
                        <th style={{ textAlign: "center" }}>Vehículo</th>
                        <th style={{ textAlign: "center" }}>Teléfono</th>
                        <th style={{ textAlign: "center" }}>Desde</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDrivers.length > 0 ? (
                        filteredDrivers.map(d => {
                            const styles = getVehicleStyles(d.tipo_vehiculo);
                            return (
                                <tr key={d.repartidor_id}>
                                    <td style={{ fontWeight: 'bold', textAlign: "center" }}>#{d.usuario_id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img 
                                                src={d.foto || '/default-avatar.png'} 
                                                alt="" 
                                                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <span style={{ fontWeight: "600" }}>{d.nombre}</span>
                                        </div>
                                    </td>
                                    {/* CELDA DE EMAIL SEPARADA */}
                                    <td style={{ color: "#666", fontSize: "13px" }}>
                                        {d.email || "Sin correo"}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', 
                                            backgroundColor: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
                                            textTransform: 'uppercase', minWidth: '80px', display: 'inline-block'
                                        }}>
                                            {d.tipo_vehiculo}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: "500", color: "#444" }}>
                                        {d.telefono}
                                    </td>
                                    <td style={{ textAlign: "center", color: "#666", fontSize: "13px" }}>
                                        {new Date(d.available_since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                                No hay conductores disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminAvailableDrivers;