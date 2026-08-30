import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login/admin`,
        { email, password },
        { withCredentials: true }
      );

      login(response.data.user);
      const { tipo } = response.data.user;

      if (tipo === "administrador") {
        navigate("/dashboardAdmin");
      } else if (tipo === "supervisor") {
        navigate("/dashboardSupervisor");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Error en las credenciales");
      } else {
        setError("Error de conexión con el servidor");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔑 Acceso Administrativo</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-auth-submit">
            Iniciar Sesión
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="auth-back-link">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { useAuth } from '../../hooks/AuthContext'; // 💡 Importar el Hook de Auth

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // 💡 Obtener la función login del contexto
//   // const location = useLocation();
//   // const role = '';

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');  // Cambia a 'password' para consistencia
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // const response = await axios.post('http://localhost:4000/login', {
//       //   email,
//       //   password,  // Cambia a 'password' para que coincida con Express

//       // });
//       const response = await axios.post(
//         `${API_BASE_URL}/login/admin`,
//         {
//             email,
//             password,
//         },
//         {
//             // 💡 INTEGRACIÓN DE LAS CREDENCIALES
//             withCredentials: true
//         }
//     );
//           // 💡 USAR LA FUNCIÓN LOGIN DEL CONTEXTO
//             // response.data.user contiene { email, tipo, nombre } que recibimos del backend
//             login(response.data.user);
//             //console.log (response.data.user)
//             const {tipo} = response.data.user
//             console.log (tipo)
//       // Axios resuelve solo para status 2xx, así que esto se ejecuta en éxito
//       // alert('Inicio de sesión exitoso. Navegando al Dashboard.');

//       if (tipo === 'administrador') {
//         navigate('/dashboardAdmin');
//       } else if (tipo === 'supervisor') {
//         navigate('/dashboardSupervisor');
//       }
//     } catch (err) {
//       if (err.response) {
//         // Asegúrate de que el backend devuelva { error: 'mensaje' }
//         setError(err.response.data.error || 'Error desconocido');
//       } else {
//         setError('Error de conexión');
//       }
//     }
//   };

//   // const handleRegister = () => {
//   //   // navigate('/Register');
//   //   navigate('/Register', { state: { role: role } });
//   // };

//   return (
//     <div className="order-form">
//       <h2>🔑 Acceso para Administradores</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="email">Correo Electrónico</label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="correo@ejemplo.com"
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Contraseña</label>
//           <input
//             id="password"
//             type="password"
//             value={password}  // Cambia a 'password'
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="********"
//             required
//           />
//         </div>
//         {/* <button type="submit" className={role === 'cliente' ? 'btn-client' : 'btn-delivery'}> */}
//         <button type="submit" className={'btn-delivery'}>
//           Iniciar Sesión
//         </button>
//       </form>
//       {/* <button className="btn-client" onClick={handleRegister}>
//         Registro
//       </button> */}
//     </div>
//   );
// }

// export default Login;
