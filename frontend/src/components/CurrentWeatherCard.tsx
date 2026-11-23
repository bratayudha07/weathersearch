import { CloudRain, Compass, MapPin, Thermometer } from 'lucide-react';
import { formatNumber } from '../lib/format';
import { iconForCode } from '../lib/weather-icon';
import type { CurrentWeather, Location } from '../types/weather';

interface CurrentWeatherCardProps {
  location: Location;
  current: CurrentWeather;
}

export function CurrentWeatherCard({ location, current }: CurrentWeatherCardProps) {
  const WeatherIcon = iconForCode(current.weather_code);

  return (
    <section className="border-border bg-card p-lg text-card-foreground relative overflow-hidden rounded-2xl border shadow-md">
      <div className="from-primary/10 via-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="bg-muted text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>Cuaca Saat Ini</span>
          </div>

          <div>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              {location.name}
            </h2>
            <p className="text-muted-foreground text-sm">{location.country}</p>
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
            <Compass className="h-3.5 w-3.5" />
            <span>
              Koordinat: {formatNumber(location.latitude, 2)}°,{' '}
              {formatNumber(location.longitude, 2)}°
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl">
            <WeatherIcon className="h-9 w-9" />
          </div>
          <div>
            <div className="text-foreground text-4xl font-semibold tracking-tight">
              {formatNumber(current.temperature)}°C
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {current.condition}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border mt-lg pt-md grid grid-cols-2 gap-3 border-t">
        <div className="bg-muted/70 flex items-center gap-3 rounded-xl p-3">
          <div className="bg-accent/15 text-accent flex h-9 w-9 items-center justify-center rounded-lg">
            <Thermometer className="h-4 w-4" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Suhu Terkini</p>
            <p className="text-foreground text-sm font-semibold">
              {formatNumber(current.temperature)} °C
            </p>
          </div>
        </div>

        <div className="bg-muted/70 flex items-center gap-3 rounded-xl p-3">
          <div className="bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <CloudRain className="h-4 w-4" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Curah Hujan</p>
            <p className="text-foreground text-sm font-semibold">
              {formatNumber(current.precipitation)} mm
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}