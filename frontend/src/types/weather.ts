export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  precipitation: number;
  weather_code: number;
  condition: string;
}

export interface DailyWeather {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  weather_code: number;
  condition: string;
}

export interface WeatherReport {
  location: Location;
  current_weather: CurrentWeather;
  daily_history: DailyWeather[];
}