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

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: window.location.origin + '/login',
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('duplicate key')) {
        setErrorMsg('Esse e-mail já está cadastrado.');
      } else if (error.message.includes('weak password')) {
        setErrorMsg('Senha fraca. Use mais caracteres, números e símbolos.');
      } else {
        setErrorMsg(error.message);
      }
      console.error('Erro no cadastro:', error);
    } else if (data.user) {
      setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmaSenha('');
    } else {
      setErrorMsg('Algo deu errado. Tente novamente.');
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

          {errorMsg && (
            <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegistro} className="cadastro-form">
            <input
              type="text"
              placeholder="Seu Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            {/* Campo Senha com botão de visualizar */}
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Crie uma senha (mín. 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                }}
                disabled={loading}
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Campo Confirma Senha com botão de visualizar */}
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type={mostrarConfirmaSenha ? 'text' : 'password'}
                placeholder="Confirme a senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                }}
                disabled={loading}
              >
                {mostrarConfirmaSenha ? '🙈' : '👁️'}
              </button>
            </div>

            <button
              type="submit"
              className="help-button"
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                Acesse aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;