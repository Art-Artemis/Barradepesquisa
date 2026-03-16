import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Admin.css';

const Admin = () => {
  const [view, setView] = useState('menu'); // 'menu', 'banner', 'artista'
  
  // Estados Banner
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadBanner = async (e) => {
    e.preventDefault();
    if (!file) return alert("Por favor, selecione uma imagem.");
    setLoading(true);

    try {
      // 1. Upload imagem para o bucket 'banners' (sem o ponto final!)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Nome simplificado
      
      const { error: uploadError } = await supabase.storage
        .from('banners') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      // 3. Inserir no banco de dados
      const { error: dbError } = await supabase.from('banner').insert({
        titulo, 
        descricao, 
        imagem_url: publicUrl, 
        categoria: 'IFMA',
        ativo: true
      });

      if (dbError) throw dbError;

      alert("Banner cadastrado com sucesso!");
      // Resetar estados
      setTitulo(''); setDescricao(''); setFile(null); setView('menu');
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {view === 'menu' && (
        <div className="admin-menu">
          <h1>Painel Studio Besouro</h1>
          <button onClick={() => setView('banner')}>Cadastrar Banner</button>
          <button onClick={() => setView('artista')}>Criar Página de Artista</button>
        </div>
      )}

      {view === 'banner' && (
        <section className="admin-card">
          <form onSubmit={handleUploadBanner} className="admin-form">
            <h2>Novo Banner (IFMA)</h2>
            <input 
              type="text" 
              placeholder="Título" 
              value={titulo}
              onChange={e => setTitulo(e.target.value)} 
              required 
            />
            <input 
              type="file" 
              accept="image/*"
              onChange={e => setFile(e.target.files[0])} 
              required 
            />
            <textarea 
              placeholder="Descrição" 
              value={descricao}
              onChange={e => setDescricao(e.target.value)} 
              required 
            />
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Processando...' : 'Publicar Banner'}
            </button>
            <button type="button" onClick={() => setView('menu')}>Voltar ao Menu</button>
          </form>
        </section>
      )}

      {view === 'artista' && (
        <section className="admin-card">
          <div className="admin-form">
            <h2>Configuração de Artista</h2>
            <p>Em breve: Ferramentas para gerenciar portfólios.</p>
            <button type="button" onClick={() => setView('menu')}>Voltar ao Menu</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin;