import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Banner from '../components/Banner';
import HomeObras from './HomeObras';
import './Home.css';

const Home = ({ pesquisa }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar banners:', error);
      } else {
        setBanners(data || []);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="home-content">
      {/* 1. Seção do Banner */}
      <section className="banner-section">
        {banners.length > 0 && <Banner noticias={banners} />}
        {banners.length === 0 && (
          <div className="no-banner">Nenhum banner ativo no momento</div>
        )}
      </section>

      {/* 2. Conteúdo principal: obras */}
      <HomeObras pesquisa={pesquisa} />

    </div>
  );
};

export default Home;