import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FiSearch, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png';
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Header = ({ setPesquisa }) => {
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [sugestoes, setSugestoes] = useState([]);

  const buscarSugestoes = async (valor) => {
    if (!valor.trim()) {
      setSugestoes([]);
      return;
    }

    /* Busca obras (tabela "então") */
    const { data: obras, error: erroObras } = await supabase
      .from('então')
      .select('titulo')
      .ilike('titulo', `%${valor}%`)
      .limit(5);

    /* Busca artistas */
    const { data: artistas, error: erroArtistas } = await supabase
      .from('perfil_artista')
      .select('nome')
      .ilike('nome', `%${valor}%`)
      .limit(5);

    console.log('OBRAS:', obras, erroObras);
    console.log('ARTISTAS:', artistas, erroArtistas);

    const listaObras = obras?.map((item) => item.titulo) || [];
    const listaArtistas = artistas?.map((item) => item.nome) || [];

    const listaFinal = [...listaObras, ...listaArtistas];

    setSugestoes(listaFinal);
  };

  return (
    <header className="main-header">

      {/* Lado Esquerdo */}
      <div
        className="logo-container clickable"
        onClick={() => navigate('/login')}
      >
        <img
          src={logo}
          alt="Studio Besouro Logo"
          className="logo-icon"
        />

        <span className="logo-text">
          <span className="text-green">Studio</span>{' '}
          <span className="text-purple">Besouro</span>
        </span>
      </div>

      {/* Centro */}
      <div className="search-container">
        <FiSearch className="search-icon" />

        <input
          type="text"
          placeholder="Pesquisar artistas ou obras..."
          className="search-input"
          value={input}
          onChange={async (e) => {
            const valor = e.target.value;

            setInput(valor);
            setPesquisa(valor);

            await buscarSugestoes(valor);
          }}
        />

        {/* Sugestões */}
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

      {/* Lado Direito */}
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