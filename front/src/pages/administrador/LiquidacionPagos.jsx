import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function LiquidacionRepartidoresAdmin() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [drivers, setDrivers] = useState([]);
    const [selectedDriverIds, setSelectedDriverIds] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Tasa BCV / Mercado actual para el cálculo
    const [tasaBs, setTasaBs] = useState(40.00); 

    // Estado para Modal de Pago
    const [showModal, setShowModal] = useState(false);
    const [numeroReferencia, setNumeroReferencia] = useState('');

    useEffect(() => {
        fetchPendientes();
    }, []);

    const fetchPendientes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/liquidaciones/pendientes`, { withCredentials: true });
            setDrivers(res.data);
            setSelectedDriverIds([]);
        } catch (err) {
            Swal.fire('Error', 'No se pudieron cargar las liquidaciones pendientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Selección masiva
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDriverIds(drivers.map(d => d.repartidor_id));
        } else {
            setSelectedDriverIds([]);
        }
    };

    // Selección individual
    const handleSelectOne = (id) => {
        if (selectedDriverIds.includes(id)) {
            setSelectedDriverIds(selectedDriverIds.filter(item => item !== id));
        } else {
            setSelectedDriverIds([...selectedDriverIds, id]);
        }
    };

    // Obtener los IDs de todas las liquidaciones (filas de la BD) asociadas a los conductores seleccionados
    const getSelectedLiquidacionIds = () => {
        return drivers
            .filter(d => selectedDriverIds.includes(d.repartidor_id))
            .flatMap(d => d.liquidacion_ids);
    };

    // Totales calculados dinámicamente
    const selectedDriversData = drivers.filter(d => selectedDriverIds.includes(d.repartidor_id));
    const totalUSD = selectedDriversData.reduce((acc, curr) => acc + Number(curr.total_usd), 0);
    const totalBsCalculado = totalUSD * tasaBs;

    // Generación del Reporte PDF
    const handleExportPDF = () => {
        if (selectedDriversData.length === 0) {
            Swal.fire('Atención', 'Seleccione al menos un conductor para generar el PDF', 'warning');
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Gazzella Express - Relación de Pago a Conductores', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString()}`, 14, 22);
        doc.text(`Tasa de Cambio Aplicada: ${tasaBs.toFixed(2)} Bs/USD`, 14, 27);

        const tableColumn = ["Conductor", "Cédula", "Teléfono", "Pedidos", "Monto USD", "Monto a Pagar (Bs)"];
        const tableRows = selectedDriversData.map(d => [
            `${d.nombre} ${d.apellido}`,
            d.cedula || 'N/A',
            d.telefono || 'N/A',
            d.total_pedidos_pendientes,
            `$${Number(d.total_usd).toFixed(2)}`,
            `${(Number(d.total_usd) * tasaBs).toFixed(2)} Bs.`
        ]);

        doc.autoTable({
            startY: 32,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`Total en USD: $${totalUSD.toFixed(2)}`, 14, finalY);
        doc.text(`Total a Transferir (Bs): ${totalBsCalculado.toFixed(2)} Bs.`, 14, finalY + 6);

        doc.save(`Pago_Conductores_${Date.now()}.pdf`);
    };

    // Procesar Confirmación
    const handleConfirmarPago = async () => {
        const liquidacionIds = getSelectedLiquidacionIds();

        if (!numeroReferencia.trim()) {
            Swal.fire('Campo Requerido', 'Por favor ingrese el número de referencia del pago', 'warning');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/admin/liquidaciones/procesar-pago`, {
                liquidacionIds,
                numeroReferencia: numeroReferencia.trim(),
                tasaPagoBs: tasaBs
            }, { withCredentials: true });

            setShowModal(false);
            setNumeroReferencia('');
            Swal.fire('¡Éxito!', 'Pagos liquidados correctamente', 'success');
            fetchPendientes();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'No se pudo procesar el pago', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
                🛵 Liquidación y Pago a Conductores
            </h2>

            {/* Configuración de Tasa y Acciones Superior */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tasa Bs/USD:</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={tasaBs} 
                        onChange={(e) => setTasaBs(Number(e.target.value))}
                        style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleExportPDF}
                        disabled={selectedDriverIds.length === 0}
                        style={{ padding: '10px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: selectedDriverIds.length === 0 ? 0.5 : 1 }}
                    >
                        📄 Exportar PDF
                    </button>

                    <button 
                        onClick={() => setShowModal(true)}
                        disabled={selectedDriverIds.length === 0}
                        style={{ padding: '10px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: selectedDriverIds.length === 0 ? 0.5 : 1 }}
                    >
                        💳 Liquidar Seleccionados ({selectedDriverIds.length})
                    </button>
                </div>
            </div>

            {/* Tabla de Conductores */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={drivers.length > 0 && selectedDriverIds.length === drivers.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th style={{ padding: '12px 16px' }}>Conductor</th>
                            <th style={{ padding: '12px 16px' }}>Cédula</th>
                            <th style={{ padding: '12px 16px' }}>Pedidos Pendientes</th>
                            <th style={{ padding: '12px 16px' }}>Monto (USD)</th>
                            <th style={{ padding: '12px 16px' }}>Monto a Pagar (Bs)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Cargando datos...</td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No hay pagos pendientes de repartidores.</td></tr>
                        ) : (
                            drivers.map((d) => (
                                <tr key={d.repartidor_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedDriverIds.includes(d.repartidor_id)}
                                            onChange={() => handleSelectOne(d.repartidor_id)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{d.nombre} {d.apellido}</td>
                                    <td style={{ padding: '12px 16px' }}>{d.cedula || 'N/A'}</td>
                                    <td style={{ padding: '12px 16px' }}>{d.total_pedidos_pendientes}</td>
                                    <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 'bold' }}>${Number(d.total_usd).toFixed(2)}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{(Number(d.total_usd) * tasaBs).toFixed(2)} Bs.</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para ingresar Referencia de Pago */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
                        <h3 style={{ margin: '0 0 12px 0' }}>Procesar Liquidación</h3>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                            Vas a pagar a <strong>{selectedDriverIds.length}</strong> conductor(es) un total de <strong>{totalBsCalculado.toFixed(2)} Bs.</strong> (${totalUSD.toFixed(2)} USD).
                        </p>

                        <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Número de Referencia del Pago:</label>
                        <input 
                            type="text"
                            placeholder="Ej. 00123456"
                            value={numeroReferencia}
                            onChange={(e) => setNumeroReferencia(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleConfirmarPago} style={{ padding: '8px 16px', border: 'none', background: '#16a34a', color: '#fff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar y Pagar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiquidacionRepartidoresAdmin;