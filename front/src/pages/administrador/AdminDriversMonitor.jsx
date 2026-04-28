import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDriversMonitor = () => {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchStatus = async () => {
            const res = await axios.get(`${API_BASE_URL}/admin/drivers-status`, { withCredentials: true });
            setDrivers(res.data);
        };
        fetchStatus();
    }, []);

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "var(--color-primary)" }}>Monitor de Flota Activa</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Repartidor</th>
                        <th>Vehículo</th>
                        <th>Disponibilidad</th>
                        <th>Pedido Asignado</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((d, index) => (
                        <tr key={index}>
                            <td>
                                <strong>{d.nombre}</strong><br/>
                                <small>{d.telefono}</small>
                            </td>
                            <td>{d.vehiculo}</td>
                            <td>
                                <span style={{ color: d.is_available ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                                    {d.is_available ? '● DISPONIBLE' : '● OCUPADO/OFFLINE'}
                                </span>
                            </td>
                            <td>
                                {d.tiene_pedido ? (
                                    <span style={{ backgroundColor: '#fff3cd', padding: '5px', borderRadius: '5px', border: '1px solid #ffeeba' }}>
                                        📦 Pedido #{d.pedido_actual_id}
                                    </span>
                                ) : 'Ninguno'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDriversMonitor;