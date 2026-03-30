import React from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';

const ModalNovaObra = ({ show, onBlur, onSubmit, novaObra, setNovaObra, uploading, categoriasLista }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✨ Cadastrar Nova Obra</h3>
          <button className="btn-close" onClick={onBlur}><FiX size={24}/></button>
        </div>
        <form onSubmit={onSubmit}>
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
            <button type="button" className="btn-cancel" onClick={onBlur}>Cancelar</button>
            <button type="submit" className="btn-submit-green" disabled={uploading}>
                {uploading ? "Publicando..." : "Publicar Obra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaObra;