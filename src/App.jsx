import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contato from './pages/Contato'; 
import Cadastro from './pages/Cadastro'; 
import Login from './pages/Login';
import Admin from './pages/Admin';
import PaginaArtista from './pages/PaginaArtista';
import './App.css';

function AppContent() {
  const location = useLocation();

  // Verificação para rotas dinâmicas (ex: /artista/1)
  const isPaginaArtista = location.pathname.startsWith('/artista/');

  // 1. CORREÇÃO: Preenchi a variável que estava faltando/vazia no seu código
  const caminhosSemHeaderPadrao = [
    '/login', 
    '/cadastro', 
    '/admin'
  ];

  // 2. Lógica de decisão: Esconde se estiver na lista OU se for página de artista
  const esconderHeaderPadrao = caminhosSemHeaderPadrao.includes(location.pathname) || isPaginaArtista;

  return (
    <div id="root">
      {/* O Header só renderiza se esconderHeaderPadrao for falso */}
      {!esconderHeaderPadrao && <Header />}

      <div className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/artista/:id" element={<PaginaArtista />} />
        </Routes>
      </div>
      
      {/* O Footer segue a mesma lógica para manter a consistência visual */}
      {!esconderHeaderPadrao && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router> 
      <AppContent />
    </Router>
  );
}

export default App;