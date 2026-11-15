# AGENTS.md — aturan proyek Weather Search

Berlaku untuk siapa pun (manusia atau agent AI) yang mengubah repo ini.

## Pembagian kepemilikan

- **Logika backend ditulis oleh pemilik proyek.** Jangan membuat endpoint, service,
  client, atau model baru kecuali diminta secara eksplisit. Stub `main.py` sengaja
  kosong.
- Boleh tanpa diminta: memperbaiki typo, merapikan config, memperbarui dokumentasi,
  menambah tes untuk kode yang **sudah ada**.
- Jangan pernah meng-commit otomatis. Jangan menyentuh `.venv/`, `node_modules/`,
  `dist/`, atau file lock secara manual (`uv.lock`, `package-lock.json` hanya berubah
  lewat `uv add` / `npm install`).

## Perintah

```bash
# backend (dari backend/)
uv sync
uv run uvicorn weather_search.main:app --reload
uv run pytest
uv run ruff check . && uv run ruff format .

# frontend (dari frontend/)
npm run dev
npm run build      # tsc -b && vite build — wajib lulus sebelum dianggap selesai
npm run lint
npx prettier --write .
```

## Batas arsitektur (dari `docs/REQUIREMENTS-1.md`)

Arah dependensi hanya ke bawah: `controllers → services → clients`. `models` dipakai
bersama.

| Lapisan | Boleh tahu | Tidak boleh tahu |
| --- | --- | --- |
| `controllers/` | FastAPI, `Depends`, status HTTP | `httpx`, URL Open-Meteo, bentuk JSON mentah |
| `services/` | aturan bisnis, model, memanggil client | FastAPI, `HTTPException`, `httpx` |
| `clients/` | `httpx`, URL, timeout | Pydantic model, aturan 7 hari |
| `models/` | Pydantic, validasi | jaringan, HTTP |

Aturan lain yang wajib dipatuhi:

1. `httpx` **hanya** boleh diimpor di `clients/`. Kalau muncul di `controllers/` atau
   `services/`, itu bug.
2. URL eksternal dikumpulkan di satu tempat (NFR-07), tidak disebar.
3. Pemetaan `weather_code → condition` hanya boleh ada di satu modul dan dipakai semua
   lapisan. Jangan menduplikasi tabel kode WMO.
4. Rantai error: client melempar `WeatherAPIError`, service melempar
   `LocationNotFoundError`, controller menerjemahkan ke 502 dan 404. Jangan menelan
   exception diam-diam dan **jangan pernah** mengembalikan data contoh seolah-olah data
   nyata ketika API gagal.
5. `WeatherReport.daily_history` harus tepat 7 item — ditegakkan oleh Pydantic, bukan
   sekadar komentar.

## Penamaan

| Hal | Aturan |
| --- | --- |
| Distribusi Python | `weather-search` (tanda hubung) |
| Package Python | `weather_search` (garis bawah, PEP 8) |
| Modul | `snake_case`, contoh `weather_controller.py` |
| Class | `PascalCase` |
| Entrypoint | `weather_search.main:app` |
| Lapisan | `controllers/`, `services/`, `clients/`, `models/` — pertahankan nama ini |
| Komponen React | file `PascalCase.tsx`, nama sama dengan komponennya |
| Hook/util React | `camelCase`, file `useXxx.ts` |

Impor selalu dari modul asalnya, bukan lewat re-export `__init__.py`:
`from weather_search.models.location import Location`.

## Frontend

- Tailwind **v4**, token lewat `@theme` di `src/index.css`. **Jangan** membuat
  `tailwind.config.js`, `postcss.config.js`, atau array `content`.
- Nama token mengikuti namespace Tailwind: `--color-*`, `--spacing-*`, `--font-*`,
  `--shadow-*`. `--space-*` tidak menghasilkan utility apa pun.
- Sumber kebenaran visual: `design-system/weather-search/MASTER.md`. Kalau ada
  `design-system/weather-search/pages/<page>.md`, file itu menang.
- Larangan dari MASTER.md: emoji sebagai ikon (pakai SVG/Lucide/Heroicons), elemen
  klik tanpa `cursor-pointer`, hover tanpa transisi, teks kontras < 4.5:1, state fokus
  tak terlihat, `prefers-reduced-motion` diabaikan.
- HTTP hanya lewat `fetch('/api/...')`. Jangan menulis URL absolut `localhost:8000` di
  kode — proxy Vite yang mengurus tujuan.
- Tipe kontrak `WeatherReport` ditulis manual sekali di `src/`, jangan menyebar bentuk
  objek ad-hoc di banyak komponen.

## Gaya

- Komentar dan dokumentasi berbahasa Indonesia, mengikuti gaya
  `docs/weather-search-oop-dan-teknologi.md` (kalimat utuh, bukan singkatan misterius).
- Komentar menjelaskan **alasan**, bukan mengulang kode.
- Frontend: tanpa titik koma, kutip tunggal (lihat `.prettierrc`), format dengan
  Prettier + plugin Tailwind.
- Backend: `ruff` wajib bersih, line-length 100.

## Sebelum menyatakan selesai

1. `uv run ruff check .` bersih dan `uv run pytest` lulus untuk tes yang ada.
2. `npm run build` sukses (type-check ikut jalan di dalamnya).
3. Kalau menyentuh `vite.config.ts` atau `src/index.css`, cek cepat dengan
   `curl "http://localhost:5173/api/weather?city=Bandung"` — balasan JSON dari FastAPI
   membuktikan proxy masih hidup.
4. Kalau mengubah dependency, sebutkan perintah `uv add`/`npm install` yang dijalankan
   agar lockfile ikut ter-commit.
