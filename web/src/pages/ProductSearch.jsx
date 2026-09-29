import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ProductCard from '../components/ProductCard';
import EnhancedSearchField from '../components/EnhancedSearchField';
import useCategoryProducts from '../hooks/useCategoryProducts';
import useDashboardCategories from '../hooks/useDashboardCategories';
import { getServiceCategoryId } from '../home/serviceCategories';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

export default function ProductSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'all';
  const [q, setQ] = useState(params.get('q') || '');
  const [submitted, setSubmitted] = useState(q);
  const { addToHistory } = useGlobalSearch();
  const { categories, loading: homeLoading } = useDashboardCategories();
  const serviceCategoryId = useMemo(() => {
    if (mode === 'health') return getServiceCategoryId(categories, 'medicine');
    if (mode === 'product') return getServiceCategoryId(categories, 'products');
    return undefined;
  }, [categories, mode]);

  const filter = useMemo(
    () => ({
      search: submitted,
      service_category_id: submitted ? undefined : serviceCategoryId,
    }),
    [submitted, serviceCategoryId],
  );

  const { products, loading, loadingMore, hasMore, loadMore } = useCategoryProducts(
    filter,
    [],
    { enabled: !homeLoading },
  );

  const onSubmit = (query) => {
    const next = (query || q).trim();
    if (next) {
      setSubmitted(next);
      addToHistory(next); // Save to search history
      navigate(`/search?mode=${mode}&q=${encodeURIComponent(next)}`, {
        replace: true,
      });
    }
  };

  const handleSelect = (query) => {
    setQ(query);
    onSubmit(query);
  };

  // Update local state when URL changes
  useEffect(() => {
    const urlQuery = params.get('q') || '';
    setQ(urlQuery);
    setSubmitted(urlQuery);
  }, [params]);

  return (
    <AppShell tab="products">
      <section className="catalog-page store-page search-page">
        <header className="catalog-head store-head">
          <div>
            <button type="button" className="text-back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1>Search</h1>
            <p>Doctors, medicines and products</p>
          </div>
        </header>
        <div className="search-enhanced-wrapper">
          <EnhancedSearchField
            value={q}
            onChange={setQ}
            onSubmit={onSubmit}
            onSelect={handleSelect}
            placeholder="Search doctors, medicines and products..."
            showHistory={true}
            showSuggestions={true}
            autoFocus={!submitted}
          />
        </div>
        {loading && products.length === 0 ? (
          <p className="muted">Searching…</p>
        ) : products.length === 0 ? (
          <p className="empty-copy">No products found</p>
        ) : (
          <div className="catalog-grid">
            {products.map((item) => (
              <ProductCard key={item.variant_id || item.id} item={item} />
            ))}
          </div>
        )}
        {hasMore ? (
          <div className="load-more-wrap">
            <button type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
