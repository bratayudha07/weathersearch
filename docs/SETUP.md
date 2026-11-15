# SETUP — kenapa scaffold ini begini

Dokumen ini menjelaskan **alasan** di balik setiap keputusan di `backend/` dan
`frontend/`, bukan sekadar daftar perintah. Setiap klaim merujuk ke dokumentasi resmi
(daftar tautan di bagian akhir).

---

## 1. Dua toolchain, dua file kunci

| Peran | Backend | Frontend |
| --- | --- | --- |
| Daftar dependency | `pyproject.toml` | `package.json` |
| Versi terkunci | `uv.lock` | `package-lock.json` |
| Tempat paket terpasang | `.venv/` | `node_modules/` |
| Menjalankan sesuatu | `uv run …` | `npm run …` |

Keduanya **di-commit** kecuali folder paketnya. `uv.lock` bukan "file sementara":
dokumentasi uv menyebutnya *"should be checked into version control, allowing for
consistent and reproducible installations across machines"*.

---

## 2. Backend

### 2.1 Kenapa uv, bukan `venv` + `pip`

`uv` menggabungkan empat pekerjaan yang dulu terpisah: membuat virtualenv, memasang
paket, mengunci versi, dan menjalankan perintah di dalam environment. `uv add httpx`
melakukan sekaligus: menulis ke `pyproject.toml`, menyelesaikan versi, memperbarui
`uv.lock`, dan memasang ke `.venv/`. Karena itu dokumentasi uv menyarankan **jangan**
memakai `uv pip install` di dalam project — itu melewati mekanisme kunci.

`uv run <perintah>` otomatis membuat/menyegarkan `.venv` bila perlu, jadi tidak ada
langkah "activate environment" yang bisa terlupa.

### 2.2 Kenapa packaged + `src/weather_search/`

Sejak **uv 0.12**, `uv init` untuk aplikasi tidak lagi menghasilkan `main.py` di root.
Defaultnya: project *packaged* dengan layout `src/<nama_modul>/` dan build backend
`uv_build`. Alasan resminya: *"Defining a build system allows use of various Python
packaging features … and avoids common points of confusion with the Python import
system."*

Konkretnya untuk kita:

| Tanpa package (flat) | Dengan package (dipilih) |
| --- | --- |
| Impor `from models import WeatherReport` | Impor `from weather_search.models import WeatherReport` |
| Hanya jalan kalau cwd = `backend/` | Jalan dari folder mana pun |
| `pytest` butuh tambalan `pythonpath = ["."]` | Package sudah ter-install *editable*, tidak perlu tambalan |
| Nama folder bisa bentrok dengan paket lain | Semua nama di bawah satu namespace |

Konsekuensi yang perlu kamu ingat: modul tidak lagi "terlihat" di root repo. Entrypoint
kamu adalah `weather_search.main:app`, bukan `main:app`.

### 2.3 Kenapa nama `weather-search` dan `weather_search`

- `weather-search` (dengan tanda hubung) = **nama distribusi**, dipakai di
  `pyproject.toml`. Folder proyeknya `backend/` — kalau tidak diberi `--name`, nama
  distribusinya akan jadi `backend`, yang tidak informatif.
- `weather_search` (dengan garis bawah) = **nama modul/package**. PEP 8: nama modul
  huruf kecil, `snake_case`. uv mengonversi otomatis tanda hubung → garis bawah, sama
  seperti contoh dokumentasinya (`example-app` → `example_app`).

### 2.4 Kenapa `controllers/`, bukan `routers/`

Dokumentasi FastAPI memakai `routers/` sebagai contoh, tapi secara eksplisit menyatakan
penamaan itu bebas: *"the variable is called `router`, but you can name it however you
want"*. Kita pakai `controllers/` supaya sejajar dengan `docs/REQUIREMENTS-1.md` dan
`docs/weather-search-oop-dan-teknologi.md` yang menyebut `WeatherController`.

Yang **wajib** ditiru dari dokumentasi FastAPI adalah bentuknya: satu package induk,
`__init__.py` di **setiap** level, satu modul per kelompok endpoint, lalu
`app.include_router(...)` di `main.py`. Dokumentasi memberi alasan eksplisit: file
`__init__.py` itulah yang membuat sebuah folder bisa diimpor sebagai package.

### 2.5 Kenapa Python 3.12

Mesin ini punya 3.15.2 (system), 3.14.8 (system), dan 3.12.16 (dikelola uv).
`.python-version` = `3.12` dipilih karena ekosistem FastAPI/Pydantic paling matang di
sana dan versi ini sudah tersedia lokal (tanpa download). Kalau nanti butuh 3.13/3.14,
cukup ubah `.python-version` + `requires-python`, lalu `uv sync`.

### 2.6 Isi `main.py` hanya tiga baris — apa yang belum ada

```python
from fastapi import FastAPI

app = FastAPI()
```

Itu sudah cukup agar `uvicorn` hidup, `/docs` terbuka, dan proxy frontend punya tujuan.
Yang **sengaja belum ada** (kamu yang menulis):

| Bagian | Tempat | Catatan |
| --- | --- | --- |
| `APIRouter` + endpoint | `controllers/weather_controller.py` | `router = APIRouter(prefix="/api")`, endpoint `GET /weather` |
| Pendaftaran router | `main.py` | `app.include_router(weather_controller.router)` |
| Dependency injection | `controllers/` | `Depends(get_weather_service)` + `@lru_cache` sesuai dokumen |
| Aturan bisnis | `services/weather_service.py` | jendela 7 hari, zona waktu lokasi |
| HTTP ke Open-Meteo | `clients/weather_api_client.py` | satu-satunya tempat `httpx` boleh muncul |
| Model Pydantic | `models/` | termasuk `daily_history` tepat 7 item |
| Error kustom | belum dibuat | `LocationNotFoundError`, `WeatherAPIError` → 404/502 |

### 2.7 CORS: kenapa belum perlu

Saat dev, browser hanya bicara ke `localhost:5173`. Vite yang meneruskan `/api/**` ke
`127.0.0.1:8000` (lihat `server.proxy` di `vite.config.ts`). Hasilnya, dari sudut
pandang browser semuanya satu origin → tidak ada preflight, tidak ada CORS.

Kalau nanti frontend di-build dan dilayani dari domain/port lain tanpa proxy,
`CORSMiddleware` baru dibutuhkan di `main.py`.

### 2.8 Config yang dipilih, dan alasannya

| Konfigurasi | Nilai | Alasan |
| --- | --- | --- |
| `[tool.ruff]` line-length | 100 | Cukup lega untuk signature panjang seperti `get_historical_weather(...)` tanpa memaksa pecah baris |
| `[tool.ruff]` target-version | `py312` | Sesuai pin Python |
| `[tool.ruff.lint]` select | `E,F,I,UP,B` | Error pycodestyle, pyflakes, urutan impor, modernisasi sintaks, bugbear |
| `[tool.pytest.ini_options]` testpaths | `tests` | Supaya `uv run pytest` dari mana pun hanya memindai `tests/` |
| Tanpa `pythonpath` | — | Tidak perlu lagi karena package ter-install editable |

`uv run pytest` saat `tests/` masih kosong akan **exit code 5** ("no tests ran"). Itu
perilaku normal pytest, bukan kerusakan.

---

## 3. Frontend

### 3.1 Apa yang dihasilkan `create-vite` (v9.3.4)

```bash
npm create vite@latest frontend -- --template react-ts
```

`--` ganda diperlukan npm 7+ agar `--template` diteruskan ke create-vite, bukan dimakan
npm. Template `react-ts` saat ini berisi React 19.3, TypeScript 7.0, dan **oxlint**
(bukan ESLint — template Vite terbaru memakai oxlint, konfigurasinya `.oxlintrc.json`).

`index.html` ada di root dan menjadi entry point, bukan di dalam `public/` — itu memang
desain Vite: *"during development Vite is a server, and `index.html` is the entry point
to your application"*.

### 3.2 Tailwind v4: token di CSS, bukan di `tailwind.config.js`

Instalasi resmi untuk Vite:

```bash
npm install tailwindcss @tailwindcss/vite
```

lalu plugin di `vite.config.ts` dan `@import "tailwindcss";` di CSS. **Tidak ada**
`tailwind.config.js`, tidak ada `postcss.config.js`, tidak ada array `content`. Kalau
kamu mengikuti tutorial lama yang membuat file-file itu, hasilnya konfigurasi mati.

### 3.3 Kenapa `--spacing-*`, bukan `--space-*`

Ini kesalahan yang paling mudah menjebak. Di Tailwind v4, sebuah variabel di dalam
`@theme` hanya menghasilkan utility kalau namanya masuk **namespace** yang dikenal:

| Namespace | Utility yang lahir |
| --- | --- |
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*` |
| `--font-*` | `font-*` |
| `--spacing-*` | `p-*`, `m-*`, `gap-*`, `w-*` |
| `--shadow-*` | `shadow-*` |
| `--radius-*` | `rounded-*` |
| `--text-*` | `text-*` (ukuran huruf) |
| `--breakpoint-*` | `sm:*`, `md:*` |

`design-system/weather-search/MASTER.md` menulis `--space-xs`, `--space-sm`, dst.
`space` **bukan** namespace Tailwind, jadi `--space-md` hanya jadi CSS variable biasa
dan `p-md` tidak akan pernah ada. Karena itu di `src/index.css` semuanya diganti menjadi
`--spacing-xs … --spacing-3xl`, yang otomatis menghasilkan `gap-lg`, `p-md`, `mt-sm`,
dan seterusnya. Nilainya tetap sama dengan MASTER.md.

Catatan kedua: `--shadow-sm/md/lg/xl` di MASTER.md **menimpa** nilai default Tailwind.
Sah dan memang diinginkan untuk satu proyek, tapi artinya `shadow-md` di sini bukan
`shadow-md` standar dokumentasi Tailwind.

### 3.4 Cara pakai token

```tsx
<div className="bg-card text-card-foreground border-border rounded-lg p-lg shadow-md">
  <h1 className="text-primary">Bandung</h1>
  <p className="text-muted-foreground mt-sm">Mendung · 27.4 °C</p>
</div>
```

Warna teks di atas sudah memenuhi kontras minimum yang diminta MASTER.md
(`#0F172A` di atas `#FFFFFF`/`#F0F9FF`). Font Inter dimuat lewat `@import` Google Fonts
di `src/index.css`; `--font-sans` di `@theme` membuatnya otomatis dipakai preflight.

### 3.5 Alur satu permintaan saat dev

```text
Browser (localhost:5173)
  └─ GET /api/weather?city=Bandung
       └─ Vite dev server melihat prefix /api
            └─ proxy → http://127.0.0.1:8000/api/weather?city=Bandung
                 └─ FastAPI (uvicorn)
```

Bukti proxy bekerja: `curl "http://localhost:5173/api/weather?city=Bandung"` menjawab
`{"detail":"Not Found"}` dengan status 404 — itu balasan **FastAPI**, bukan halaman
HTML Vite. Setelah `weather_controller.py` kamu daftarkan, jalur yang sama akan
mengembalikan laporan cuaca.

---

## 4. Verifikasi yang sudah dilakukan

| Cek | Hasil |
| --- | --- |
| `uv sync` | sukses, `weather-search` ter-install editable |
| `uv run python -c "from weather_search.main import app"` | OK |
| `uv run uvicorn weather_search.main:app` | `/openapi.json` 200, `/docs` 200 |
| `uv run ruff check .` | All checks passed |
| `uv run ruff format --check .` | 6 files already formatted |
| `npm run build` | sukses (tsc + vite build) |
| Utility token di hasil build | `.gap-lg{gap:var(--spacing-lg)}`, `.mt-sm{...}`, `.text-muted-foreground{...}` terbentuk |
| `curl localhost:5173/api/weather?city=Bandung` | 404 JSON dari FastAPI → proxy jalan |
| `uv run pytest` | exit 5 (belum ada tes) — normal |

---

## 5. Jebakan yang sering kena

1. **Menjalankan `uvicorn main:app`.** Entrypoint sekarang `weather_search.main:app`.
2. **`ModuleNotFoundError: weather_search`.** Terjadi kalau `.venv` belum disinkronkan
   (`uv sync`) atau kamu menjalankan `python` system, bukan `uv run`.
3. **Membuat `tailwind.config.js`.** Tailwind v4 mengabaikannya; token ada di `@theme`.
4. **Menamai token `--space-*`.** Tidak menghasilkan utility (lihat 3.3).
5. **Export nama di `services/__init__.py` lalu impor dari situ.** Lebih jelas impor
   langsung dari modulnya: `from weather_search.services.weather_service import
   WeatherService`. Hindari re-export yang menyembunyikan asal simbol.
6. **Menganggap `tests/` kosong = rusak.** pytest exit 5 hanya berarti belum ada tes.
7. **Commit `.venv/`, `node_modules/`, `dist/`.** Sudah dicegat `.gitignore`.

---

## 6. Rujukan

- uv — struktur & file: <https://docs.astral.sh/uv/concepts/projects/layout/>
- uv — `uv init`, app/lib/`--no-package`/`--bare`: <https://docs.astral.sh/uv/concepts/projects/init/>
- FastAPI — Bigger Applications (struktur package + `APIRouter`): <https://fastapi.tiangolo.com/tutorial/bigger-applications/>
- Vite — Getting Started (Node version, scaffold, `index.html`): <https://vite.dev/guide/>
- Tailwind CSS — install via Vite: <https://tailwindcss.com/docs/installation/using-vite>
- Tailwind CSS — theme variables & namespace: <https://tailwindcss.com/docs/theme>
- PEP 8 — nama package/modul: <https://peps.python.org/pep-0008/#package-and-module-names>
