import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminActiveOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await axios.get(`${API_BASE_URL}/admin/active-orders`, { withCredentials: true });
            setOrders(res.data);
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Auto-refresco cada 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="admin-table-container">
            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "var(--color-primary)" }}>Pedidos en Curso</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Estatus</th>
                        <th>Monto</th>
                        <th>Repartidor</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id}>
                            <td style={{ fontWeight: 'bold' }}>#{o.id}</td>
                            <td>{o.cliente_nombre}</td>
                            <td>
                                <span className={`status-pill pill-${o.estado}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#1976d2', textTransform: 'uppercase' }}>
                                    {o.estado}
                                </span>
                            </td>
                            <td>${o.total_dolar} / Bs {o.total}</td>
                            <td style={{ color: o.repartidor_nombre ? '#2e7d32' : '#d32f2f' }}>
                                {o.repartidor_nombre || 'Buscando...'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminActiveOrders;