import { useCallback, useEffect, useState } from 'react';
import {
  BannerScreen,
  getBanners,
  normalizeBannerImages,
} from '../services/BannerService';

export const useBanners = (screen: BannerScreen) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBanners(screen);
      const next = Array.isArray(res?.data) ? res.data : [];
      setBanners(next);
      setImages(
        Array.isArray(res?.images) && res.images.length
          ? res.images
          : normalizeBannerImages(next),
      );
    } finally {
      setLoading(false);
    }
  }, [screen]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { banners, images, loading, refresh };
};
