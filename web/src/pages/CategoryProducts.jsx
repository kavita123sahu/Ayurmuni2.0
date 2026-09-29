import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Leaf, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProductCard from '../components/ProductCard';
import PageHeader from '../components/PageHeader';
import useProductCategories from '../hooks/useProductCategories';
import useCategoryProducts from '../hooks/useCategoryProducts';
import { mapProductCategory, normalizeApiList, resolveImageUrl } from '../home/catalog';
import { getHealthCategories } from '../services/productService';
import {
  Button,
  Chip,
  Disclaimer,
  EmptyState,
  Modal,
  SearchField,
  SkeletonGrid,
} from '../components/ui';
import { STORE_COPY as T } from '../content/store';
import '../design/pages/store.css';

export default function CategoryProducts() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'health' ? 'health' : 'product';
  const serviceCategoryId = params.get('service') || null;
  const brandId = params.get('brand') || '';
  const initialCategory = params.get('category') || 'all';
  const title =
    params.get('name') ||
    (brandId ? 'Brand' : mode === 'health' ? 'Shop by concern' : 'Shop by category');

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const activeCategoryId = selectedCategoryId === 'all' ? null : selectedCategoryId;
  const [healthCategories, setHealthCategories] = useState([]);
  const [search, setSearch] = useState('');
  
  // Filter & Sort States
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { categories: topCategories, loading: categoriesLoading } = useProductCategories(
    null,
    mode === 'product' ? serviceCategoryId : null,
  );
  const { categories: subcategories } = useProductCategories(
    mode === 'product' && !brandId ? activeCategoryId : null,
    mode === 'product' ? serviceCategoryId : null,
  );
  const visibleSubs =
    mode === 'product' && !brandId && activeCategoryId ? subcategories : [];
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);

  useEffect(() => {
    if (mode !== 'health') return undefined;
    let alive = true;
    (async () => {
      const res = await getHealthCategories(
        serviceCategoryId ? { service_category_id: serviceCategoryId } : undefined,
      );
      if (!alive) return;
      setHealthCategories(
        normalizeApiList(res)
          .map(mapProductCategory)
          .filter((item) => item.id),
      );
    })();
    return () => {
      alive = false;
    };
  }, [mode, serviceCategoryId]);

  const productFilter = useMemo(() => {
    if (brandId) {
      return {
        brand_name_id: brandId,
        service_category_id: serviceCategoryId,
      };
    }
    if (mode === 'health') {
      return {
        health_category_id: activeCategoryId,
        health_disease_id: selectedSubcategoryId,
        service_category_id: serviceCategoryId,
      };
    }
    return {
      id: activeCategoryId,
      product_subcategory_id: selectedSubcategoryId,
      service_category_id: serviceCategoryId,
    };
  }, [brandId, mode, activeCategoryId, selectedSubcategoryId, serviceCategoryId]);

  const { products, loading, loadingMore, hasMore, loadMore, refresh, refreshing } =
    useCategoryProducts(productFilter, []);

  // Apply client-side filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = Number(product.price || product.selling_price || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter((product) => {
        const rating = Number(product.rating || product.average_rating || 0);
        return rating >= minRating;
      });
    }

    // Filter by stock
    if (inStockOnly) {
      filtered = filtered.filter((product) => {
        const stock = Number(product.stock || product.in_stock || 0);
        return stock > 0;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      const priceA = Number(a.price || a.selling_price || 0);
      const priceB = Number(b.price || b.selling_price || 0);
      const ratingA = Number(a.rating || a.average_rating || 0);
      const ratingB = Number(b.rating || b.average_rating || 0);

      switch (sortBy) {
        case 'price_low':
          return priceA - priceB;
        case 'price_high':
          return priceB - priceA;
        case 'rating':
          return ratingB - ratingA;
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'relevance':
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, priceRange, minRating, inStockOnly, sortBy]);

  const categoryList = brandId
    ? []
    : [
        { id: 'all', name: T.all, image_url: '' },
        ...(mode === 'health' ? healthCategories : topCategories),
      ];

  const hasActiveFilters = 
    priceRange[0] !== 0 || 
    priceRange[1] !== 10000 || 
    minRating > 0 || 
    inStockOnly ||
    sortBy !== 'relevance';

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
  };

  const goSearch = (value) => {
    const query = String(value || search || '').trim();
    const searchMode = mode === 'health' ? 'health' : 'product';
    navigate(`/search?mode=${searchMode}${query ? `&q=${encodeURIComponent(query)}` : ''}`);
  };

  const selectCategory = (id) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
  };

  return (
    <AppShell tab="products">
      <div className="st-page">
        <PageHeader title={title} subtitle={T.browseCatalog}>
          <SearchField
            value={search}
            onChange={setSearch}
            onSubmit={goSearch}
            placeholder={T.searchCollection}
            label={T.searchCollection}
          />
        </PageHeader>

        <div className={`st-browse${brandId ? ' st-browse--solo' : ''}`}>
          {brandId ? null : (
            <aside className="st-side" aria-label={T.categories}>
              <h2>{T.categories}</h2>
              {categoriesLoading && !categoryList.length ? (
                <p className="st-side__loading">{T.refreshing}</p>
              ) : (
                <ul className="st-side__list">
                  {categoryList.map((item) => {
                    const on = selectedCategoryId === item.id;
                    const img = resolveImageUrl(item);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`st-side__item${on ? ' is-on' : ''}`}
                          onClick={() => selectCategory(item.id)}
                        >
                          <span className="st-side__img" aria-hidden>
                            {img ? <img src={img} alt="" /> : <Leaf size={14} />}
                          </span>
                          {item.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          )}

          <div className="st-main">
            {brandId ? null : (
              <div className="st-cat-mobile" role="tablist" aria-label={T.categories}>
                {categoryList.map((item) => (
                  <Chip
                    key={item.id}
                    selected={selectedCategoryId === item.id}
                    onClick={() => selectCategory(item.id)}
                  >
                    {item.name}
                  </Chip>
                ))}
              </div>
            )}

            {visibleSubs.length > 0 ? (
              <div className="st-subcats" role="group" aria-label="Subcategories">
                {visibleSubs.map((item) => (
                  <Chip
                    key={item.id}
                    selected={selectedSubcategoryId === item.id}
                    onClick={() =>
                      setSelectedSubcategoryId((prev) => (prev === item.id ? null : item.id))
                    }
                  >
                    {item.name}
                  </Chip>
                ))}
              </div>
            ) : null}

            {/* Filter & Sort Controls */}
            <div className="st-controls">
              <div className="st-controls__info">
                <span>{filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} leadingIcon={<X size={14} />}>
                    Clear filters
                  </Button>
                )}
              </div>
              <div className="st-controls__actions">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="st-sort-select"
                  aria-label="Sort products"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  leadingIcon={<SlidersHorizontal size={16} />}
                >
                  Filters
                </Button>
              </div>
            </div}

            <div className="am-section-header">
              <div className="am-section-header__copy">
                <h2 className="am-section-header__title">{T.productsHeading}</h2>
              </div>
              <div className="am-section-header__action">
                <Button
                  variant="ghost"
                  size="sm"
                  loading={refreshing}
                  onClick={refresh}
                  leadingIcon={<RefreshCw size={16} aria-hidden />}
                >
                  {refreshing ? T.refreshing : T.refresh}
                </Button>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <SkeletonGrid count={6} className="am-product-grid" />
            ) : filteredAndSortedProducts.length === 0 ? (
              <EmptyState 
                title={hasActiveFilters ? "No products match filters" : T.emptyCategory} 
                description={hasActiveFilters ? "Try adjusting your filters" : T.emptyCategoryText}
                action={hasActiveFilters && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              />
            ) : (
              <ul className="am-product-grid">
                {filteredAndSortedProducts.map((item) => (
                  <li key={item.variant_id || item.id}>
                    <ProductCard item={item} />
                  </li>
                ))}
              </ul>
            )}

            {hasMore ? (
              <div className="st-more">
                <Button variant="secondary" loading={loadingMore} onClick={loadMore}>
                  {loadingMore ? T.loadingMore : T.loadMore}
                </Button>
              </div>
            ) : null}

            <Disclaimer />
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Products"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              clearFilters();
              setShowFilters(false);
            }}>
              Clear All
            </Button>
            <Button variant="primary" onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Price Range */}
          <div>
            <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              Price Range
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                min="0"
                placeholder="Min"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--am-border-color)',
                  borderRadius: 'var(--am-radius-md)',
                  fontSize: '14px'
                }}
              />
              <span>to</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                min="0"
                placeholder="Max"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--am-border-color)',
                  borderRadius: 'var(--am-radius-md)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--am-text-muted)' }}>
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              Minimum Rating
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(rating)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${minRating === rating ? 'var(--am-accent)' : 'var(--am-border-color)'}`,
                    background: minRating === rating ? 'var(--am-accent-bg)' : 'transparent',
                    borderRadius: 'var(--am-radius-md)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {rating === 0 ? 'All' : `${rating}★ & up`}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Filter */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Show in-stock products only
              </span>
            </label>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div style={{ 
              padding: '12px', 
              background: 'var(--am-bg-subtle)', 
              borderRadius: 'var(--am-radius-md)',
              fontSize: '12px',
              color: 'var(--am-text-muted)'
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Active Filters:</strong>
              {priceRange[0] !== 0 || priceRange[1] !== 10000 ? (
                <div>Price: ₹{priceRange[0]} - ₹{priceRange[1]}</div>
              ) : null}
              {minRating > 0 && <div>Rating: {minRating}★ and above</div>}
              {inStockOnly && <div>In stock only</div>}
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
