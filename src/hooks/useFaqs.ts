import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaqCategory,
  FaqItem,
  getFaqDetail,
  getFaqList,
} from '../services/FaqServices';

export const useFaqs = (options?: {
  category?: FaqCategory | null;
  autoLoad?: boolean;
}) => {
  const category = options?.category ?? null;
  const autoLoad = options?.autoLoad !== false;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (opts?: { isRefresh?: boolean; category?: FaqCategory | null }) => {
      const reqId = ++requestIdRef.current;
      try {
        if (opts?.isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const list = await getFaqList(
          opts?.category !== undefined ? opts.category : category,
        );
        if (reqId !== requestIdRef.current) return;
        setFaqs(list);
      } catch (e: any) {
        if (reqId !== requestIdRef.current) return;
        setError(e?.message || 'Unable to load FAQs');
        setFaqs([]);
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [category],
  );

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const refresh = useCallback(() => load({ isRefresh: true }), [load]);

  return {
    loading,
    refreshing,
    faqs,
    error,
    refresh,
    reload: load,
  };
};

export const useFaqDetail = (faqId?: string | null) => {
  const [loading, setLoading] = useState(!!faqId);
  const [faq, setFaq] = useState<FaqItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!faqId) {
      setFaq(null);
      setLoading(false);
      return;
    }
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const detail = await getFaqDetail(String(faqId));
      if (reqId !== requestIdRef.current) return;
      setFaq(detail);
    } catch (e: any) {
      if (reqId !== requestIdRef.current) return;
      setError(e?.message || 'Unable to load FAQ');
      setFaq(null);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [faqId]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, faq, error, reload: load };
};

export const filterFaqsBySearch = (faqs: FaqItem[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return faqs;
  return faqs.filter(item => {
    const hay = [
      item.question,
      item.answer,
      item.category,
      item.category_label,
      item.note,
      ...(item.steps || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
};

export const formatFaqUpdatedLabel = (faq?: FaqItem | null): string => {
  if (!faq) return '';
  const raw = faq.updated_at || faq.created_at;
  let datePart = '';
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      datePart = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  const minutes = Number(faq.read_minutes ?? faq.read_time);
  const readPart =
    Number.isFinite(minutes) && minutes > 0
      ? `${Math.round(minutes)} min read`
      : typeof faq.read_time === 'string' && faq.read_time.trim()
        ? String(faq.read_time).trim()
        : '';

  return [datePart ? `Updated ${datePart}` : '', readPart]
    .filter(Boolean)
    .join(' • ');
};

export const useMemoizedFaqCategories = (faqs: FaqItem[]) =>
  useMemo(() => {
    const present = new Set(
      faqs
        .map(f => String(f.category || '').toLowerCase())
        .filter(Boolean),
    );
    return present;
  }, [faqs]);
