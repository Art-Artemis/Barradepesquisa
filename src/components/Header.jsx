import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png'; 
import React, { useState } from 'react';

const Header = ({ setPesquisa }) => {
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [sugestoes, setSugestoes] = useState([]);

  return (
    <header className="main-header">
      
      {/* Lado Esquerdo: Logo */}
      <div 
        className="logo-container clickable" 
        onClick={() => navigate('/login')}
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
          value={input}
          onChange={(e) => {
            const valor = e.target.value;
            setInput(valor);
            setPesquisa(valor);

            /* Thata conecta a barra de sugestoes no banco de dados */

            // TEMPORÁRIO (depois você troca pelo banco)
            if (valor.length > 0) {
              setSugestoes([
                "Obra Exemplo",
                "Artista Teste",
                "Pintura Abstrata",
                "Escultura Moderna"
              ]);
            } else {
              setSugestoes([]);
            }
          }}
        />

        {/* 🔥 SUGESTÕES (CORRIGIDO) */}
        {sugestoes.length > 0 && (
          <div className="suggestions-box">
            {sugestoes.map((item, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => {
                  setInput(item);
                  setPesquisa(item);
                  setSugestoes([]);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
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