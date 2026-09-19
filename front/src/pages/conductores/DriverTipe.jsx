import React, { useEffect, useState } from "react";
import axios from "axios";
import DriverDetailModal from "./DriverDetailModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DriverTipe = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoConductorFilter, setTipoConductorFilter] = useState("todos");
  const [tipoVehiculoFilter, setTipoVehiculoFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  // Estado para la vista de detalle
  const [showViewModal, setShowViewModal] = useState(false);
  const [driverToView, setDriverToView] = useState(null);

  // Carga de conductores y tipos de vehículos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/driver/getdrivers`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true })
      ]);

      setDrivers(driversRes.data || []);
      setVehicleTypes(vehiclesRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de filtrado
  const filteredDrivers = drivers.filter((d) => {
    const query = searchTerm.toLowerCase();

    // Coincidencia por Búsqueda (Nombre, Email, Código Conductor)
    const coincideBusqueda =
      (d.nombre && d.nombre.toLowerCase().includes(query)) ||
      (d.email && d.email.toLowerCase().includes(query)) ||
      (d.codigo_conductor && d.codigo_conductor.toLowerCase().includes(query));

    // Coincidencia por Tipo de Conductor
    const conductorTipo = (d.tipo_conductor || d.tipo || "").toLowerCase();
    const coincideTipoConductor =
      tipoConductorFilter === "todos" || conductorTipo === tipoConductorFilter;

    // Coincidencia por Tipo de Vehículo ID
    const coincideTipoVehiculo =
      tipoVehiculoFilter === "todos" ||
      String(d.tipo_vehiculo_id) === String(tipoVehiculoFilter);

    return coincideBusqueda && coincideTipoConductor && coincideTipoVehiculo;
  });

  // Formateador de fecha
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowClick = (driver) => {
    setDriverToView(driver);
    setShowViewModal(true);
  };

  return (
    <div className="content-area">
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
              Consulta de Conductores
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#777" }}>
              Mostrando <strong>{filteredDrivers.length}</strong> de{" "}
              {drivers.length}
            </span>
          </div>

          {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Campo de Búsqueda */}
            <div style={{ position: "relative", flex: "1 1 250px" }}>
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
                  boxSizing: "border-box",
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

            {/* Filtro Tipo Conductor */}
            <select
              value={tipoConductorFilter}
              onChange={(e) => setTipoConductorFilter(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="todos">Todos los Tipos</option>
              <option value="interno">Internos</option>
              <option value="foraneo">Foráneos</option>
            </select>

            {/* Filtro Tipo Vehículo */}
            <select
              value={tipoVehiculoFilter}
              onChange={(e) => setTipoVehiculoFilter(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="todos">Todos los Vehículos</option>
              {vehicleTypes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.descript}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLA DE CONDUCTORES */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Código</th>
                <th style={{ textAlign: "center" }}>Nombre</th>
                <th style={{ textAlign: "center" }}>Email</th>
                <th style={{ textAlign: "center" }}>Tipo Conductor</th>
                <th style={{ textAlign: "center" }}>Vehículo</th>
                <th style={{ textAlign: "center" }}>Fecha Registro</th>
                <th style={{ textAlign: "center" }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => {
                const esNuevo = !d.repartidor_id;
                const esSuspendido = d.is_active === "suspendido";

                return (
                  <tr
                    key={d.usuario_id}
                    onClick={() => handleRowClick(d)}
                    style={{ cursor: "pointer" }}
                    className="clickable-row"
                  >
                    {/* CÓDIGO */}
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "var(--color-primary)",
                      }}
                    >
                      {d.codigo_conductor || "--"}
                    </td>

                    {/* NOMBRE */}
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {d.nombre}
                    </td>

                    {/* EMAIL */}
                    <td style={{ fontSize: "0.85rem", textAlign: "center" }}>
                      {d.email}
                    </td>

                    {/* TIPO CONDUCTOR */}
                    <td style={{ textAlign: "center", textTransform: "capitalize" }}>
                      {d.tipo_conductor || d.tipo || "--"}
                    </td>

                    {/* TIPO VEHÍCULO */}
                    <td style={{ textAlign: "center" }}>
                      {d.tipo_vehiculo || d.vehiculo || "--"}
                    </td>

                    {/* FECHA DE REGISTRO */}
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: "0.85rem",
                        color: "#555",
                      }}
                    >
                      {formatDate(d.fecha_creacion)}
                    </td>

                    {/* ESTATUS */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          display: "inline-block",
                          textAlign: "center",
                          textTransform: "uppercase",
                          border: "1px solid #ccc",
                          backgroundColor: esNuevo
                            ? "#f0f0f0"
                            : esSuspendido
                            ? "#ffebee"
                            : "#e8f5e9",
                          color: esNuevo
                            ? "#666"
                            : esSuspendido
                            ? "#c62828"
                            : "#2e7d32",
                        }}
                      >
                        {esNuevo ? "PENDIENTE" : d.is_active}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MENSAJE CUANDO NO HAY REGISTROS */}
        {!loading && filteredDrivers.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            No se encontraron conductores con los criterios seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTipe;