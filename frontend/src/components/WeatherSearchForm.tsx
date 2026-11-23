import { useState, type FormEvent } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';

interface WeatherSearchFormProps {
  onSearch: (city: string) => void;
  loading: boolean;
}

const POPULAR_CITIES = ['Cirebon', 'Bandung', 'Jakarta', 'Yogyakarta', 'Surabaya'];

export function WeatherSearchForm({ onSearch, loading }: WeatherSearchFormProps) {
  const [city, setCity] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!city.trim() || loading) return;
    onSearch(city.trim());
  };

  const handleQuickSelect = (selectedCity: string) => {
    if (loading) return;
    setCity(selectedCity);
    onSearch(selectedCity);
  };

  return (
    <section className="border-border bg-card p-lg text-card-foreground rounded-2xl border shadow-md">
      <form onSubmit={handleSubmit} className="gap-sm flex flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Masukkan nama kota atau daerah (contoh: Cirebon, Bandung)..."
            disabled={loading}
            className="border-border bg-muted/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring/30 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition outline-none focus:bg-white focus:ring-2 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="bg-primary hover:bg-secondary inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Cari Cuaca</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-md flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <MapPin className="h-3.5 w-3.5" />
          Pencarian cepat:
        </span>
        {POPULAR_CITIES.map((popularCity) => (
          <button
            key={popularCity}
            type="button"
            disabled={loading}
            onClick={() => handleQuickSelect(popularCity)}
            className="border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-primary cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50"
          >
            {popularCity}
          </button>
        ))}
      </div>
    </section>
  );
}