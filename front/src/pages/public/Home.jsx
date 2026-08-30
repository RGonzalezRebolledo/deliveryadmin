
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bienvenido a Gazzella Express</h1>
          <p className="hero-subtitle">
            Gestión y seguimiento de tus pedidos en tiempo real con la máxima rapidez y eficiencia.
          </p>
          <div className="hero-actions">
            <Link to="/public/Login" state={{ role: 'cliente' }} className="btn-hero-primary">
              Acceso Usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

// import React from 'react';
// import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
//  import { Link } from "react-router-dom";

// function Home() {
//   const navigate = useNavigate(); // ✅ Agregado: Declaración del hook
 
//   return (
//     <div className="home-page">

//        <div className="hero-section">

//         <Link to="/public/Login" state={{ role: 'cliente' }} className="mi-enlace">Acceso Usuarios</Link>
//       </div>
//     </div>
 
//   );
// }

// export default Home;