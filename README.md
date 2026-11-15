# Weather Search

Aplikasi web untuk mencari kondisi cuaca sebuah kota: cuaca saat ini plus ringkasan
harian tujuh hari terakhir. Data dari [Open-Meteo](https://open-meteo.com/), tanpa
database.

- **Backend** — Python + FastAPI, dikelola dengan [uv](https://docs.astral.sh/uv/)
- **Frontend** — React + TypeScript + Vite + Tailwind CSS, dikelola dengan npm

> **Status:** scaffold. Struktur, dependency, dan tooling sudah siap; endpoint dan
> komponen masih kosong dan sengaja tidak dibuat.

## Prasyarat

| Tool | Versi di mesin ini | Minimum |
| --- | --- | --- |
| uv | 0.13.8 | 0.12 (butuh build system `uv_build`) |
| Node.js | 26.13.1 | 20.19 atau 22.12 (syarat Vite) |
| npm | 11.20.0 | 10 |
| Python | 3.12.16 (dikelola uv) | 3.12 |

## Menjalankan

Dua terminal, dua proses.

**Terminal 1 — backend**

```bash
cd backend
uv sync                                  # sekali saja / setelah dependency berubah
uv run uvicorn weather_search.main:app --reload
```

- API: <http://127.0.0.1:8000>
- Dokumentasi interaktif: <http://127.0.0.1:8000/docs> (masih kosong, belum ada route)

**Terminal 2 — frontend**

```bash
cd frontend
npm install                              # sekali saja
npm run dev
```

- Aplikasi: <http://localhost:5173>
- Permintaan ke `/api/...` diteruskan Vite ke `http://127.0.0.1:8000` (lihat proxy di
  `frontend/vite.config.ts`), jadi **tidak perlu** konfigurasi CORS saat dev.

## Struktur

```text
weathertrack/
├── backend/                     distribusi: weather-search
│   ├── pyproject.toml           dependency + config ruff/pytest
│   ├── uv.lock                  versi terkunci, di-commit
│   ├── .python-version          pin 3.12
│   ├── src/weather_search/      package induk (isi di sini)
│   │   ├── main.py              ← stub: app = FastAPI()
│   │   ├── controllers/         ← lapisan Controller (APIRouter)
│   │   ├── services/            ← lapisan Service (aturan bisnis)
│   │   ├── clients/             ← lapisan API Client (httpx → Open-Meteo)
│   │   └── models/              ← lapisan Models (Pydantic)
│   └── tests/
├── frontend/
│   ├── src/App.tsx              ← shell minimal, isi sendiri
│   ├── src/index.css            ← @theme: design token dari MASTER.md
│   ├── src/components/          ← WeatherApp, WeatherSearchForm, dll.
│   └── vite.config.ts           ← plugin Tailwind + proxy /api
├── design-system/weather-search/MASTER.md
├── docs/
│   ├── REQUIREMENTS-1.md
│   ├── weather-search-oop-dan-teknologi.md
│   └── SETUP.md                 ← kenapa scaffold ini begini
└── AGENTS.md                    ← aturan kerja untuk agent/kolaborator
```

## Perintah harian

```bash
# backend — selalu dari folder backend/
uv add <paket>              # tambah dependency produksi
uv add --dev <paket>        # tambah dependency dev
uv run pytest               # jalankan tes
uv run ruff check .         # lint
uv run ruff format .        # format
uv lock --upgrade-package <paket>

# frontend — selalu dari folder frontend/
npm run dev                 # dev server :5173
npm run build               # type-check + build produksi ke dist/
npm run preview             # cek hasil build
npm run lint                # oxlint
npx prettier --write .      # format
```

## Design token

Warna, spacing, dan shadow diambil dari `design-system/weather-search/MASTER.md` dan
didefinisikan di `frontend/src/index.css` lewat `@theme` (Tailwind v4). Pakai sebagai
utility biasa:

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-lg shadow-md">
  <h1 className="text-primary text-3xl font-semibold">Bandung</h1>
  <p className="text-muted-foreground mt-sm text-sm">Mendung · 27.4 °C</p>
</div>
```

## Dokumen

| Dokumen | Isi |
| --- | --- |
| [`docs/PANDUAN-BACKEND.md`](docs/PANDUAN-BACKEND.md) | **Mulai di sini.** Panduan bertahap membangun backend untuk pemula |
| [`docs/REQUIREMENTS-1.md`](docs/REQUIREMENTS-1.md) | Persyaratan fungsional/nonfungsional, rancangan sistem |
| [`docs/weather-search-oop-dan-teknologi.md`](docs/weather-search-oop-dan-teknologi.md) | Class diagram, alur runtime, penjelasan OOP |
| [`docs/SETUP.md`](docs/SETUP.md) | Alasan di balik struktur, penamaan, dan tooling |
| [`design-system/weather-search/MASTER.md`](design-system/weather-search/MASTER.md) | Palet warna, tipografi, spesifikasi komponen |
