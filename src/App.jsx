import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Contato from './pages/Contato'; 
import Cadastro from './pages/Cadastro'; 
import Login from './pages/Login';
import Admin from './pages/Admin';
import PaginaArtista from './pages/PaginaArtista';

import './App.css';

function AppContent() {
  const location = useLocation();
  const rotaAtual = location.pathname.toLowerCase().replace(/\/$/, "") || "/";

 
  const [pesquisa, setPesquisa] = useState('');

  const rotasSemHeader = ['/login', '/cadastro', '/admin', '/contato'];
  const isArtista = rotaAtual.startsWith('/artista');
  const esconderHeader = rotasSemHeader.includes(rotaAtual) || isArtista;

  const rotasSemFooter = ['/admin']; 
  const esconderFooter = rotasSemFooter.includes(rotaAtual) || isArtista;

  return (
    <div id="root">
      {/* Header com pesquisa */}
      {!esconderHeader && (
        <Header setPesquisa={setPesquisa} />
      )}

      <div className="main-content-wrapper">
        <Routes>
          {/* 👇 PASSANDO pesquisa pra Home */}
          <Route path="/" element={<Home pesquisa={pesquisa} />} />

          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/artista/:id" element={<PaginaArtista />} />
        </Routes>
      </div>
      
      {!esconderFooter && <Footer />}
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