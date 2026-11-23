import { ArrowDown, ArrowUp, CalendarDays, Droplets } from 'lucide-react';
import { formatDay, formatNumber } from '../lib/format';
import { iconForCode } from '../lib/weather-icon';
import type { DailyWeather } from '../types/weather';

interface DailyWeatherListProps {
  days: DailyWeather[];
}

export function DailyWeatherList({ days }: DailyWeatherListProps) {
  return (
    <section className="border-border bg-card p-lg text-card-foreground rounded-2xl border shadow-md">
      <div className="mb-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-primary h-5 w-5" />
          <h3 className="text-foreground text-base font-semibold">
            Riwayat Cuaca 7 Hari Terakhir
          </h3>
        </div>
        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
          {days.length} hari
        </span>
      </div>

      <div className="divide-border divide-y">
        {days.map((day) => {
          const DayIcon = iconForCode(day.weather_code);

          return (
            <div
              key={day.date}
              className="hover:bg-muted/50 flex flex-col justify-between gap-3 py-3 transition first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:rounded-xl sm:px-2"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <DayIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {formatDay(day.date)}
                  </p>
                  <p className="text-muted-foreground text-xs">{day.condition}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Droplets className="text-secondary h-3.5 w-3.5" />
                  <span>{formatNumber(day.precipitation)} mm</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <span className="text-muted-foreground inline-flex items-center gap-0.5">
                    <ArrowDown className="text-primary h-3.5 w-3.5" />
                    {formatNumber(day.temp_min)}°
                  </span>
                  <span className="text-foreground inline-flex items-center gap-0.5 font-semibold">
                    <ArrowUp className="text-accent h-3.5 w-3.5" />
                    {formatNumber(day.temp_max)}°C
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}