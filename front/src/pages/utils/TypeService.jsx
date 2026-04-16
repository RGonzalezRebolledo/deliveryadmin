  
  import React, { useState } from 'react';
  import axios from 'axios';

//   const API_BASE_URL = window.GLOBAL_API_URL || 'http://localhost:4000';
const API_BASE_URL = 'https://delivery-backend-production-c3cb.up.railway.app';
  
  const TypeService = () => {
      const [formData, setFormData] = useState({
          description: '',
          pay: '' 
      });
  
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState('');
      const [isError, setIsError] = useState(false);
  
      // 💡 Función para formatear mientras se escribe
      const formatCurrency = (value) => {
          // Elimina todo lo que no sea número
          const cleanValue = value.replace(/\D/g, "");
          // Si está vacío, retornamos vacío
          if (!cleanValue) return "";
  
          // Convertimos a número y dividimos por 100 para los 2 decimales
          const numberValue = (Number(cleanValue) / 100).toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
  
          return numberValue;
      };
  
      const handleChange = (e) => {
          const { name, value } = e.target;
  
          if (name === 'pay') {
              // Aplicamos el formato de moneda solo a este campo
              setFormData({
                  ...formData,
                  [name]: formatCurrency(value),
              });
          } else {
              setFormData({
                  ...formData,
                  [name]: value,
              });
          }
      };
  
      const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
  
          // 💡 IMPORTANTE: Antes de enviar al backend, debemos convertir "1.234,56" a 1234.56 (Float)
          const numericMonto = parseFloat(
              formData.pay.replace(/\./g, '').replace(',', '.')
          );
  
          const dataToSend = {
            descript: formData.description,
            amount_pay: numericMonto
        };

        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/utils/service`,
                dataToSend, 
            );
            setLoading(false);
            setMessage('✅ ¡Registro exitoso!');
            // 💡 LIMPIEZA DE INPUTS: Seteamos el estado a su valor inicial
            setFormData({
              description: '',
              pay: ''
          });
          } catch (error) {
            setLoading(false);
            setIsError(true);
            if (error.response) {
                const apiMessage = error.response.data.message || error.response.data.error;
                setMessage(`⚠️ Error: ${apiMessage || 'Ocurrió un error en el registro.'}`);
            } else if (error.request) {
                setMessage('❌ Error de conexión: No se pudo conectar al servidor.');
            } else {
                setMessage('❌ Error desconocido al enviar la solicitud.');
            }
            console.error('Error de registro:', error);
        }
      };
  
      return (
          <div className='order-form'>
              <h2>Tipos Servicio</h2>
              <form onSubmit={handleSubmit}>
              <div className="form-group">
                {message && (
                    <p style={{ 
                        color: isError ? 'red' : 'green', 
                        fontWeight: 'bold', 
                        padding: '10px', 
                        border: `1px solid ${isError ? 'red' : 'green'}`,
                        margin: '10px'
                    }}>
                        {message}
                    </p>
                )}
                </div>

                  <div className="form-group">
                      <label htmlFor="description">Descripción</label>
                      <input
                          type="text"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                      />
                  </div>
  
                  {/* 💡 Campo Moneda Formateado */}
                  <div className="form-group">
                      <label htmlFor="monto">Monto (Tarifa)</label>
                      <input
                          type="text" // Cambiado a text para permitir el formato visual
                          id="pay"
                          name="pay"
                          value={formData.pay}
                          onChange={handleChange}
                          placeholder="0,00"
                          style={{ textAlign: 'right' }} // Opcional: alinear a la derecha como en contabilidad
                          required
                      />
                  </div>
  
                  <button type="submit" disabled={loading} className='btn-delivery'>
                      {loading ? 'Guardando...' : 'Guardar'}
                  </button>
              </form>
          </div>
      );
  };
  
  export default TypeService;
 
