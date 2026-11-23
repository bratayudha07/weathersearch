import type { WeatherReport } from '../types/weather';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchWeather(city: string): Promise<WeatherReport> {
  const query = encodeURIComponent(city.trim());
  const response = await fetch(`/api/weather?city=${query}`);

  if (!response.ok) {
    let errorMessage = 'Gagal mengambil data cuaca dari server.';
    try {
      const errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (typeof errorData?.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch {
      // Gunakan pesan default jika respons bukan JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  return (await response.json()) as WeatherReport;
}