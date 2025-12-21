
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import Carousel from '../../components/Carousel.jsx';
 import { Link } from "react-router-dom";
 import PWAInstallManager from '../../components/PWAInstallManager.jsx';

function Home() {
  const navigate = useNavigate(); // ✅ Agregado: Declaración del hook
 
  return (
    <div className="home-page">
      <div >
      <PWAInstallManager/>
      </div>
       <div className="hero-section">

        <Link to="/public/Login" state={{ role: 'cliente' }} className="mi-enlace">Acceso Usuarios</Link>
      </div>
    </div>
 
  );
}

export default Home;