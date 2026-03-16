import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato';
import './Cadastro.css'; // Reutilizando o mesmo CSS (ou crie Login.css se preferir)

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      // Mensagens mais amigáveis
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Confirme seu e-mail antes de entrar.');
      } else {
        setErrorMsg(error.message);
      }
      console.error('Erro no login:', error);
      setLoading(false);
      return;
    }

    // Pega o user com claims (app_metadata)
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const role = user.app_metadata?.role || 'user'; // default 'user' se não tiver

      setSuccessMsg('Login realizado com sucesso!');
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500); // Pequeno delay para ver a mensagem

      // Limpa campos
      setEmail('');
      setSenha('');
    } else {
      setErrorMsg('Usuário não encontrado após login.');
    }

    setLoading(false);
  };

  return (
    <>
      <HeaderContato />
      <div className="cadastro-container">
        <div className="contact-card">
          <h2 className="card-title" style={{ color: '#8b5cf6', marginBottom: '20px' }}>
            Entrar no Studio Besouro
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

          <form onSubmit={handleLogin} className="cadastro-form">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            {/* Campo Senha com visualizar */}
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Sua senha"
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

            <button
              type="submit"
              className="help-button"
              disabled={loading}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            <p>
              Ainda não tem conta?{' '}
              <Link to="/cadastro" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;