import { CloudSun } from 'lucide-react';
import { WeatherApp } from './components/WeatherApp';

function App() {
  return (
    <main className="gap-lg px-md py-2xl mx-auto flex min-h-screen w-full max-w-[768px] flex-col">
      <header className="gap-xs flex flex-col">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
            <CloudSun className="h-5 w-5" />
          </div>
          <h1 className="text-primary text-3xl font-semibold tracking-tight">
            Weather Search
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Cuaca saat ini dan riwayat tujuh hari terakhir.
        </p>
      </header>

      <WeatherApp />
    </main>
  );
}

export default App;