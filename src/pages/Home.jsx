import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import './Home.css';

const Home = () => {
  const [obras, setObras] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [obraSelecionada, setObraSelecionada] = useState(null);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    const { data: bData } = await supabase.from('banner').select('*').eq('ativo', true);
    if (bData) setBanners(bData);

    const { data: oData } = await supabase.from('obras').select('*');
    if (oData) setObras(oData);
  };

  const categorias = ['Todas', ...new Set(obras.map(o => o.categoria))];
  const obrasFiltradas = categoriaAtiva === 'Todas' 
    ? obras 
    : obras.filter(o => o.categoria === categoriaAtiva);

  return (
    <div className="home-content">
      {/* Banner */}
      <section className="banner-section">
        {banners.length > 0 && <Banner noticias={banners} />}
      </section>

      {/* Categorias */}
      <nav className="nav-categories">
        {categorias.map(cat => (
          <button 
            key={cat} 
            className={`category-pill ${categoriaAtiva === cat ? 'active' : ''}`}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Galeria de Obras */}
      <main className="grid-artes">
        {obrasFiltradas.map((obra) => (
          <div key={obra.id_obra} className="card-arte" onClick={() => setObraSelecionada(obra)}>
            <img src={obra.imagem_url} alt={obra.titulo} className="card-image" />
            <div className="card-body">
              <h4>{obra.titulo}</h4>
              <p className="artist-label">Por: {obra.artista}</p>
              <div className="type-tag">{obra.preco ? `R$ ${obra.preco}` : 'Sob consulta'}</div>
            </div>
          </div>
        ))}
      </main>

      {/* Modal de Detalhes da Obra */}
      {obraSelecionada && (
        <div className="modal-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-noticia" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setObraSelecionada(null)}>×</button>
            <div className="modal-inner-content">
              <div className="modal-image-side">
                <img src={obraSelecionada.imagem_url} alt={obraSelecionada.titulo} />
              </div>
              <div className="modal-text-side">
                <span className="tag-ifma">{obraSelecionada.categoria}</span>
                <h1 className="modal-title">{obraSelecionada.titulo}</h1>
                <div className="modal-description-text">
                  <p>{obraSelecionada.descricao || "Sem descrição disponível."}</p>
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