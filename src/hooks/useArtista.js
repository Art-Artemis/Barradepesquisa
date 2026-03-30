import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useArtista = (id) => {
  const [artista, setArtista] = useState(null);
  const [loading, setLoading] = useState(true);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfil_artista')
        .select('*, obras(*)')
        .eq('id_artista', id)
        .single();

      if (error) throw error;
      if (data) {
        const artistaComCache = {
          ...data,
          foto_perfil_url: data.foto_perfil_url ? `${data.foto_perfil_url}?t=${Date.now()}` : null,
          banner_url: data.banner_url ? `${data.banner_url}?t=${Date.now()}` : null
        };
        setArtista(artistaComCache);
      }
    } catch (err) {
      console.error("Erro:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) buscarDados();
  }, [id]);

  return { artista, setArtista, loading, buscarDados };
};