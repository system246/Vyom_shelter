import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { fetchProperties } from '../../services/propertyApi';
import PropertyCard from '../../components/property/PropertyCard';
import SelectField from '../../components/ui/SelectField';
import InputField from '../../components/ui/InputField';
import { PROPERTY_TYPES } from '../../utils/constants';

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const listingType = params.get('listingType') || 'sale';

  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    city: params.get('city') || '',
    propertyType: params.get('propertyType') || '',
    minPrice: '', maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData]       = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProperties({ ...filters, listingType, page });
      setData(res);
    } catch { /* swallow — show empty state */ }
    finally { setLoading(false); }
  }, [filters, listingType, page]);

  useEffect(() => { load(); }, [load]);

  const setListingType = (lt) => { setParams({ listingType: lt }); setPage(1); };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ v: 'sale', l: 'Buy' }, { v: 'rent', l: 'Rent' }].map((t) => (
          <button
            key={t.v}
            onClick={() => setListingType(t.v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              listingType === t.v ? 'bg-[#1a3a5c] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search by locality, city, project, keyword..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <button type="button" onClick={() => setShowFilters((s) => !s)} className="btn-secondary">
          <SlidersHorizontal size={15} /> Filters
        </button>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <InputField label="City" value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. Lucknow" />
          <SelectField label="Property Type" options={PROPERTY_TYPES} value={filters.propertyType} onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))} />
          <InputField label="Min Price" type="number" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} />
          <InputField label="Max Price" type="number" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading properties...
        </div>
      ) : data.data.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-gray-400 text-sm mb-3">No verified properties found matching your search.</p>
          <Link to="/sell" className="text-[#1a3a5c] text-sm font-medium underline">List your property instead?</Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{data.total} verified properties found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {data.data.map((p) => <PropertyCard key={p.propertyId} property={p} />)}
          </div>
          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
