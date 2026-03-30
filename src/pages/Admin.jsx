import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiPlus, FiTrash2, FiUsers, FiImage, FiLayers, FiChevronRight, FiEdit } from 'react-icons/fi';

import HeaderContato from '../components/HeaderContato';
import Footer from '../components/Footer';
import ModalBanner from '../components/Admin/ModalBanner';
import ModalArtista from '../components/Admin/ModalArtista';
import { useAdminData } from '../hooks/useAdminData';

import './Admin.css';

const Admin = () => {
  const { banners, artistas, stats, loading, setLoading, fetchData, uploadFile } = useAdminData();
  
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isArtistaModalOpen, setIsArtistaModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const [formData, setFormData] = useState({ titulo: '', descricao: '', nome: '', bio: '' });
  const [files, setFiles] = useState({ banner: null, fotoPerfil: null, bannerArtista: null });

  useEffect(() => { fetchData(); }, []);

  const openEditBannerModal = (banner) => {
    setEditingBannerId(banner.id_banner);
    setFormData({ ...formData, titulo: banner.titulo || '', descricao: banner.descricao || '' });
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
      if (files.banner) url = await uploadFile(files.banner, 'banners');

      const payload = { titulo: formData.titulo, descricao: formData.descricao, imagem_url: url };

      if (editingBannerId) {
        await supabase.from('banner').update(payload).eq('id_banner', editingBannerId);
      } else {
        if (!files.banner) throw new Error("Selecione uma imagem.");
        await supabase.from('banner').insert([payload]);
      }
      closeBannerModal();
      fetchData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCreateArtista = async (e) => {
    e.preventDefault();
    if (!files.fotoPerfil || !files.bannerArtista) return alert("Selecione as imagens.");
    setLoading(true);
    try {
      const fotoUrl = await uploadFile(files.fotoPerfil, 'artistas');
      const bannerUrl = await uploadFile(files.bannerArtista, 'artistas');
      await supabase.from('perfil_artista').insert({ nome: formData.nome, bio: formData.bio, foto_perfil_url: fotoUrl, banner_url: bannerUrl });
      setFormData({ ...formData, nome: '', bio: '' });
      setIsArtistaModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (table, id, idField) => {
    const confirmMsg = table === 'perfil_artista' 
      ? "Excluir este artista removerá TODAS as obras vinculadas a ele. Confirmar?"
      : "Tem certeza que deseja excluir permanentemente?";

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      if (table === 'perfil_artista') {
        const { error: errorObras } = await supabase.from('obras').delete().eq('id_artista', id);
        if (errorObras) throw errorObras;
      }
      const { error } = await supabase.from(table).delete().eq(idField, id);
      if (error) throw error;
      fetchData();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="admin-page-wrapper">
      <HeaderContato />
      <main className="admin-dashboard">
        <div className="stats-grid">
          <div className="stat-card green"><div><p>Banners</p><strong>{stats.banners}</strong></div><FiImage size={32} /></div>
          <div className="stat-card yellow"><div><p>Artistas</p><strong>{stats.artistas}</strong></div><FiUsers size={32} /></div>
          <div className="stat-card purple"><div><p>Obras</p><strong>{stats.obras}</strong></div><FiLayers size={32} /></div>
        </div>

        <section className="admin-section">
          <div className="section-header">
            <h2>Banners Informativos</h2>
            <button className="btn-new green" onClick={() => setIsBannerModalOpen(true)}><FiPlus /> Novo Banner</button>
          </div>
          <div className="items-grid">
            {/* LIMITADO A 3 BANNERS */}
            {banners.slice(0, 3).map(b => (
              <div key={b.id_banner} className="item-card banner-card">
                <img src={b.imagem_url} alt={b.titulo} />
                <div className="item-info">
                  <h3>{b.titulo}</h3>
                  <div className="card-actions-admin">
                    <button onClick={() => openEditBannerModal(b)} className="btn-edit-inline"><FiEdit /> Editar</button>
                    <button onClick={() => handleDelete('banner', b.id_banner, 'id_banner')} className="btn-delete-inline"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-header">
            <h2>Artistas</h2>
            <button className="btn-new purple" onClick={() => setIsArtistaModalOpen(true)}><FiPlus /> Novo Artista</button>
          </div>
          <div className="items-grid">
            {/* LIMITADO A 3 ARTISTAS */}
            {artistas.slice(0, 3).map(a => (
              <div key={a.id_artista} className="item-card artista-card">
                <div className="badge-count">
                  <i className="fa-solid fa-star"></i> {a.obras?.[0]?.count || 0}
                </div>
                <img src={a.foto_perfil_url} alt={a.nome} />
                <div className="item-info">
                  <h3>{a.nome}</h3>
                  <div className="card-actions">
                    <Link to={`/artista/${a.id_artista}`} className="btn-manage">Obras <FiChevronRight /></Link>
                    <button onClick={() => handleDelete('perfil_artista', a.id_artista, 'id_artista')} className="btn-icon-delete"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ModalBanner 
        isOpen={isBannerModalOpen} onClose={closeBannerModal} onSave={handleSaveBanner}
        formData={formData} setFormData={setFormData} files={files} setFiles={setFiles}
        loading={loading} editingId={editingBannerId}
      />

      <ModalArtista 
        isOpen={isArtistaModalOpen} onClose={() => setIsArtistaModalOpen(false)} onSave={handleCreateArtista}
        formData={formData} setFormData={setFormData} files={files} setFiles={setFiles} loading={loading}
      />
      <Footer />
    </div>
  );
};

export default Admin;