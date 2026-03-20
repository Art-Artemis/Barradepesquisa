import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabaseClient"; 
import { FiPlus, FiArrowLeft, FiCamera, FiEdit2, FiCheck, FiX, FiImage, FiUploadCloud, FiTrash2 } from 'react-icons/fi'; 
import './PaginaArtista.css';

const PaginaArtista = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [artista, setArtista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editBio, setEditBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [showModalNova, setShowModalNova] = useState(false);
  const [novaObra, setNovaObra] = useState({ 
    titulo: "", 
    descricao: "", 
    categoria: "Desenho", 
    arquivo: null 
  });

  // Estados para detalhes e edição de obra
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [showModalDetalhe, setShowModalDetalhe] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({ titulo: "", descricao: "", categoria: "" });

  const categoriasLista = ['Desenho', 'Pintura', 'Música', 'Literatura', 'Fotografia', 'Escultura'];

  const mapaCategorias = {
    'Desenho': 1,
    'Pintura': 2,
    'Música': 3,
    'Literatura': 4,
    'Fotografia': 5,
    'Escultura': 6
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
          setArtista(data);
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

  const handleUploadImagem = async (event, campo) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${campo}_${id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artistas')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artistas')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('perfil_artista')
        .update({ [campo]: publicUrl })
        .eq('id_artista', id);

      if (updateError) throw updateError;

      setArtista({ ...artista, [campo]: publicUrl });
      alert("Imagem atualizada!");
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setUploading(false); 
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
        o.id_obra === obraSelecionada.id_obra
          ? { ...o, ...formEdicao, id_categoria: mapaCategorias[formEdicao.categoria] }
          : o
      );

      setArtista({ ...artista, obras: obrasAtualizadas });
      setModoEdicao(false);
      alert("Obra atualizada com sucesso!");
    } catch (err) {
      alert("Erro ao atualizar obra: " + err.message);
    }
  };

  const deletarObra = async () => {
    if (!obraSelecionada) return;
    if (!window.confirm("Tem certeza que deseja excluir esta obra?")) return;

    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id_obra', obraSelecionada.id_obra);

      if (error) throw error;

      const obrasRestantes = artista.obras.filter(o => o.id_obra !== obraSelecionada.id_obra);
      setArtista({ ...artista, obras: obrasRestantes });
      
      setShowModalDetalhe(false);
      setObraSelecionada(null);
      alert("Obra excluída com sucesso!");
    } catch (err) {
      alert("Erro ao excluir obra: " + err.message);
    }
  };

  if (loading) return <div className="loading-state">Carregando perfil...</div>;

  return (
    <div className="perfil-container page-no-header">
      <div className="topo-navegacao">
        <button className="btn-voltar-simples" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Voltar
        </button>
      </div>
      
      <div className="perfil-header-visual">
        <div className="banner-fundo-novo editavel" style={{ backgroundImage: `url(${artista?.banner_url})` }}>
          <label className="overlay-alterar-banner">
            <FiImage size={24} /> <span>{uploading ? "Enviando..." : "Alterar Capa"}</span>
            <input type="file" className="input-file-hidden" onChange={(e) => handleUploadImagem(e, 'banner_url')} disabled={uploading} />
          </label>
          <div className="foto-perfil-central">
            <img src={artista?.foto_perfil_url} alt="Perfil" style={{ opacity: uploading ? 0.6 : 1 }} />
            <label className="icon-camera-overlay clickable">
              <FiCamera />
              <input type="file" className="input-file-hidden" onChange={(e) => handleUploadImagem(e, 'foto_perfil_url')} disabled={uploading} />
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
            <div 
              key={obra.id_obra} 
              className="card-obra-minimal clickable"
              onClick={() => abrirDetalhes(obra)}
              style={{ cursor: 'pointer' }}
            >
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

      {/* Modal Nova Obra */}
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
                  <input 
                    type="text" 
                    placeholder="Ex: Pôr do Sol no IFMA" 
                    required 
                    value={novaObra.titulo}
                    onChange={e => setNovaObra({...novaObra, titulo: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Categoria *</label>
                  <select 
                    required
                    value={novaObra.categoria}
                    onChange={e => setNovaObra({...novaObra, categoria: e.target.value})}
                  >
                    {categoriasLista.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Descrição da Obra</label>
                  <textarea 
                    placeholder="Fale sobre a técnica..." 
                    value={novaObra.descricao}
                    onChange={e => setNovaObra({...novaObra, descricao: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Arquivo (Imagem ou Vídeo) *</label>
                  <label className="upload-dropzone">
                    <FiUploadCloud size={24} />
                    <span>{novaObra.arquivo ? novaObra.arquivo.name : "Clique para selecionar o arquivo"}</span>
                    <input 
                      type="file" 
                      className="input-file-hidden" 
                      accept="image/*,video/*"
                      required
                      onChange={e => setNovaObra({...novaObra, arquivo: e.target.files[0]})} 
                    />
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModalNova(false)}>Cancelar</button>
                <button type="submit" className="btn-submit-green" disabled={uploading}>
                  {uploading ? "Fazendo Upload..." : "Publicar Obra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes / Edição da Obra */}
      {showModalDetalhe && obraSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Obra" : obraSelecionada.titulo}</h3>
              <button className="btn-close" onClick={() => { setShowModalDetalhe(false); setModoEdicao(false); }}>
                <FiX size={24}/>
              </button>
            </div>

            <div className="modal-body">
              {obraSelecionada.imagem_url && (
                <img 
                  src={obraSelecionada.imagem_url} 
                  alt={obraSelecionada.titulo}
                  style={{ width: '100%', borderRadius: '16px', maxHeight: '340px', objectFit: 'cover' }}
                />
              )}

              {!modoEdicao ? (
                <>
                  <div className="categoria-badge">
                    {mapaCategoriasInverso[obraSelecionada.id_categoria] || "Sem categoria"}
                  </div>

                  <div>
                    <strong>Descrição:</strong><br/>
                    {obraSelecionada.descricao || <em>Sem descrição cadastrada</em>}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Título</label>
                    <input 
                      value={formEdicao.titulo}
                      onChange={e => setFormEdicao({...formEdicao, titulo: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={formEdicao.categoria}
                      onChange={e => setFormEdicao({...formEdicao, categoria: e.target.value})}
                    >
                      {categoriasLista.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Descrição</label>
                    <textarea 
                      value={formEdicao.descricao}
                      onChange={e => setFormEdicao({...formEdicao, descricao: e.target.value})}
                      rows={5}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {modoEdicao ? (
                <>
                  <button className="btn-cancel" onClick={() => setModoEdicao(false)}>
                    Cancelar
                  </button>
                  <button className="btn-submit-green" onClick={salvarEdicaoObra}>
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-edit-small" 
                    onClick={() => setModoEdicao(true)}
                  >
                    <FiEdit2 /> Editar
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={deletarObra}
                  >
                    <FiTrash2 /> Excluir
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