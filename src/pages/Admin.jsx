import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  FiPlus, 
  FiTrash2, 
  FiUsers, 
  FiImage, 
  FiLayers, 
  FiChevronRight, 
  FiX,
  FiEdit 
} from 'react-icons/fi';
import HeaderContato from '../components/HeaderContato';
import Footer from '../components/Footer';
import './Admin.css';



const Admin = () => {
  const [loading, setLoading] = useState(false);
  
  // Estados de Controle de Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isArtistaModalOpen, setIsArtistaModalOpen] = useState(false);
  
  // Estado para identificar se estamos EDITANDO um banner
  const [editingBannerId, setEditingBannerId] = useState(null);

  // Dados do Banco
  const [banners, setBanners] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [stats, setStats] = useState({ banners: 0, artistas: 0, obras: 0 });

  // Estados dos Formulários
  const [formData, setFormData] = useState({ 
    titulo: '', 
    descricao: '', 
    nome: '', 
    bio: '' 
  });
  
  const [files, setFiles] = useState({ banner: null, fotoPerfil: null, bannerArtista: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: b } = await supabase.from('banner').select('*').order('created_at', { ascending: false });
      const { data: a } = await supabase.from('perfil_artista').select('*, obras(count)');
      const { count: o } = await supabase.from('obras').select('*', { count: 'exact', head: true });

      if (b) setBanners(b);
      if (a) setArtistas(a);
      setStats({ banners: b?.length || 0, artistas: a?.length || 0, obras: o || 0 });
    } catch (err) {
      console.error("Erro ao buscar dados:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- LÓGICA DE BANNERS ---

  const openEditBannerModal = (banner) => {
    setEditingBannerId(banner.id_banner);
    setFormData({
      ...formData,
      titulo: banner.titulo || '',
      descricao: banner.descricao || ''
    });
    setIsBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBannerId(null);
    setFormData({ ...formData, titulo: '', descricao: '' });
    setFiles({ ...files, banner: null });
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = banners.find(b => b.id_banner === editingBannerId)?.imagem_url;

      if (files.banner) {
        url = await uploadFile(files.banner, 'banners');
      }

      const payload = { 
        titulo: formData.titulo, 
        descricao: formData.descricao, 
        imagem_url: url 
      };

      if (editingBannerId) {
        const { error } = await supabase.from('banner')
          .update(payload)
          .eq('id_banner', editingBannerId);
        if (error) throw error;
      } else {
        if (!files.banner) throw new Error("Selecione uma imagem para o novo banner.");
        const { error } = await supabase.from('banner').insert([payload]);
        if (error) throw error;
      }

      alert("Banner salvo com sucesso!");
      closeBannerModal();
      fetchData();
    } catch (err) {
      alert("Erro ao salvar banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE ARTISTAS ---

  const handleCreateArtista = async (e) => {
    e.preventDefault();
    if (!files.fotoPerfil || !files.bannerArtista) return alert("Selecione as imagens obrigatórias.");
    setLoading(true);
    try {
      const fotoUrl = await uploadFile(files.fotoPerfil, 'artistas');
      const bannerUrl = await uploadFile(files.bannerArtista, 'artistas');
      
      const { error } = await supabase.from('perfil_artista').insert({
        nome: formData.nome,
        bio: formData.bio,
        foto_perfil_url: fotoUrl,
        banner_url: bannerUrl
      });
      
      if (error) throw error;

      alert("Artista cadastrado com sucesso!");
      setFormData({ ...formData, nome: '', bio: '' });
      setFiles({ ...files, fotoPerfil: null, bannerArtista: null });
      setIsArtistaModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Erro ao criar artista: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table, id, idField) => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(table).delete().eq(idField, id);
      if (error) throw error;
      alert("Excluído com sucesso!");
      fetchData();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      {/* 1. CABEÇALHO ADICIONADO AQUI */}
      <HeaderContato />

      <main className="admin-dashboard">
        <div className="animate-in">
          
          <div className="stats-grid">
            <div className="stat-card green">
              <div><p>Banners</p><strong>{stats.banners}</strong></div>
              <FiImage size={32} />
            </div>
            <div className="stat-card yellow">
              <div><p>Artistas</p><strong>{stats.artistas}</strong></div>
              <FiUsers size={32} />
            </div>
            <div className="stat-card purple">
              <div><p>Obras</p><strong>{stats.obras}</strong></div>
              <FiLayers size={32} />
            </div>
          </div>

          {/* SEÇÃO BANNERS */}
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h2>Banners Informativos</h2>
                <p>Conteúdo em destaque na home</p>
              </div>
              <button className="btn-new green" onClick={() => setIsBannerModalOpen(true)}>
                <FiPlus /> Novo Banner
              </button>
            </div>
            <div className="items-grid">
              {banners.map(b => (
                <div key={b.id_banner} className="item-card banner-card">
                  <img src={b.imagem_url} alt={b.titulo} />
                  <div className="item-info">
                    <h3>{b.titulo}</h3>
                    <p>{b.descricao?.substring(0, 60)}...</p>
                    <div className="card-actions-admin">
                      <button onClick={() => openEditBannerModal(b)} className="btn-edit-inline">
                        <FiEdit /> Editar
                      </button>
                      <button onClick={() => handleDelete('banner', b.id_banner, 'id_banner')} className="btn-delete-inline">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO ARTISTAS */}
          <section className="admin-section">
            <div className="section-header">
              <div>
                <h2>Artistas</h2>
                <p>Gerencie perfis e obras</p>
              </div>
              <button className="btn-new purple" onClick={() => setIsArtistaModalOpen(true)}>
                <FiPlus /> Novo Artista
              </button>
            </div>
            <div className="items-grid">
              {artistas.map(a => (
                <div key={a.id_artista} className="item-card artista-card">
                  <div className="badge-count">✨ {a.obras?.[0]?.count || 0}</div>
                  <img src={a.foto_perfil_url} alt={a.nome} />
                  <div className="item-info">
                    <h3>{a.nome}</h3>
                    <div className="card-actions">
                      <Link to={`/artista/${a.id_artista}`} className="btn-manage">
                        Obras <FiChevronRight />
                      </Link>
                      <button onClick={() => handleDelete('perfil_artista', a.id_artista, 'id_artista')} className="btn-icon-delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* MODAIS (MANTIDOS IGUAIS) */}
      {isBannerModalOpen && (
        <div className="modal-overlay animate-in">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBannerId ? '✏️ Editar Banner' : '✨ Novo Banner'}</h2>
              <button className="btn-close-modal" onClick={closeBannerModal}><FiX /></button>
            </div>
            <form onSubmit={handleSaveBanner} className="form-new-design">
              <div className="input-group">
                <label>Título Principal *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Descrição *</label>
                <textarea 
                  required 
                  value={formData.descricao} 
                  onChange={e => setFormData({...formData, descricao: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Imagem {editingBannerId && '(Deixe vazio para manter a atual)'}</label>
                <div className="file-input-wrapper">
                  <label htmlFor="banner-upload" className="file-input-label">
                    <FiImage /> {files.banner ? files.banner.name : "Escolher arquivo..."}
                  </label>
                  <input id="banner-upload" type="file" accept="image/*" onChange={e => setFiles({...files, banner: e.target.files[0]})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-modal-save green" disabled={loading}>
                  {loading ? 'Salvando...' : editingBannerId ? 'Salvar Alterações' : 'Cadastrar Banner'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={closeBannerModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isArtistaModalOpen && (
        <div className="modal-overlay animate-in">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-purple">🎨 Novo Artista</h2>
              <button className="btn-close-modal" onClick={() => setIsArtistaModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateArtista} className="form-new-design purple-theme">
              <div className="input-group">
                <label>Nome Completo</label>
                <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Biografia Curta</label>
                <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              
              <div className="file-grid-2">
                <div className="input-group">
                  <label>Foto de Perfil</label>
                  <div className="file-input-wrapper">
                    <label htmlFor="perfil-upload" className="file-input-label">
                      <FiImage /> {files.fotoPerfil ? files.fotoPerfil.name : "Escolher foto..."}
                    </label>
                    <input id="perfil-upload" type="file" accept="image/*" required onChange={e => setFiles({...files, fotoPerfil: e.target.files[0]})} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Banner de Fundo</label>
                  <div className="file-input-wrapper">
                    <label htmlFor="banner-art-upload" className="file-input-label">
                      <FiImage /> {files.bannerArtista ? files.bannerArtista.name : "Escolher banner..."}
                    </label>
                    <input id="banner-art-upload" type="file" accept="image/*" required onChange={e => setFiles({...files, bannerArtista: e.target.files[0]})} />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-modal-save purple" disabled={loading}>
                  {loading ? 'Salvando...' : 'Cadastrar Artista'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setIsArtistaModalOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;