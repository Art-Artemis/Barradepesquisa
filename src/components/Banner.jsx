import React, { useState } from 'react';
import './Banner.css';

const Banner = ({ noticias }) => {
  const [indexAtual, setIndexAtual] = useState(0);
  const [aberto, setAberto] = useState(false);

  const noticiaAtual = noticias[indexAtual];

  const proximaNoticia = () => {
    setIndexAtual((prev) => (prev + 1) % noticias.length);
  };

  const anteriorNoticia = () => {
    setIndexAtual((prev) => (prev - 1 + noticias.length) % noticias.length);
  };

  if (!noticiaAtual || noticias.length === 0) return null;

  const temMaisDeUma = noticias.length > 1;
  const naoEhPrimeiro = indexAtual > 0;

  return (
    <>
      <section className="banner-wrapper">
        <div className="banner">
          <img 
            src={noticiaAtual.imagem_url} 
            alt={noticiaAtual.titulo} 
            className="banner-image" 
          />
          
          <div className="banner-overlay">
            <h2 className="banner-pre-titulo">Principais notícias do IFMA-Campus Timon</h2>
            <p className="banner-titulo">{noticiaAtual.titulo}</p>
            <button 
              className="btn-ler-mais" 
              onClick={() => setAberto(true)}
            >
              Clique para ler mais →
            </button>
          </div>
        </div>

        {/* Botões de navegação - só aparecem se tiver mais de 1 notícia */}
        {temMaisDeUma && (
          <>
            {/* Botão Anterior - só aparece se não for o primeiro */}
            {naoEhPrimeiro && (
              <button 
                className="banner-nav-btn prev" 
                onClick={(e) => {
                  e.stopPropagation();
                  anteriorNoticia();
                }}
              >
                &#8249; {/* seta esquerda */}
              </button>
            )}

            {/* Botão Próximo - sempre visível quando tem mais de 1 */}
            <button 
              className="banner-nav-btn next" 
              onClick={(e) => {
                e.stopPropagation();
                proximaNoticia();
              }}
            >
              &#8250; {/* seta direita */}
            </button>
          </>
        )}
      </section>

      {/* MODAL (mantido igual) */}
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