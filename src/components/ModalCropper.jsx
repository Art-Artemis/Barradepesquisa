import React from 'react';
import { FiX } from 'react-icons/fi';
import Cropper from "react-cropper";

const ModalCropper = ({ show, src, cropperRef, tipoUpload, onBlur, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" style={{zIndex: 5000}}>
      <div className="modal-content" style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h3>Ajustar Imagem</h3>
          <button className="btn-close" onClick={onBlur}><FiX size={24}/></button>
        </div>
        <div className="modal-body">
          <Cropper
            src={src}
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
          <button className="btn-cancel" onClick={onBlur}>Cancelar</button>
          <button className="btn-submit-green" onClick={onConfirm}>Salvar Ajuste</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCropper;