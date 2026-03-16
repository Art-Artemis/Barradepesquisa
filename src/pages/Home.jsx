import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Home.css';

const Home = () => {
  const [obras, setObras] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerSelecionado, setBannerSelecionado] = useState(null);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    // Busca Obras
    const { data: obrasData, error: obrasError } = await supabase.from('obras').select('*');
    if (obrasData) setObras(obrasData);

    // Busca Banners ativos
    const { data: bannersData, error: bannersError } = await supabase
      .from('banner')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false }); // Exibe os mais recentes primeiro
    
    if (bannersData) setBanners(bannersData);
  };

  return (
    <div className="home-container">
      {/* Seção de Banner */}
      {banners.length > 0 && (
        <section className="banner-section">
          {banners.map((b) => (
            <div key={b.id_banner} className="banner-box" onClick={() => setBannerSelecionado(b)}>
              <img src={b.imagem_url} alt={b.titulo} className="banner-img-fundo" />
              <div className="banner-overlay">
                <h2>{b.titulo}</h2>
                <p>{b.descricao ? `${b.descricao.substring(0, 80)}...` : ''}</p>
                <button className="btn-ler-mais">Clique para ler mais →</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* --- MODAL DE DETALHES --- */}
      {bannerSelecionado && (
        <div className="modal-overlay" onClick={() => setBannerSelecionado(null)}>
          <div className="modal-noticia" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setBannerSelecionado(null)}>×</button>
            
            <div className="modal-inner-content">
              <div className="modal-image-side">
                <img src={bannerSelecionado.imagem_url} alt={bannerSelecionado.titulo} />
              </div>
              <div className="modal-text-side">
                <span className="tag-ifma">{bannerSelecionado.categoria || 'IFMA'}</span>
                <h1 className="modal-title">{bannerSelecionado.titulo}</h1>
                <div className="modal-description-text">
                   <p>{bannerSelecionado.descricao}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Obras */}
      <main className="home-content">
        <h1 className="section-title">Galeria Studio Besouro</h1>
        <div className="grid-artes">
          {obras.length > 0 ? (
            obras.map((obra) => (
              <div key={obra.id_obra} className="card-arte">
                <img src={obra.imagem_url} alt={obra.titulo} className="card-image" />
                <div className="card-body">
                  <h4>{obra.titulo}</h4>
                  <p className="artist-label">Por: <strong>{obra.artista}</strong></p>
                  <div className="type-tag">
                    {obra.preco ? `R$ ${Number(obra.preco).toFixed(2)}` : 'Preço sob consulta'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhuma obra cadastrada no momento.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;