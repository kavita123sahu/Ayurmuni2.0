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
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const res = await getBanners(screen, serviceCategoryId);

      if (!mountedRef.current) return;

      const next = Array.isArray(res?.data) ? res.data : [];

      setImages(prev => {
        if (
          prev.length === next.length &&
          prev.every((b, i) => b?.id === next[i]?.id)
        ) {
          return prev;
        }
        return next;
      });
      hasLoadedRef.current = true;
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
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
