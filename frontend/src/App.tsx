function App() {
  return (
    <main className="gap-lg px-md py-3xl mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="gap-xs flex flex-col">
        <h1 className="text-primary text-3xl font-semibold tracking-tight">
          Weather Search
        </h1>
        <p className="text-muted-foreground text-sm">
          Cuaca saat ini dan riwayat tujuh hari terakhir.
        </p>
      </header>

      <section className="border-border bg-card p-lg text-card-foreground rounded-lg border shadow-md">
        <h2 className="font-semibold">Scaffold siap</h2>
        <p className="mt-sm text-muted-foreground text-sm">
          Komponen <code>WeatherApp</code>, <code>WeatherSearchForm</code>,{' '}
          <code>CurrentWeatherCard</code>, dan <code>DailyWeatherList</code>{' '}
          belum dibuat. Mulai dari <code>src/components/</code>.
        </p>
      </section>
    </main>
  )
}

export default App
