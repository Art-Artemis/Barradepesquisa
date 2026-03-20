import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png'; 

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      {/* Lado Esquerdo: Logo (Agora com clique para Login) */}
      <div 
        className="logo-container clickable" 
        onClick={() => navigate('/login')} // Redireciona para a página de Login
      >
        <img src={logo} alt="Studio Besouro Logo" className="logo-icon" />
        <span className="logo-text">
          <span className="text-green">Studio</span> <span className="text-purple">Besouro</span>
        </span>
      </div>

      {/* Centro: Barra de Pesquisa */}
      <div className="search-container">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Pesquisar artistas ou obras..." 
          className="search-input"
        />
      </div>

      {/* Lado Direito: Botão de Contato */}
      <button 
        className="contact-button" 
        onClick={() => navigate('/contato')}
      >
        <FiMail className="mail-icon" />
        <span>Contato Curadoria</span>
      </button>
    </header>
  );
};

export default Header;