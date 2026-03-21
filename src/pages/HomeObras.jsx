import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './HomeObras.css';

const HomeObras = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [obraSelecionada, setObraSelecionada] = useState(null);

  const categorias = ['Todas', 'Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select(`
            id_obra,
            titulo,
            imagem_url,
            descricao,
            perfil_artista!inner(nome),
            categoria!inner(nome)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const obrasFormatadas = data.map(obra => ({
          id: obra.id_obra,
          titulo: obra.titulo,
          imagem: obra.imagem_url,
          descricao: obra.descricao || 'Sem descrição disponível.',
          artista: obra.perfil_artista?.nome || 'Artista desconhecido',
          categoria: obra.categoria?.nome || 'Sem categoria'
        }));

        setObras(obrasFormatadas);
      } catch (err) {
        console.error('Erro:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchObras();
  }, []);

  const obrasFiltradas = categoriaAtiva === 'Todas'
    ? obras
    : obras.filter(obra => obra.categoria === categoriaAtiva);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <section className="home-obras-section">
      <h2 className="section-title">Obras em Destaque</h2>

      <div className="categorias-filtro">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`categoria-btn ${categoriaAtiva === cat ? 'ativa' : ''}`}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="obras-grid">
        {obrasFiltradas.map(obra => (
          <div key={obra.id} className="obra-card" onClick={() => setObraSelecionada(obra)}>
            <div className="obra-imagem">
              <img src={obra.imagem} alt={obra.titulo} />
            </div>
            <div className="obra-info">
              <h3 className="obra-titulo" style={{fontSize: '1.2rem', fontWeight: '700'}}>{obra.titulo}</h3>
              <p className="obra-artista" style={{fontSize: '0.9rem'}}>por {obra.artista}</p>
            </div>
          </div>
        ))}
      </div>

      {obraSelecionada && (
        <div className="modal-overlay" onClick={() => setObraSelecionada(null)}>
          <div className="modal-noticia" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setObraSelecionada(null)}>✕</button>
            
            <div className="modal-inner-content">
              <div className="modal-image-side">
                <img src={obraSelecionada.imagem} alt={obraSelecionada.titulo} />
              </div>
              
              <div className="modal-text-side">
                <h1 className="modal-title">{obraSelecionada.titulo}</h1>
                <p className="modal-artist">por {obraSelecionada.artista}</p>
                <span className="tag-category-modal">{obraSelecionada.categoria.toLowerCase()}</span>
                <div className="modal-description-text">
                  <p>{obraSelecionada.descricao}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeObras;