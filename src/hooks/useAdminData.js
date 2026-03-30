import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAdminData = () => {
  const [banners, setBanners] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [stats, setStats] = useState({ banners: 0, artistas: 0, obras: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: b } = await supabase.from('banner').select('*').order('created_at', { ascending: false });
      const { data: a } = await supabase.from('perfil_artista').select('*, obras(count)');
      const { count: o } = await supabase.from('obras').select('*', { count: 'exact', head: true });

      if (b) setBanners(b);
      if (a) setArtistas(a);
      setStats({ banners: b?.length || 0, artistas: a?.length || 0, obras: o || 0 });
    } catch (err) {
      console.error("Erro ao buscar dados:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  return { banners, artistas, stats, loading, setLoading, fetchData, uploadFile };
};