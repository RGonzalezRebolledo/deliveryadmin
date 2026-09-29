import React from "react";

const PedidoDetalleModal = ({ pedido, onClose }) => {
  if (!pedido) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("es-VE");
  };

  const getBadgeStyle = (estado) => {
    switch (estado?.toLowerCase()) {
      case "entregado":
      case "finalizado":
        return { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" };
      case "en_camino":
      case "asignado":
        return { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
      default:
        return { bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
    }
  };

  const badge = getBadgeStyle(pedido.estado);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
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
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.25rem", fontWeight: 700 }}>
                Servicio #{pedido.pedido_id || pedido.id}
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                }}
              >
                {pedido.estado}
              </span>
            </div>
            <span style={{ fontSize: "0.825rem", color: "#64748b", marginTop: "4px", display: "block" }}>
              Registrado el {formatDate(pedido.fecha_pedido)}
            </span>
          </div>

          {/* Botón X transparente sin ningún borde ni círculo */}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              boxShadow: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
              color: "#64748b",
              fontWeight: "400",
              padding: "0",
              margin: "0",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Tarjeta Resumen Financiero */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              border: "1px solid #e2e8f0",
              textAlign: "left",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                Total USD
              </span>
              <strong style={{ color: "#16a34a", fontSize: "1.3rem", display: "block", marginTop: "2px" }}>
                ${Number(pedido.total_dolar || 0).toFixed(2)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                Total Bs.
              </span>
              <strong style={{ color: "#0f172a", fontSize: "1.3rem", display: "block", marginTop: "2px" }}>
                {Number(pedido.total || 0).toFixed(2)} Bs.
              </strong>
            </div>
          </div>

          {/* Grid Principal: Cliente y Repartidor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            
            {/* Sección Cliente */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                👤 <span>Cliente</span>
              </h4>
              <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><span style={{ color: "#64748b" }}>Nombre:</span> <strong>{pedido.cliente_nombre || "N/A"}</strong></div>
                <div><span style={{ color: "#64748b" }}>Teléfono:</span> {pedido.cliente_telefono || "N/A"}</div>
                <div><span style={{ color: "#64748b" }}>Email:</span> {pedido.cliente_email || "N/A"}</div>
              </div>
            </div>

            {/* Sección Repartidor */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                🛵 <span>Conductor</span>
              </h4>
              <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div><span style={{ color: "#64748b" }}>Nombre:</span> <strong>{pedido.repartidor_nombre || "Sin Asignar"}</strong></div>
                <div><span style={{ color: "#64748b" }}>Código:</span> {pedido.repartidor_codigo || "N/A"}</div>
                <div><span style={{ color: "#64748b" }}>Teléfono:</span> {pedido.repartidor_telefono || "N/A"}</div>
              </div>
            </div>

          </div>

          {/* Sección Direcciones */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              📍 <span>Ruta del Servicio</span>
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                  Origen ({pedido.municipio_origen || "N/A"})
                </span>
                <span style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: 500 }}>
                  {pedido.direccion_origen_texto || "Dirección no especificada"}
                </span>
                {pedido.direccion_origen_ref && (
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                    Ref: {pedido.direccion_origen_ref}
                  </span>
                )}
              </div>

              <div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                  Destino ({pedido.municipio_destino || "N/A"})
                </span>
                <span style={{ fontSize: "0.875rem", color: "#1e293b", fontWeight: 500 }}>
                  {pedido.direccion_destino_texto || "Dirección no especificada"}
                </span>
                {pedido.direccion_destino_ref && (
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                    Ref: {pedido.direccion_destino_ref}
                  </span>
                )}
              </div>
            </div>
          </div>

 {/* Información Adicional */}
<div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", backgroundColor: "#fff" }}>
  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
    ℹ️ <span>Detalles del Servicio</span>
  </h4>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "0.85rem", color: "#334155" }}>
    <div>
      <span style={{ color: "#64748b", display: "block" }}>Servicio</span> 
      <strong>{pedido.tipo_servicio || "No especificado"}</strong>
    </div>
    <div>
      <span style={{ color: "#64748b", display: "block" }}>Vehículo</span> 
      <strong>{pedido.tipo_vehiculo || "No especificado"}</strong>
    </div>
    <div>
      <span style={{ color: "#64748b", display: "block" }}>Pago Confirmado</span> 
      <strong>{pedido.pago_confirmado ? "Sí" : "No"}</strong>
    </div>
    {pedido.fecha_entrega && (
      <div style={{ gridColumn: "span 3", marginTop: "4px" }}>
        <span style={{ color: "#64748b" }}>Fecha de Entrega:</span> <strong>{formatDate(pedido.fecha_entrega)}</strong>
      </div>
    )}
  </div>
</div>

        </div>

        {/* Pie del Modal */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default PedidoDetalleModal;