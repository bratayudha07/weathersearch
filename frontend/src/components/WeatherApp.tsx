import { useState } from 'react';
import { AlertCircle, CloudSun } from 'lucide-react';
import { ApiError, fetchWeather } from '../lib/api';
import type { WeatherReport } from '../types/weather';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { DailyWeatherList } from './DailyWeatherList';
import { WeatherSearchForm } from './WeatherSearchForm';

export function WeatherApp() {
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError(null);

    try {
      const report = await fetchWeather(city);
      setWeather(report);
    } catch (err) {
      setWeather(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'Tidak dapat terhubung ke server backend. Pastikan server FastAPI sedang berjalan.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gap-lg flex flex-col">
      <WeatherSearchForm onSearch={handleSearch} loading={loading} />

      {error && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-2xl border p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Pencarian Gagal</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!weather && !loading && !error && (
        <div className="border-border bg-card/70 p-xl text-center rounded-2xl border border-dashed">
          <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
            <CloudSun className="h-6 w-6" />
          </div>
          <h2 className="text-foreground mt-3 text-base font-semibold">
            Mulai Cari Informasi Cuaca
          </h2>
          <p className="text-muted-foreground mx-auto mt-1 max-w-[440px] text-sm">
            Ketik nama kota atau pilih salah satu kota di atas untuk melihat kondisi
            cuaca saat ini serta ringkasan riwayat 7 hari terakhir.
          </p>
        </div>
      )}

      {weather && (
        <div className="gap-lg flex flex-col">
          <CurrentWeatherCard
            location={weather.location}
            current={weather.current_weather}
          />
          <DailyWeatherList days={weather.daily_history} />
        </div>
      )}
    </div>
  );
}