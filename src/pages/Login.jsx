import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import HeaderContato from '../components/HeaderContato';
import { FaEnvelope, FaKey } from "react-icons/fa"; // Manter react-icons para os ícones internos
import './Cadastro.css';

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

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: perfil, error: perfilError } = await supabase
          .from('usuario')
          .select('id_tipo_usuario')
          .eq('id_usuario', authData.user.id)
          .maybeSingle();

        if (perfilError) throw perfilError;

        if (!perfil) {
          setErrorMsg('Perfil não encontrado. Verifique se confirmou o e-mail.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Acesso autorizado! Redirecionando...');

        setTimeout(() => {
          if (Number(perfil.id_tipo_usuario) === 1) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorMsg(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
    } finally {
      setLoading(false);
    }
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
            <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="cadastro-form">
            <div className="email-wrapper" style={{ position: 'relative', marginBottom: '15px' }}> 
              <FaEnvelope className="input-icon" /> 
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading} 
                style={{
                  width: '85%',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  marginLeft: '35px',
                }}
              />
            </div>

            <div className="password-wrapper" style={{ position: 'relative', marginBottom: '20px' }}>
              <FaKey className="input-icon" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '85%',
                  paddingLeft: '20px',
                  paddingRight: '45px', // Aumentei o espaço para o olho não sobrepor o texto
                  marginLeft: '35px',
                }}
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
                  color: '#8b5cf6', // Roxo do Studio Besouro
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* Substituição dos emojis pelos ícones do Font Awesome */}
                <i className={mostrarSenha ? "fas fa-eye-slash" : "fas fa-eye"}></i>
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
                width: '100%'
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