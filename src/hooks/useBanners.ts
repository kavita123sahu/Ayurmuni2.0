import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BannerScreen,
  getBanners,
  normalizeBannerImages,
  sameUriList,
} from '../services/BannerService';

export const useBanners = (
  screen: BannerScreen,
  serviceCategoryId?: string | null,
) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const res = await getBanners(screen, serviceCategoryId);
      if (!mountedRef.current) return;

      const next = Array.isArray(res?.data) ? res.data : [];
      const nextImages =
        Array.isArray(res?.images) && res.images.length
          ? res.images
          : normalizeBannerImages(next);

      setBanners(prev => {
        if (
          prev.length === next.length &&
          prev.every((b, i) => b?.id === next[i]?.id)
        ) {
          return prev;
        }
        return next;
      });
      setImages(prev => (sameUriList(prev, nextImages) ? prev : nextImages));
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
