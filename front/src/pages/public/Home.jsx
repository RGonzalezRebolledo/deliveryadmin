
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
 import { Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate(); // ✅ Agregado: Declaración del hook
 
  return (
    <div className="home-page">

       <div className="hero-section">

        <Link to="/public/Login" state={{ role: 'cliente' }} className="mi-enlace">Acceso Usuarios</Link>
      </div>
    </div>
 
  );
}

export default Home;