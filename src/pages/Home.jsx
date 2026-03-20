import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import './Home.css';

const Home = () => {
  const [obras, setObras] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [obraSelecionada, setObraSelecionada] = useState(null);

  // Categorias fixas conforme seu pedido (Sem emojis)
  const categoriasFixas = [
    'Todas', 
    'Desenho', 
    'Pintura', 
    'Música', 
    'Literatura', 
    'Fotografia', 
    'Escultura'
  ];

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    // Busca Banners ativos
    const { data: bData } = await supabase.from('banner').select('*').eq('ativo', true);
    if (bData) setBanners(bData);

    // Busca Obras
    const { data: oData } = await supabase.from('obras').select('*');
    if (oData) setObras(oData);
  };

  // Lógica de Filtro: Comparação exata de strings
  const obrasFiltradas = categoriaAtiva === 'Todas' 
    ? obras 
    : obras.filter(o => o.categoria === categoriaAtiva);

  return (
    <div className="home-content">
      {/* 1. Seção do Banner */}
      <section className="banner-section">
        {banners.length > 0 && <Banner noticias={banners} />}
      </section>

      {/* 2. Barra de Categorias (Nav) */}
      <nav className="nav-categories">
        {categoriasFixas.map(cat => (
          <button 
            key={cat} 
            className={`category-pill ${categoriaAtiva === cat ? 'active' : ''}`}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* 3. Grid de Obras */}
      <main className="grid-artes">
        {obrasFiltradas.length > 0 ? (
          obrasFiltradas.map((obra) => (
            <div key={obra.id_obra} className="card-arte" onClick={() => setObraSelecionada(obra)}>
              <div className="card-image-wrapper">
                <img src={obra.imagem_url} alt={obra.titulo} className="card-image" />
              </div>
              <div className="card-body">
                <h4 className="obra-titulo">{obra.titulo}</h4>
                <p className="artist-label">por <span className="artist-name">{obra.artista}</span></p>
                <div className="card-footer-info">
                   <span className="type-tag">{obra.categoria}</span>
                   <span className="price-tag">{obra.preco ? `R$ ${obra.preco}` : 'Sob consulta'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">Nenhuma obra cadastrada em "{categoriaAtiva}".</div>
        )}
      </main>

      {/* 4. Modal de Detalhes Estilo Vitrine */}
      {obraSelecionada && (
        <div className="modal-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-noticia" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setObraSelecionada(null)}>×</button>
            <div className="modal-inner-content">
              <div className="modal-image-side">
                <img src={obraSelecionada.imagem_url} alt={obraSelecionada.titulo} />
              </div>
              <div className="modal-text-side">
                <span className="tag-category-modal">{obraSelecionada.categoria}</span>
                <h1 className="modal-title">{obraSelecionada.titulo}</h1>
                <p className="modal-artist">Artista: {obraSelecionada.artista}</p>
                <div className="modal-description-text">
                  <p>{obraSelecionada.descricao || "Sem descrição disponível para esta obra."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;