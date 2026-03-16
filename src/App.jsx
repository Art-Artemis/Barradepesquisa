import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contato from './pages/Contato'; 
import Cadastro from './pages/Cadastro'; 
import Login from './pages/Login';
import Admin from './pages/Admin';

import './App.css';

function AppContent() {
  const location = useLocation();

  // Adicionamos o /admin na lista de páginas sem o Header principal
  const caminhosSemHeaderPadrao = ['/contato', '/cadastro', '/login', '/admin'];
  const esconderHeaderPadrao = caminhosSemHeaderPadrao.includes(location.pathname);

  return (
    <div id="root">
      {!esconderHeaderPadrao && <Header />}

      <div className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      
      {/* Esconde o footer no admin se preferir um visual mais limpo */}
      {location.pathname !== '/admin' && <Footer />}
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