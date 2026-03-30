import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient"; 
import { FiPlus, FiArrowLeft, FiCamera, FiEdit2, FiCheck, FiX, FiImage, FiTrash2 } from 'react-icons/fi'; 

import { useArtista } from '../hooks/useArtista';
import ModalNovaObra from '../components/ModalNovaObra';
import ModalCropper from '../components/ModalCropper';

import './PaginaArtista.css';

const PaginaArtista = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const cropperRef = useRef(null);

  const { artista, setArtista, loading, buscarDados } = useArtista(id);

  const [editBio, setEditBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tipoUpload, setTipoUpload] = useState(""); 
  const [showModalNova, setShowModalNova] = useState(false);
  const [novaObra, setNovaObra] = useState({ titulo: "", descricao: "", categoria: "Desenho", arquivo: null });
  
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [showModalDetalhe, setShowModalDetalhe] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: "", descricao: "", categoria: "" });

  const categoriasLista = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];
  const mapaCategorias = { 'Desenho': 1, 'Pintura': 2, 'Música': 3, 'Literatura': 4, 'Fotografia': 5, 'Escultura': 6 };
  const mapaCategoriasInverso = Object.fromEntries(Object.entries(mapaCategorias).map(([k, v]) => [v, k]));

  const handleSelectFile = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      setTipoUpload(tipo);
      const reader = new FileReader();
      reader.onload = () => { setImageToCrop(reader.result); setShowCropper(true); };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleFinalUpload = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    setUploading(true);
    setShowCropper(false);
    try {
      const canvas = cropper.getCroppedCanvas({
        width: tipoUpload === 'foto_perfil_url' ? 500 : 1200,
        height: tipoUpload === 'foto_perfil_url' ? 500 : 675,
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const fileName = `${tipoUpload}_${id}_${Date.now()}.jpg`;
      await supabase.storage.from('artistas').upload(fileName, blob, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('artistas').getPublicUrl(fileName);
      await supabase.from('perfil_artista').update({ [tipoUpload]: publicUrl }).eq('id_artista', id);
      setArtista(prev => ({ ...prev, [tipoUpload]: `${publicUrl}?t=${Date.now()}` }));
      alert("Imagem atualizada!");
    } catch (e) { alert(e.message); } finally { setUploading(false); }
  };

  const abrirDetalhes = (obra) => {
    setObraSelecionada(obra);
    setFormEdicao({
      titulo: obra.titulo,
      descricao: obra.descricao || "",
      categoria: mapaCategoriasInverso[obra.id_categoria] || "Desenho"
    });
    setModoEdicao(false);
    setShowModalDetalhe(true);
  };

  const handleSaveBio = async () => {
    try {
      const { error } = await supabase.from('perfil_artista').update({ bio: tempBio }).eq('id_artista', id);
      if (error) throw error;
      setArtista({...artista, bio: tempBio});
      setEditBio(false);
      alert("Bio atualizada!");
    } catch (e) { alert(e.message); }
  };

  const deletarObra = async () => {
    if (!obraSelecionada || !window.confirm("Excluir esta obra?")) return;
    try {
      const { error } = await supabase.from('obras').delete().eq('id_obra', obraSelecionada.id_obra);
      if (error) throw error;
      setArtista({ ...artista, obras: artista.obras.filter(o => o.id_obra !== obraSelecionada.id_obra) });
      setShowModalDetalhe(false);
      alert("Obra excluída!");
    } catch (err) { alert(err.message); }
  };

  const salvarEdicaoObra = async () => {
    try {
      const { error } = await supabase
        .from('obras')
        .update({
          titulo: formEdicao.titulo,
          descricao: formEdicao.descricao,
          id_categoria: mapaCategorias[formEdicao.categoria]
        })
        .eq('id_obra', obraSelecionada.id_obra);

      if (error) throw error;
      buscarDados();
      setModoEdicao(false);
      setShowModalDetalhe(false);
      alert("Obra atualizada!");
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading-state">Carregando perfil...</div>;

  return (
    <div className="perfil-container page-no-header">
      <ModalCropper 
        show={showCropper} src={imageToCrop} cropperRef={cropperRef} 
        tipoUpload={tipoUpload} onBlur={() => setShowCropper(false)} onConfirm={handleFinalUpload} 
      />

      <div className="topo-navegacao">
        <button className="btn-voltar-simples" onClick={() => navigate(-1)}><FiArrowLeft /> Voltar</button>
      </div>
      
      <div className="perfil-header-visual">
        <div className="banner-fundo-novo editavel" style={{ backgroundImage: `url(${artista?.banner_url})` }}>
          <label className="overlay-alterar-banner">
            <FiImage size={24} /> <span>{uploading ? "Salvando..." : "Alterar Capa"}</span>
            <input type="file" className="input-file-hidden" accept="image/*" onChange={(e) => handleSelectFile(e, 'banner_url')} disabled={uploading} />
          </label>
          <div className="foto-perfil-central">
            <img src={artista?.foto_perfil_url} alt="Perfil" />
            <label className="icon-camera-overlay clickable">
              <FiCamera />
              <input type="file" className="input-file-hidden" accept="image/*" onChange={(e) => handleSelectFile(e, 'foto_perfil_url')} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <div className="artista-intro">
        <h1 className="titulo-artista-limpo">{artista?.nome}</h1>
      </div>

      <div className="info-artista-form">
        <div className="campo-exibicao">
          <div className="label-with-action">
            <label>Sua Bio / Descrição</label>
            {!editBio ? (
              <button className="btn-edit-small" onClick={() => { setEditBio(true); setTempBio(artista.bio || ""); }}><FiEdit2 /> Editar</button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-small" onClick={handleSaveBio}><FiCheck /> Salvar</button>
                <button className="btn-cancel-small" onClick={() => setEditBio(false)}><FiX /></button>
              </div>
            )}
          </div>
          <textarea className="textarea-edit" value={tempBio} onChange={(e) => setTempBio(e.target.value)} disabled={!editBio} />
        </div>
      </div>

      <section className="secao-obras-v2">
        <div className="header-obras-v2">
          <h2>Suas Obras</h2>
          <button className="btn-adicionar-verde" onClick={() => setShowModalNova(true)}><FiPlus /> Adicionar Nova Obra</button>
        </div>
        <div className="grid-obras-clean">
          {artista?.obras?.map(obra => (
            <div key={obra.id_obra} className="card-obra-minimal clickable" onClick={() => abrirDetalhes(obra)}>
              <div className="img-container"><img src={obra.imagem_url} alt={obra.titulo} /></div>
              <div className="info-obra-bottom"><h3>{obra.titulo}</h3></div>
            </div>
          ))}
        </div>
      </section>

      <ModalNovaObra 
        show={showModalNova} onBlur={() => setShowModalNova(false)} 
        onSubmit={async (e) => {
            e.preventDefault();
            setUploading(true);
            try {
              const fileName = `obra_${id}_${Date.now()}`;
              await supabase.storage.from('obras').upload(fileName, novaObra.arquivo);
              const { data: { publicUrl } } = supabase.storage.from('obras').getPublicUrl(fileName);
              await supabase.from('obras').insert([{ id_artista: id, id_categoria: mapaCategorias[novaObra.categoria], titulo: novaObra.titulo, descricao: novaObra.descricao, imagem_url: publicUrl }]);
              buscarDados();
              setShowModalNova(false);
              setNovaObra({ titulo: "", descricao: "", categoria: "Desenho", arquivo: null });
            } catch (e) { alert(e.message); } finally { setUploading(false); }
        }}
        novaObra={novaObra} setNovaObra={setNovaObra} uploading={uploading} categoriasLista={categoriasLista}
      />
      
      {showModalDetalhe && obraSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Obra" : obraSelecionada.titulo}</h3>
              <button className="btn-close" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}><FiX size={24}/></button>
            </div>
            <div className="modal-body">
              <img src={obraSelecionada.imagem_url} alt={obraSelecionada.titulo} className="img-detalhe-obra" style={{ width: '100%', borderRadius: '16px', maxHeight: '340px', objectFit: 'cover' }} />
              {!modoEdicao ? (
                <>
                  <div className="categoria-badge">
                    {mapaCategoriasInverso[obraSelecionada.id_categoria]}
                  </div>
                  <div className="descricao-container">
                    <strong>Descrição:</strong>
                    <p>{obraSelecionada.descricao || <em>Sem descrição cadastrada.</em>}</p>
                  </div>
                </>
              ) : (
                <div className="form-edicao-obra">
                  <input value={formEdicao.titulo} onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})} placeholder="Título" className="input-simples" />
                  <select value={formEdicao.categoria} onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})} className="select-simples">
                    {categoriasLista.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea value={formEdicao.descricao} onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})} rows={4} placeholder="Descrição" className="textarea-simples" />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modoEdicao ? (
                <>
                  <button className="btn-cancel" onClick={() => setModoEdicao(false)}>Cancelar</button>
                  <button className="btn-submit-green" onClick={salvarEdicaoObra}>Salvar Alterações</button>
                </>
              ) : (
                <>
                  <button className="btn-edit-small" onClick={() => setModoEdicao(true)}><FiEdit2 /> Editar Detalhes</button>
                  <button className="btn-trash-icon" onClick={deletarObra} title="Excluir Obra">
                    <FiTrash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaArtista;