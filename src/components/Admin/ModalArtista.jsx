import React from 'react';
import { FiX, FiImage } from 'react-icons/fi';

const ModalArtista = ({ isOpen, onClose, onSave, formData, setFormData, files, setFiles, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-in">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-purple">🎨 Novo Artista</h2>
          <button className="btn-close-modal" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={onSave} className="form-new-design purple-theme">
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
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalArtista;