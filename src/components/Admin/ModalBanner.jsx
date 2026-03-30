import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';

const ModalBanner = ({ isOpen, onClose, onSave, formData, setFormData, files, setFiles, loading, editingId }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-in">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingId ? '✏️ Editar Banner' : '✨ Novo Banner'}</h2>
          <button className="btn-close-modal" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={onSave} className="form-new-design">
          <div className="input-group">
            <label>Título Principal *</label>
            <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Descrição *</label>
            <textarea required value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Imagem {editingId && '(Deixe vazio para manter a atual)'}</label>
            <div className="file-input-wrapper">
              <label htmlFor="banner-upload" className="file-input-label">
                <FiImage /> {files.banner ? files.banner.name : "Escolher arquivo..."}
              </label>
              <input id="banner-upload" type="file" accept="image/*" onChange={e => setFiles({...files, banner: e.target.files[0]})} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-modal-save green" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Banner'}
            </button>
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBanner;