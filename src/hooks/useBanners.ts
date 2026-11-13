import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BannerScreen,
  getBanners,
} from '../services/BannerService';

export const useBanners = (
  screen: BannerScreen,
  serviceCategoryId?: string | null,
) => {
  const [banners] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchGenRef = useRef(0);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    const gen = ++fetchGenRef.current;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const res = await getBanners(screen, serviceCategoryId);

      if (!mountedRef.current || gen !== fetchGenRef.current) return;

      const next = Array.isArray(res?.data) ? res.data : [];
      // Always apply latest network payload on refresh
      setImages(next);
      hasLoadedRef.current = true;
    } finally {
      if (mountedRef.current && gen === fetchGenRef.current) {
        setLoading(false);
      }
    }
  }, [screen, serviceCategoryId]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { banners, images, loading, refresh };
};
