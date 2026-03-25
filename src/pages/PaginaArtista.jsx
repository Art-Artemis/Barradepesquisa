import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient"; 
import { FiPlus, FiArrowLeft, FiCamera, FiEdit2, FiCheck, FiX, FiImage, FiUploadCloud, FiTrash2 } from 'react-icons/fi'; 
import Cropper from "react-cropper"; 

import './PaginaArtista.css';

const PaginaArtista = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const cropperRef = useRef(null);

  const [artista, setArtista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editBio, setEditBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tipoUpload, setTipoUpload] = useState(""); 

  const [showModalNova, setShowModalNova] = useState(false);
  const [novaObra, setNovaObra] = useState({ 
    titulo: "", 
    descricao: "", 
    categoria: "Desenho", 
    arquivo: null 
  });

  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [showModalDetalhe, setShowModalDetalhe] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: "", descricao: "", categoria: "" });

  const categoriasLista = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

  const mapaCategorias = {
    'Desenho': 1, 'Pintura': 2, 'Música': 3, 'Literatura': 4, 'Fotografia': 5, 'Escultura': 6
  };

  const mapaCategoriasInverso = Object.fromEntries(
    Object.entries(mapaCategorias).map(([k, v]) => [v, k])
  );

  useEffect(() => {
    const buscarDadosArtista = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('perfil_artista')
          .select('*, obras(*)')
          .eq('id_artista', id)
          .single();

        if (error) throw error;
        if (data) {
          // Adiciona cache buster nas imagens iniciais para evitar carregar versões velhas do navegador
          const artistaComCache = {
            ...data,
            foto_perfil_url: data.foto_perfil_url ? `${data.foto_perfil_url}?t=${Date.now()}` : null,
            banner_url: data.banner_url ? `${data.banner_url}?t=${Date.now()}` : null
          };
          setArtista(artistaComCache);
          setTempBio(data.bio || "");
        }
      } catch (err) {
        console.error("Erro ao buscar artista:", err.message);
      } finally {
        setLoading(false);
      }
    };
    buscarDadosArtista();
  }, [id]);

  const handleSelectFile = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      setTipoUpload(tipo);
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ""; // Limpa o input para permitir selecionar a mesma imagem se desejar
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
      
      // Nome do arquivo com timestamp para garantir unicidade no storage
      const fileName = `${tipoUpload}_${id}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('artistas')
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artistas')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('perfil_artista')
        .update({ [tipoUpload]: publicUrl })
        .eq('id_artista', id);

      if (updateError) throw updateError;

      // O SEGREDO: Atualiza o estado com a URL + timestamp (Cache Buster)
      const novaUrlComCacheBuster = `${publicUrl}?t=${Date.now()}`;
      setArtista(prev => ({ ...prev, [tipoUpload]: novaUrlComCacheBuster }));
      
      alert("Imagem atualizada com sucesso!");
    } catch (e) { 
      alert("Erro no upload: " + e.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleSaveBio = async () => {
    try {
      const { error } = await supabase
        .from('perfil_artista')
        .update({ bio: tempBio })
        .eq('id_artista', id);

      if (error) throw error;
      setArtista({ ...artista, bio: tempBio });
      setEditBio(false);
      alert("Descrição atualizada!");
    } catch (e) {
      alert("Erro ao salvar bio: " + e.message);
    }
  };

  const handleCadastrarObra = async (e) => {
    e.preventDefault();
    if (!novaObra.arquivo) return alert("Selecione um arquivo!");

    setUploading(true);
    try {
      const fileExt = novaObra.arquivo.name.split('.').pop();
      const fileName = `obra_${id}_${Date.now()}.${fileExt}`;
      
      const { error: upErr } = await supabase.storage
        .from('obras')
        .upload(fileName, novaObra.arquivo);

      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from('obras')
        .getPublicUrl(fileName);

      const { error: insErr } = await supabase.from('obras').insert([
        { 
          id_artista: id, 
          id_categoria: mapaCategorias[novaObra.categoria],
          titulo: novaObra.titulo,
          descricao: novaObra.descricao,
          imagem_url: publicUrl 
        }
      ]);

      if (insErr) throw insErr;
      
      alert("Obra cadastrada com sucesso!");
      setShowModalNova(false);
      setNovaObra({ titulo: "", descricao: "", categoria: "Desenho", arquivo: null });
      
      // Em vez de reload, você poderia buscar os dados novamente, mas reload funciona:
      window.location.reload(); 
    } catch (err) { 
      alert("Erro ao cadastrar: " + err.message); 
    } finally { 
      setUploading(false); 
    }
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

  const salvarEdicaoObra = async () => {
    if (!obraSelecionada) return;
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
      const obrasAtualizadas = artista.obras.map(o =>
        o.id_obra === obraSelecionada.id_obra ? { ...o, ...formEdicao, id_categoria: mapaCategorias[formEdicao.categoria] } : o
      );
      setArtista({ ...artista, obras: obrasAtualizadas });
      setModoEdicao(false);
      alert("Obra atualizada!");
    } catch (err) {
      alert(err.message);
    }
  };

  const deletarObra = async () => {
    if (!obraSelecionada || !window.confirm("Excluir esta obra?")) return;
    try {
      const { error } = await supabase.from('obras').delete().eq('id_obra', obraSelecionada.id_obra);
      if (error) throw error;
      setArtista({ ...artista, obras: artista.obras.filter(o => o.id_obra !== obraSelecionada.id_obra) });
      setShowModalDetalhe(false);
      alert("Excluída!");
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading-state">Carregando perfil...</div>;

  return (
    <div className="perfil-container page-no-header">
      
      {showCropper && (
        <div className="modal-overlay" style={{zIndex: 5000}}>
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3>Ajustar Imagem</h3>
              <button className="btn-close" onClick={() => setShowCropper(false)}><FiX size={24}/></button>
            </div>
            <div className="modal-body">
              <Cropper
                src={imageToCrop}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={tipoUpload === 'foto_perfil_url' ? 1 : 16/9}
                aspectRatio={tipoUpload === 'foto_perfil_url' ? 1 : 16/9}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={1}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCropper(false)}>Cancelar</button>
              <button className="btn-submit-green" onClick={handleFinalUpload}>Salvar Ajuste</button>
            </div>
          </div>
        </div>
      )}

      <div className="topo-navegacao">
        <button className="btn-voltar-simples" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Voltar
        </button>
      </div>
      
      <div className="perfil-header-visual">
        <div className="banner-fundo-novo editavel" style={{ backgroundImage: `url(${artista?.banner_url})` }}>
          <label className="overlay-alterar-banner">
            <FiImage size={24} /> <span>{uploading ? "Carregando..." : "Alterar Capa"}</span>
            <input type="file" className="input-file-hidden" accept="image/*" onChange={(e) => handleSelectFile(e, 'banner_url')} disabled={uploading} />
          </label>
          <div className="foto-perfil-central">
            <img src={artista?.foto_perfil_url} alt="Perfil" style={{ opacity: uploading ? 0.6 : 1 }} />
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
              <button className="btn-edit-small" onClick={() => setEditBio(true)}><FiEdit2 /> Editar</button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-small" onClick={handleSaveBio}><FiCheck /> Salvar</button>
                <button className="btn-cancel-small" onClick={() => { setEditBio(false); setTempBio(artista.bio); }}><FiX /></button>
              </div>
            )}
          </div>
          <textarea 
            className="textarea-edit" 
            value={tempBio} 
            onChange={(e) => setTempBio(e.target.value)} 
            disabled={!editBio} 
            placeholder="Fale um pouco sobre sua trajetória artística..."
          />
        </div>
      </div>

      <section className="secao-obras-v2">
        <div className="header-obras-v2">
          <h2>Suas Obras</h2>
          <button className="btn-adicionar-verde" onClick={() => setShowModalNova(true)}>
            <FiPlus /> Adicionar Nova Obra
          </button>
        </div>
        <div className="grid-obras-clean">
          {artista?.obras?.length > 0 ? artista.obras.map(obra => (
            <div key={obra.id_obra} className="card-obra-minimal clickable" onClick={() => abrirDetalhes(obra)}>
              <div className="img-container">
                <img src={obra.imagem_url} alt={obra.titulo} />
              </div>
              <div className="info-obra-bottom">
                <h3>{obra.titulo}</h3>
              </div>
            </div>
          )) : <p className="sem-obras">Você ainda não cadastrou nenhuma obra.</p>}
        </div>
      </section>

      {/* MODAL NOVA OBRA */}
      {showModalNova && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✨ Cadastrar Nova Obra</h3>
              <button className="btn-close" onClick={() => setShowModalNova(false)}><FiX size={24}/></button>
            </div>
            <form onSubmit={handleCadastrarObra}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label>Título da Obra *</label>
                  <input type="text" required value={novaObra.titulo} onChange={e => setNovaObra({...novaObra, titulo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Categoria *</label>
                  <select required value={novaObra.categoria} onChange={e => setNovaObra({...novaObra, categoria: e.target.value})}>
                    {categoriasLista.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea value={novaObra.descricao} onChange={e => setNovaObra({...novaObra, descricao: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Arquivo *</label>
                  <label className="upload-dropzone">
                    <FiUploadCloud size={24} />
                    <span>{novaObra.arquivo ? novaObra.arquivo.name : "Clique para selecionar"}</span>
                    <input type="file" className="input-file-hidden" accept="image/*,video/*" required onChange={e => setNovaObra({...novaObra, arquivo: e.target.files[0]})} />
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModalNova(false)}>Cancelar</button>
                <button type="submit" className="btn-submit-green" disabled={uploading}>Publicar Obra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHE/EDIÇÃO OBRA */}
      {showModalDetalhe && obraSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Obra" : obraSelecionada.titulo}</h3>
              <button className="btn-close" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}><FiX size={24}/></button>
            </div>
            <div className="modal-body">
              <img src={obraSelecionada.imagem_url} alt={obraSelecionada.titulo} style={{ width: '100%', borderRadius: '16px', maxHeight: '340px', objectFit: 'cover' }} />
              {!modoEdicao ? (
                <>
                  <div className="categoria-badge">{mapaCategoriasInverso[obraSelecionada.id_categoria]}</div>
                  <div style={{marginTop: '15px'}}><strong>Descrição:</strong><br/>{obraSelecionada.descricao || <em>Sem descrição</em>}</div>
                </>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                  <input value={formEdicao.titulo} onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})} />
                  <select value={formEdicao.categoria} onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})}>
                    {categoriasLista.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea value={formEdicao.descricao} onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})} rows={4} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modoEdicao ? (
                <>
                  <button className="btn-cancel" onClick={() => setModoEdicao(false)}>Cancelar</button>
                  <button className="btn-submit-green" onClick={salvarEdicaoObra}>Salvar</button>
                </>
              ) : (
                <>
                  <button className="btn-edit-small" onClick={() => setModoEdicao(true)}><FiEdit2 /> Editar</button>
                  <button className="btn-delete" onClick={deletarObra}><FiTrash2 /> Excluir</button>
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