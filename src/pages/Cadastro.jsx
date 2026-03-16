import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato';
import './Cadastro.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (senha !== confirmaSenha) {
      setErrorMsg('As senhas não conferem!');
      return;
    }

    if (senha.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // Realiza o cadastro no Auth do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome: nome }, // Metadados que o Trigger SQL vai ler
        emailRedirectTo: window.location.origin + '/login',
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('duplicate key')) {
        setErrorMsg('Esse e-mail já está cadastrado.');
      } else {
        setErrorMsg(error.message);
      }
    } else if (data.user) {
      // IMPORTANTE: Se o e-mail não chegar, lembre-se da dica de desativar "Confirm Email" no painel
      setSuccessMsg('Cadastro solicitado! Verifique seu e-mail (e a pasta de spam) para confirmar sua conta.');
      
      // Limpa campos
      setNome(''); setEmail(''); setSenha(''); setConfirmaSenha('');

      // Redireciona após um tempo maior para ele ler o aviso
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    }
  };

  return (
    <>
      <HeaderContato />
      <div className="cadastro-container">
        <div className="contact-card">
          <h2 className="card-title" style={{ color: '#8b5cf6', marginBottom: '20px' }}>
            Criar conta no Studio Besouro
          </h2>

          {errorMsg && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{successMsg}</div>}

          <form onSubmit={handleRegistro} className="cadastro-form">
            <input type="text" placeholder="Seu Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
            <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />

            <div style={{ position: 'relative' }}>
              <input type={mostrarSenha ? 'text' : 'password'} placeholder="Crie uma senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} style={{ width: '100%' }} />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input type={mostrarConfirmaSenha ? 'text' : 'password'} placeholder="Confirme a senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} required disabled={loading} style={{ width: '100%' }} />
              <button type="button" onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {mostrarConfirmaSenha ? '🙈' : '👁️'}
              </button>
            </div>

            <button type="submit" className="help-button" disabled={loading} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
              {loading ? 'Processando...' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Já tem uma conta? <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Acesse aqui</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;