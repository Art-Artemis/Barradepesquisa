import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// 1. Importação dos Componentes de Layout
import Header from './components/Header';
import Footer from './components/Footer';

// 2. Importação das Páginas
import Home from './pages/Home';
import Contato from './pages/Contato'; 
import Cadastro from './pages/Cadastro'; 
import Login from './pages/Login';
import Admin from './pages/Admin';
import PaginaArtista from './pages/PaginaArtista';

// 3. Estilos
import './App.css';

function AppContent() {
  const location = useLocation();
  const rotaAtual = location.pathname.toLowerCase().replace(/\/$/, "") || "/";

  // --- LÓGICA DO HEADER ---
  // Escondemos o Header padrão no Login, Cadastro, Admin, Artista e agora no Contato (pois o Contato tem o seu próprio)
  const rotasSemHeader = ['/login', '/cadastro', '/admin', '/contato'];
  const isArtista = rotaAtual.startsWith('/artista');
  
  const esconderHeader = rotasSemHeader.includes(rotaAtual) || isArtista;

  // --- LÓGICA DO FOOTER ---
  // Aqui deixamos o Footer aparecer em quase tudo. 
  // Ele só vai sumir no Admin ou se você estiver na página de um Artista.
  const rotasSemFooter = ['/admin']; 
  const esconderFooter = rotasSemFooter.includes(rotaAtual) || isArtista;

  return (
    <div id="root">
      {/* Header condicional */}
      {!esconderHeader && <Header />}

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
      
      {/* Footer condicional (Agora visível no Contato/Home/Login/Cadastro) */}
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