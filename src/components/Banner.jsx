import React, { useState } from 'react';
import './Banner.css';

const Banner = ({ noticias }) => {
  const [indexAtual, setIndexAtual] = useState(0);
  const [aberto, setAberto] = useState(false);

  const noticiaAtual = noticias[indexAtual];

  const proximaNoticia = () => {
    setIndexAtual((prev) => (prev === noticias.length - 1 ? 0 : prev + 1));
  };

  if (!noticiaAtual) return null;

  return (
    <>
      <section className="banner-wrapper">
        {/* REMOVIDO O onClick DA DIV banner */}
        <div className="banner">
          <img src={noticiaAtual.imagem_url} alt={noticiaAtual.titulo} className="banner-image" />
          
          <div className="banner-overlay">
            <h2 className="banner-pre-titulo">Principais notícias do IFMA-Campus Timon</h2>
            <p className="banner-titulo">{noticiaAtual.titulo}</p>
            {/* ADICIONADO O onClick APENAS NO BOTÃO */}
            <button className="btn-ler-mais" onClick={() => setAberto(true)}>
              Clique para ler mais →
            </button>
          </div>
        </div>

        {noticias.length > 1 && (
          <button className="banner-nav-btn" onClick={(e) => { e.stopPropagation(); proximaNoticia(); }}>
            &#8250;
          </button>
        )}
      </section>

      {/* MODAL */}
      {aberto && (
        <div className="banner-modal" onClick={() => setAberto(false)}>
          <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setAberto(false)}>×</button>
            
            <div className="modal-image">
              <img src={noticiaAtual.imagem_url} alt={noticiaAtual.titulo} />
            </div>

            <div className="modal-text">
              <span className="tag-categoria">{noticiaAtual.categoria || 'IFMA Timon'}</span>
              <h2 className="modal-titulo">{noticiaAtual.titulo}</h2>
              <div 
                className="descricao-completa"
                dangerouslySetInnerHTML={{ 
                  __html: noticiaAtual.conteudo_completo || noticiaAtual.descricao 
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;