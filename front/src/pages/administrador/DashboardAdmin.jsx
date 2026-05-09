import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Petición GET con axios y credenciales para seguridad
        const res = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
          withCredentials: true,
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error al cargar estadísticas de Gazzella:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--color-primary)",
        }}
      >
        <h3>Cargando métricas de Gazzella Express...</h3>
      </div>
    );

  if (!stats)
    return (
      <div className="admin-table-container text-center p-10">
        Error de conexión.
      </div>
    );

  return (
    <div className="admin-table-container">
      {/* ENCABEZADO */}
      <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
        <h2 style={{ color: "var(--color-primary)", margin: 0 }}>
          Panel de Control Financiero
        </h2>
        <small>Resumen de operaciones y liquidaciones en tiempo real</small>
      </div>

      {/* TARJETAS DE MÉTRICAS CON DOBLE MONEDA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          padding: "20px",
          // background: "#f8f9fa"
          // background: 'var(--color-background)'
        }}
      >
        {/* Ganancias Gazzella */}
        <div
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #2ecc71",
          }}
        >
          <small style={{ color: "#888", fontWeight: "bold" }}>
            GANANCIAS APP (MES)
          </small>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#27ae60" }}
          >
            ${Number(stats.gananciasGazzella.total_usd_ganado || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            {Number(
              stats.gananciasGazzella.total_bs_ganado || 0
            ).toLocaleString("es-VE", { minimumFractionDigits: 2 })}{" "}
            Bs.
          </div>
        </div>

        {/* Deuda con Repartidores */}
        <div
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #e67e22",
          }}
        >
          <small style={{ color: "#888", fontWeight: "bold" }}>
            DEUDA CON REPARTIDORES
          </small>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#d35400" }}
          >
            ${Number(stats.pagosPendientes.total_usd_pendiente || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            {Number(
              stats.pagosPendientes.total_bs_pendiente || 0
            ).toLocaleString("es-VE", { minimumFractionDigits: 2 })}{" "}
            Bs.
          </div>
        </div>

        {/* Cantidad de Pedidos */}
        <div
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderLeft: "4px solid var(--color-primary)",
          }}
        >
          <small style={{ color: "#888", fontWeight: "bold" }}>
            PEDIDOS DEL MES
          </small>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--color-primary)",
            }}
          >
            {stats.pedidosMes.total_pedidos}
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            {stats.pedidosMes.completados} Entregados
            <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
              {stats.pedidosMes.terminado} Finalizados
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO DE TENDENCIA */}
      {/* <div style={{ padding: "20px", height: "350px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "20px", color: "#555" }}>Tendencia de Ventas (15 días)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.historicoVentas}>
                        <defs>
                            <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="fecha" tick={{fontSize: 12, fill: '#888'}} axisLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#888'}} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="monto_usd" stroke="#2ecc71" fillOpacity={1} fill="url(#colorUsd)" name="Ventas USD" />
                        <Line type="monotone" dataKey="total_pedidos" stroke="var(--color-primary)" strokeWidth={2} name="Pedidos" />
                    </AreaChart>
                </ResponsiveContainer>
            </div> */}

      {/* TABLA DE REPARTIDORES */}
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#555" }}>
          Rendimiento de Repartidores
        </h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Repartidor</th>
              <th style={{ textAlign: "center" }}>Entregas</th>
              <th style={{ textAlign: "right" }}>Total Ganado ($)</th>
            </tr>
          </thead>
          <tbody>
            {stats.topRepartidores.map((rep, index) => (
              <tr key={index}>
                <td>
                  <strong>{rep.nombre}</strong>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      background: "#e1f5fe",
                      color: "#0288d1",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {rep.entregas}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    color: "#27ae60",
                    fontWeight: "bold",
                  }}
                >
                  ${Number(rep.ganado_usd).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
