import React from "react";

const PedidoDetalleModal = ({ pedido, onClose }) => {
  if (!pedido) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("es-VE");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Modal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.25rem" }}>
              Pedido #{pedido.nro_recibo || pedido.pedido_id}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Fecha: {formatDate(pedido.fecha_pedido)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            ✕
          </button>
        </div>

        {/* Montos y Estatus */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Total USD</span>
            <strong style={{ color: "#16a34a", fontSize: "1.1rem" }}>
              ${Number(pedido.total_dolar || 0).toFixed(2)}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Total Bs</span>
            <strong style={{ color: "#1e293b", fontSize: "1.1rem" }}>
              {Number(pedido.total || 0).toFixed(2)} Bs.
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Estado</span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: pedido.estado === "entregado" || pedido.estado === "finalizado" ? "#166534" : "#9a3412",
              }}
            >
              {pedido.estado}
            </span>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#334155" }}>👤 Cliente</h4>
          <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}><strong>Nombre:</strong> {pedido.cliente_nombre || "N/A"}</p>
            <p style={{ margin: 0 }}><strong>Teléfono:</strong> {pedido.cliente_telefono || "N/A"}</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> {pedido.cliente_email || "N/A"}</p>
          </div>
        </div>

        {/* Datos del Repartidor */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#334155" }}>🛵 Repartidor</h4>
          <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}><strong>Nombre:</strong> {pedido.repartidor_nombre || "Sin Asignar"}</p>
            <p style={{ margin: 0 }}><strong>Código:</strong> {pedido.repartidor_codigo || "N/A"}</p>
            <p style={{ margin: 0 }}><strong>Teléfono:</strong> {pedido.repartidor_telefono || "N/A"}</p>
          </div>
        </div>

        {/* Direcciones */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#334155" }}>📍 Direcciones</h4>
          <div style={{ fontSize: "0.85rem", color: "#475569", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px" }}>
              <strong>Origen ({pedido.municipio_origen || "N/A"}):</strong> {pedido.direccion_origen_texto || "N/A"}
              {pedido.direccion_origen_ref && <small style={{ display: "block", color: "#64748b" }}>Ref: {pedido.direccion_origen_ref}</small>}
            </div>
            <div style={{ padding: "8px", backgroundColor: "#f1f5f9", borderRadius: "8px" }}>
              <strong>Destino ({pedido.municipio_destino || "N/A"}):</strong> {pedido.direccion_destino_texto || "N/A"}
              {pedido.direccion_destino_ref && <small style={{ display: "block", color: "#64748b" }}>Ref: {pedido.direccion_destino_ref}</small>}
            </div>
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#334155" }}>ℹ️ Información Adicional</h4>
          <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
            <p style={{ margin: 0 }}><strong>Servicio:</strong> {pedido.tipo_servicio || "Estándar"}</p>
            <p style={{ margin: 0 }}><strong>Vehículo:</strong> {pedido.tipo_vehiculo || "N/A"}</p>
            <p style={{ margin: 0 }}><strong>Pago Confirmado:</strong> {pedido.pago_confirmado ? "Sí" : "No"}</p>
            {pedido.fecha_entrega && <p style={{ margin: 0 }}><strong>Fecha Entrega:</strong> {formatDate(pedido.fecha_entrega)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoDetalleModal;