# Panduan Membangun Backend Weather Search

Panduan ini untuk **kamu yang baru mulai**. Tujuannya bukan menyerahkan kode jadi,
tapi menuntun kamu menulisnya sendiri, satu langkah kecil setiap kali, dengan cara
memastikan setiap langkah benar sebelum lanjut.

Kalau di tengah jalan bingung, jangan improvisasi — lompat ke
[Lampiran C](#lampiran-c-kalau-mentok), lalu kembali lagi.

---

## 0. Cara pakai panduan ini

1. **Kerjakan berurutan.** Urutannya disusun dari lapisan paling dalam ke luar. Alasannya
   ada di [bagian 2](#2-peta-pekerjaan).
2. **Satu langkah = satu perintah verifikasi.** Setiap langkah punya blok `✅ Cek`.
   Kalau gagal, jangan lanjut — perbaiki dulu. Ini kebiasaan yang membedakan orang yang
   cepat selesai dan yang berjam-jam tersesat.
3. **Ketik ulang, jangan copy-paste buta.** Otot jari dan pesan error adalah guru terbaik.
4. Semua perintah dijalankan dari folder `backend/`, kecuali disebut lain.

---

## 1. Bekal konsep (10 menit, jangan dilewati)

### 1.1 Dua program yang saling bicara

Aplikasimu terdiri dari dua program yang berjalan bersamaan:

| Program | Alamat | Tugas |
| --- | --- | --- |
| Frontend (Vite + React) | `localhost:5173` | Menampilkan layar, menerima ketikan pengguna |
| Backend (FastAPI + Uvicorn) | `127.0.0.1:8000` | Mengambil data cuaca, menghitung, membalas JSON |

Keduanya tidak saling memanggil fungsi. Mereka **bertukar teks** lewat jaringan, mengikuti
aturan bernama HTTP.

### 1.2 HTTP: empat hal yang perlu kamu hafal

```
GET /api/weather?city=Bandung
```

| Bagian | Contoh | Arti |
| --- | --- | --- |
| **Method** | `GET` | "Tolong ambilkan" (bukan mengubah apa pun) |
| **Path** | `/api/weather` | Alamat tujuan di server |
| **Query** | `?city=Bandung` | Keterangan tambahan, pasangan nama=nilai |
| **Status** | `200`, `404`, `502` | Ringkasan hasil, dibaca lebih dulu sebelum isinya |

Status yang akan kamu pakai:

| Status | Kapan | Contoh kasus |
| --- | --- | --- |
| `200` | Sukses | Laporan cuaca terbentuk |
| `404` | Yang dicari tidak ada | Kota "zzzzz" tidak dikenal |
| `422` | Permintaan tidak valid | `city` kosong / satu huruf |
| `502` | Layanan hulu bermasalah | Open-Meteo timeout |

### 1.3 JSON

JSON adalah cara menulis data sebagai teks, supaya bahasa pemrograman apa pun bisa
membacanya. Python mengirim objek → FastAPI mengubahnya jadi teks JSON → React membacanya
sebagai objek JavaScript.

```json
{ "location": { "name": "Bandung", "country": "Indonesia", "latitude": -6.92, "longitude": 107.61 } }
```

### 1.4 Perjalanan satu pencarian

```text
Pengguna ketik "Bandung"
   └─ React fetch GET /api/weather?city=Bandung
        └─ Vite (proxy) meneruskan ke backend :8000
             └─ weather_controller.search_weather()      ← lapisan Controller
                  └─ weather_service.get_weather_report() ← lapisan Service
                       ├─ client.search_location()        ← lapisan Client
                       │    └─ HTTP ke geocoding-api.open-meteo.com
                       ├─ client.get_current_weather()    ← lapisan Client
                       │    └─ HTTP ke api.open-meteo.com
                       └─ client.get_historical_weather() ← lapisan Client
                            └─ HTTP ke archive-api.open-meteo.com
                  ← objek WeatherReport (bukan dict mentah)
        ← JSON + status 200
   ← kartu cuaca tampil
```

Perhatikan: **dict mentah berhenti di Service**, dan **objek model tidak pernah turun ke
Client**. Service adalah penerjemah di tengah.

### 1.5 Tiga kata yang sering tertukar

| Istilah | Arti singkat |
| --- | --- |
| **API** | Pintu yang disediakan suatu layanan agar program lain bisa meminta data |
| **Endpoint** | Satu pintu spesifik, misalnya `GET /api/weather` milikmu |
| **Client** | Program yang **meminta**. Backend-mu client bagi Open-Meteo, dan server bagi React |

---

## 2. Peta pekerjaan

Enam file, satu urutan. Bangun dari bawah ke atas dengan alasan sederhana: **lapisan atas
butuh lapisan di bawahnya**. Menulis Service sebelum ada model itu seperti memasak sebelum
belanja.

| # | File | Tanggung jawab | Cara memastikan benar |
| --- | --- | --- | --- |
| 1 | `models/*.py` | Bentuk data + aturan validasi | Buat objek dengan data salah → harus error |
| 2 | `clients/weather_api_client.py` | Satu-satunya yang bicara HTTP | Panggil method-nya → keluar `dict` |
| 3 | `exceptions.py` | Bahasa error milik aplikasi | Tidak bisa dicek langsung; dipakai di 4 & 5 |
| 4 | `services/weather_service.py` | Aturan bisnis (7 hari, zona waktu) | Panggil dengan kota asli → `WeatherReport` |
| 5 | `controllers/weather_controller.py` | Terjemah HTTP ↔ Python | `curl` → status yang tepat |
| 6 | `main.py` | Merakit semuanya | `/docs` menampilkan endpoint |

Semua file berada di `backend/src/weather_search/`. Nama impornya selalu diawali
`weather_search.`, misalnya:

```python
from weather_search.models.location import Location
```

---

## 3. Langkah 0 — pastikan panggung siap

```bash
cd backend
uv sync
uv run uvicorn weather_search.main:app --reload
```

Buka <http://127.0.0.1:8000/docs>. Kalau halaman Swagger terbuka tapi **tidak ada
endpoint**, itu benar: `main.py` masih tiga baris. Anggap ini ruangan kosong yang siap
diisi.

> `--reload` membuat server menyalakan ulang dirinya setiap kamu menyimpan file. Tanpa
> ini kamu harus Ctrl+C dan jalankan ulang terus-menerus.

✅ **Cek:** `/docs` terbuka tanpa error. Terminal menampilkan `Uvicorn running on ...`.

---

## 4. Langkah 1 — `models/`: mendefinisikan bentuk data

### Konsep

`BaseModel` dari Pydantic adalah **cetakan yang menolak data cacat**. Kalau kamu bilang
`temperature: float`, lalu ada yang mengirim `"hangat"`, objeknya **tidak akan pernah
terbentuk**. Ini jauh lebih baik daripada `dict` bebas yang baru meledak jauh di kemudian
hari ketika angkanya dipakai menghitung.

### Kerjakan

Buat empat file di `models/`:

| File | Class | Field |
| --- | --- | --- |
| `location.py` | `Location` | `name`, `country`, `latitude`, `longitude` |
| `current_weather.py` | `CurrentWeather` | `temperature`, `precipitation`, `weather_code`, `condition` |
| `daily_weather.py` | `DailyWeather` | `date`, `temp_max`, `temp_min`, `precipitation`, `weather_code`, `condition` |
| `weather_report.py` | `WeatherReport` | `location`, `current_weather`, `daily_history` |

Dua hal yang perlu perhatian khusus:

**a. `date` pakai tipe tanggal asli, bukan string.**

```python
import datetime as dt
# ...
    date: dt.date      # bukan: date: str
```

Alasannya: dengan `dt.date` kamu bisa menghitung selisih hari. Pydantic tetap
menuliskannya sebagai `"2026-11-05"` saat diubah ke JSON, jadi frontend tidak dirugikan.

**b. Aturan "tepat 7 hari" ditegakkan di sini, bukan di komentar.**

```python
from pydantic import Field
# ...
    daily_history: list[DailyWeather] = Field(min_length=7, max_length=7)
```

Dengan ini, laporan berisi 6 hari **gagal dibuat**. Itulah yang dimaksud dokumen
requirements: lebih baik error jelas daripada laporan yang kelihatan lengkap tapi bolong.

Terakhir, isi `models/__init__.py` agar impornya ringkas:

```python
from weather_search.models.current_weather import CurrentWeather
from weather_search.models.daily_weather import DailyWeather
from weather_search.models.location import Location
from weather_search.models.weather_report import WeatherReport

__all__ = ["CurrentWeather", "DailyWeather", "Location", "WeatherReport"]
```

### ✅ Cek

```bash
uv run python - <<'PY'
import datetime as dt
from weather_search.models import CurrentWeather, DailyWeather, WeatherReport, Location

loc = Location(name="Bandung", country="Indonesia", latitude=-6.92, longitude=107.61)
cur = CurrentWeather(temperature=27.4, precipitation=0.0, weather_code=3, condition="Mendung")
day = DailyWeather(date=dt.date(2026, 11, 5), temp_max=29.8, temp_min=21.3,
                   precipitation=12.4, weather_code=61, condition="Hujan ringan")

# satu hari saja: harus GAGAL
try:
    WeatherReport(location=loc, current_weather=cur, daily_history=[day])
    print("SALAH: seharusnya ditolak")
except Exception as e:
    print("benar, ditolak:", type(e).__name__)
PY
```

Kalau muncul `benar, ditolak: ValidationError`, model kamu sudah benar.

> **Jebakan:** nama field harus sama dengan yang nanti dipakai di JSON (`temp_max`, bukan
> `max_temp`). Kalau beda, frontend akan menampilkan `undefined`.

---

## 5. Langkah 2 — `clients/`: satu-satunya pintu ke internet

### Konsep

`httpx` adalah browser tanpa jendela. Ada tiga kebiasaan yang membedakan kode pemula dan
kode yang tidak menyiksa pengguna:

| Kebiasaan | Kenapa |
| --- | --- |
| Buat **satu** `httpx.Client()` di `__init__` | Koneksi dipakai ulang, tidak dibuka-tutup tiap request |
| Selalu pasang `timeout` | Tanpa timeout, server hulu yang macet membuat aplikasimu menggantung selamanya |
| Panggil `raise_for_status()` | Kalau tidak, respons error 500 dianggap "sukses" dan kamu bingung kenapa datanya kosong |

### Sebelum menulis kode: lihat datanya dulu

Tempel URL ini ke browser:

```
https://geocoding-api.open-meteo.com/v1/search?name=Bandung&count=1&language=id
```

Kamu akan melihat JSON mentah. Bentuk inilah yang nanti diterima `search_location()`.
Lakukan hal yang sama untuk forecast dan archive. **Melihat data sebelum menulis kode
menghemat setengah waktu debugging.**

### Kerjakan

Di `clients/weather_api_client.py`, buat class `WeatherAPIClient` dengan:

- `__init__`: tiga URL (forecast, geocoding, archive) + `self._http = httpx.Client(timeout=10.0)`
- satu helper private `_get(url, params) -> dict`
- tiga method publik: `search_location`, `get_current_weather`, `get_historical_weather`

Helper `_get` adalah inti kelas ini — semua penanganan error dikumpulkan di satu tempat:

```python
import httpx

from weather_search.exceptions import WeatherAPIError


    def _get(self, url: str, params: dict) -> dict:
        try:
            response = self._http.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise WeatherAPIError("Layanan cuaca tidak dapat dihubungi.") from exc
```

Perhatikan `from exc`: itu menyimpan error asli sebagai "penyebab", sehingga saat
debugging kamu tetap bisa melihat apakah masalahnya timeout, DNS, atau 500.

Parameter yang dikirim tiap method (ambil dari dokumen requirements):

| Method | Parameter |
| --- | --- |
| `search_location(city)` | `name`, `count=1`, `language="id"` |
| `get_current_weather(lat, lon)` | `latitude`, `longitude`, `current="temperature_2m,precipitation,weather_code"`, `timezone="auto"` |
| `get_historical_weather(lat, lon, start, end)` | `latitude`, `longitude`, `start_date`, `end_date`, `daily="temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"`, `timezone="auto"` |

### ✅ Cek

```bash
uv run python - <<'PY'
from weather_search.clients.weather_api_client import WeatherAPIClient

c = WeatherAPIClient()
data = c.search_location("Bandung")
print(data["results"][0]["name"], data["results"][0]["country"])
PY
```

Harus keluar `Bandung Indonesia`. Kalau `KeyError`, artinya bentuk JSON-nya beda dari
dugaanmu — buka lagi URL di browser dan bandingkan.

> **Jebakan:** `except Exception` akan menelan bug logikamu sendiri (misalnya salah nama
> variabel) dan melaporkannya sebagai "layanan bermasalah". Tangkap yang spesifik:
> `httpx.HTTPError`.

---

## 6. Langkah 3 — `exceptions.py`: kosakata error aplikasi

Tanpa ini, `services` harus menebak-nebak apakah kegagalan berarti "kota tidak ada" atau
"internet mati" — dua hal yang butuh respons HTTP berbeda (404 vs 502).

```python
class LocationNotFoundError(Exception):
    """Kota yang dicari tidak ada di hasil geocoding."""


class WeatherAPIError(Exception):
    """Open-Meteo tidak dapat dihubungi atau membalas dengan error."""
```

Tidak ada yang bisa dicek sekarang. Ini baru "dipakai" di langkah berikutnya.

---

## 7. Langkah 4 — `services/`: tempat aturan bisnis tinggal

### Konsep: dependency injection, tanpa istilah rumit

`WeatherService` **tidak membuat** client sendiri. Client diberikan dari luar:

```python
class WeatherService:
    def __init__(self, api_client) -> None:
        self._api_client = api_client
```

Kenapa repot-repot? Karena saat tes, kamu bisa memberi **client palsu** yang menjawab tanpa
internet. Satu baris ini yang membuat bagian 11 (tes) mungkin dilakukan.

### Enam tahap `get_weather_report(city)`

| Tahap | Yang dilakukan | Yang bisa salah |
| --- | --- | --- |
| 1 | `search_location(city)` | hasil kosong → `LocationNotFoundError` |
| 2 | Bentuk `Location` dari hasil pertama | nama field beda |
| 3 | `get_current_weather(lat, lon)` → `CurrentWeather` | field hilang |
| 4 | Hitung jendela tanggal | salah zona waktu |
| 5 | `get_historical_weather(...)` → 7 `DailyWeather` | jumlah hari bukan 7 |
| 6 | Susun `WeatherReport` | Pydantic menolak |

### Tiga bagian yang paling sering salah

**a. Jendela tanggal harus ikut zona waktu lokasi.**

```python
import datetime as dt
from zoneinfo import ZoneInfo

# ...
        timezone = raw_now["timezone"]          # mis. "Asia/Jakarta", dari timezone=auto
        today = dt.datetime.now(ZoneInfo(timezone)).date()
        start = (today - dt.timedelta(days=7)).isoformat()
        end = (today - dt.timedelta(days=1)).isoformat()
```

Kenapa bukan `dt.date.today()`? Karena itu tanggal **server**, bukan tanggal di kota yang
dicari. Untuk kota yang sudah melewati tengah malam, jendela tujuh harinya akan bergeser
satu hari. Ini bug yang tidak kelihatan sampai ada yang membandingkan dengan situs cuaca
lain.

Perhatikan juga bentuk jendelanya: `start = hari ini − 7`, `end = hari ini − 1`. **Hari ini
tidak ikut** dihitung sebagai riwayat.

**b. `zip()` mengubah "daftar-daftar paralel" menjadi "satu objek per hari".**

Archive API tidak mengirim 7 objek. Ia mengirim 5 daftar yang posisinya bersesuaian:

```python
d = raw_hist["daily"]
history = [
    DailyWeather(date=day, temp_max=tmax, temp_min=tmin,
                 precipitation=rain, weather_code=code,
                 condition=weather_code_to_text(code))
    for day, tmax, tmin, rain, code in zip(
        d["time"], d["temperature_2m_max"], d["temperature_2m_min"],
        d["precipitation_sum"], d["weather_code"],
    )
]
```

Elemen ke-*i* di setiap daftar milik hari yang sama. `zip` mengambil kolom, bukan baris.

**c. Bungkus kegagalan bentuk data, jangan biarkan jadi error 500.**

Kalau Open-Meteo mengirim 6 hari, Pydantic melempar `ValidationError`. Di controller itu
belum ditangani, sehingga pengguna melihat 500 yang tidak informatif. Tangkap di Service
lalu ubah:

```python
from pydantic import ValidationError

        try:
            return WeatherReport(...)
        except (ValidationError, KeyError) as exc:
            raise WeatherAPIError("Data cuaca dari penyedia tidak lengkap.") from exc
```

### ✅ Cek

```bash
uv run python - <<'PY'
from weather_search.clients.weather_api_client import WeatherAPIClient
from weather_search.services.weather_service import WeatherService

report = WeatherService(WeatherAPIClient()).get_weather_report("Bandung")
print(report.location.name, "|", report.current_weather.temperature, "C |", len(report.daily_history), "hari")
PY
```

Harus keluar nama kota, suhu, dan **7**. Ini butuh internet.

> **Jebakan:** kalau jumlah hari bukan 7 dan kamu menambal dengan `min_length=0`, kamu
> sedang menyembunyikan bug. Perbaiki penyebabnya (cek jendela tanggal), bukan aturannya.

---

## 8. Langkah 5 — `controllers/`: menerjemahkan Python ke HTTP

### Konsep

Controller adalah **pelayan restoran**. Ia menerima pesanan, meneruskannya ke dapur, lalu
mengantar hasilnya. Ia tidak memasak.

Tiga alat FastAPI yang dipakai:

| Alat | Fungsi |
| --- | --- |
| `APIRouter(prefix="/api")` | Mengelompokkan endpoint, supaya `main.py` cukup satu baris `include_router` |
| `Query(..., min_length=2)` | Validasi input; gagal → otomatis 422 |
| `Depends(get_weather_service)` | FastAPI yang menyiapkan Service, kamu tidak membuatnya di sini |

### Kerjakan

`controllers/weather_controller.py`:

1. `router = APIRouter(prefix="/api")`
2. factory `get_weather_service()` yang mengembalikan `WeatherService(WeatherAPIClient())`,
   diberi `@lru_cache` agar client tidak dibuat ulang tiap request
3. endpoint `search_weather(city: str = Query(..., min_length=2), service=Depends(...))`
   dengan `response_model=WeatherReport`

Inti endpoint: **terjemahkan exception jadi status**.

```python
    try:
        return service.get_weather_report(city)
    except LocationNotFoundError:
        raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan.") from None
    except WeatherAPIError:
        raise HTTPException(status_code=502, detail="Layanan cuaca sedang bermasalah.") from None
```

Perhatikan tidak ada `httpx` di file ini. Kalau ada, ada yang salah tempat.

### ✅ Cek

Belum bisa — router belum didaftarkan. Lanjut ke langkah 6.

---

## 9. Langkah 6 — `main.py`: merakit

```python
from fastapi import FastAPI

from weather_search.controllers import weather_controller

app = FastAPI(title="Weather Search API")
app.include_router(weather_controller.router)
```

Dua baris tambahan itu mengubah server kosong menjadi API yang hidup.

### ✅ Cek

```bash
uv run uvicorn weather_search.main:app --reload
curl -s "http://127.0.0.1:8000/api/weather?city=Bandung" | head -c 300
```

Empat status yang wajib kamu lihat dengan mata sendiri:

| Perintah | Status yang benar | Kalau salah, artinya |
| --- | --- | --- |
| `?city=Bandung` | `200` + JSON laporan | 500 → exception lolos, baca traceback |
| `?city=zzzzz` | `404` | 200 → Service tidak melempar `LocationNotFoundError` |
| `?city=a` | `422` | 200 → `Query(min_length=2)` lupa dipasang |
| Matikan Wi-Fi, lalu coba lagi | `502` | 500 → `httpx` error tidak dibungkus |

Cara melihat status: `curl -i -s "..." | head -1`.

---

## 10. Langkah 7 — tes: memastikan tidak rusak saat diubah

### Kenapa tes yang memakai internet itu buruk

Tes yang memanggil Open-Meteo akan gagal saat internet mati, lambat, dan hasilnya berubah
tiap hari. Karena itu kita pakai **fake client**: objek yang punya method sama tapi
menjawab dengan data karangan.

```python
class FakeClient:
    def search_location(self, city: str) -> dict:
        return {}          # simulasi "kota tidak ditemukan"
```

Inilah buah dari dependency injection di langkah 4: `WeatherService(FakeClient())` bisa
dibuat dalam satu baris.

### Kerjakan

Buat `tests/test_weather_service.py` dengan minimal tiga tes:

| Tes | Fake client berperilaku | Yang diharapkan |
| --- | --- | --- |
| Kota tidak ada | `search_location` → `{}` | `pytest.raises(LocationNotFoundError)` |
| Laporan lengkap | mengembalikan data 7 hari | `len(report.daily_history) == 7` |
| Data kurang | hanya 6 hari | `pytest.raises(WeatherAPIError)` |

```python
import pytest

from weather_search.exceptions import LocationNotFoundError
from weather_search.services.weather_service import WeatherService


def test_lokasi_tidak_ditemukan():
    service = WeatherService(FakeClient())
    with pytest.raises(LocationNotFoundError):
        service.get_weather_report("zzzzz")
```

### ✅ Cek

```bash
uv run pytest -v
```

Harus muncul tiga nama tes dengan `PASSED`. Selama `tests/` kosong, pytest sengaja
keluar dengan kode 5 ("no tests ran") — itu bukan error.

---

## 11. Langkah 8 — uji dari frontend

Backend yang "jalan di curl" belum tentu jalan di browser. Uji lewat proxy Vite:

```bash
# terminal 1
cd backend && uv run uvicorn weather_search.main:app --reload

# terminal 2
cd frontend && npm run dev

# terminal 3
curl -s "http://localhost:5173/api/weather?city=Bandung"
```

Balasan JSON membuktikan rantai React → Vite → FastAPI utuh. Kalau yang keluar HTML,
proxy-nya bermasalah, bukan backend-nya.

Checklist kesesuaian dengan requirements:

- [ ] FR-01/02 — nama kota diterima, geocoding dipanggil
- [ ] FR-03 — `location.name` dan `location.country` terisi
- [ ] FR-04/05 — suhu, curah hujan, kondisi saat ini ada
- [ ] FR-06/07/08 — tepat 7 hari, masing-masing punya tanggal, max, min, hujan, kondisi
- [ ] FR-09 — kota tidak dikenal → 404 dengan pesan jelas
- [ ] FR-10 — API mati → 502, aplikasi tidak crash

---

## 12. Kesalahan umum: gejala → sebab → solusi

| Gejala | Sebab paling sering | Solusi |
| --- | --- | --- |
| `ModuleNotFoundError: weather_search` | Menjalankan `python` system, bukan `uv run` | Selalu `uv run ...`; cek `uv sync` sudah dijalankan |
| `ImportError: cannot import name 'X'` | Nama file/class beda, atau `__init__.py` belum diisi | Bandingkan nama file dengan nama impor |
| Selalu 422 | `city` dikirim sebagai parameter fungsi biasa tanpa `Query` | Pakai `Query(..., min_length=2)` |
| Selalu 404 untuk kota yang jelas ada | Membaca `results` yang kosong karena parameternya salah ketik | Bandingkan parameter dengan URL di browser |
| 500 dengan `KeyError: 'temperature_2m'` | Nama field JSON salah tebak | Lihat JSON asli, jangan menghafal |
| 500 dengan `ValidationError` | Jumlah hari bukan 7 | Bungkus jadi `WeatherAPIError`, lalu periksa jendela tanggal |
| `502` padahal internet hidup | `raise_for_status()` melempar untuk 4xx/5xx | Cetak `response.status_code` dan `response.text` sementara waktu |
| Riwayat bergeser satu hari | Pakai tanggal server, bukan `ZoneInfo(lokasi)` | Ulangi bagian 7a |
| Frontend `CORS error` | Memanggil `http://localhost:8000` langsung | Panggil `/api/...`, biarkan proxy yang meneruskan |

Cara membaca traceback: baca dari **bawah ke atas**. Baris terakhir = jenis error. Baris
`File "...", line N` pertama yang menyebut kode **kamu** (bukan `site-packages`) itulah
tempat masalahnya.

---

## 13. Setelah backend selesai

Urutan commit yang enak dibaca orang lain (dan dosen):

1. `feat: model data cuaca dengan validasi 7 hari`
2. `feat: client Open-Meteo (geocoding, forecast, archive)`
3. `feat: service penyusun laporan + penanganan error`
4. `feat: endpoint GET /api/weather`
5. `test: tes service dengan fake client`

Lalu berpindah ke frontend: `src/types/weather.ts` (tipe kontrak sekali saja), kemudian
`WeatherSearchForm` → `CurrentWeatherCard` → `DailyWeatherList` → `WeatherApp` yang
menyatukan semuanya.

---

## Lampiran A — peta istilah

| Istilah | Arti satu kalimat |
| --- | --- |
| Uvicorn | Server yang membuka port 8000 dan menerima koneksi |
| FastAPI | Framework yang memutuskan fungsi mana menangani URL mana |
| Pydantic | Pustaka pencetak objek bertipe yang menolak data cacat |
| httpx | Pustaka pengirim permintaan HTTP dari Python |
| APIRouter | "FastAPI mini" untuk mengelompokkan endpoint |
| Depends | Cara FastAPI menyiapkan objek yang dibutuhkan endpoint |
| Dependency injection | Memberi objek dari luar, bukan membuatnya di dalam |
| Query parameter | Bagian URL setelah `?`, mis. `city=Bandung` |
| Response model | Cetakan yang dipakai FastAPI untuk membentuk JSON balasan |
| Fake client | Objek tiruan dengan method sama, untuk tes tanpa internet |

## Lampiran B — rujukan

**Internal**

- `docs/REQUIREMENTS-1.md` — persyaratan, nomor FR/NFR
- `docs/weather-search-oop-dan-teknologi.md` — class diagram, alur runtime, penjelasan OOP
- `docs/SETUP.md` — alasan struktur dan tooling
- `AGENTS.md` — batas antar-lapisan dan aturan penamaan

**Resmi**

- FastAPI — Bigger Applications: <https://fastapi.tiangolo.com/tutorial/bigger-applications/>
- FastAPI — Query parameters: <https://fastapi.tiangolo.com/tutorial/query-params/>
- FastAPI — Handling errors: <https://fastapi.tiangolo.com/tutorial/handling-errors/>
- Pydantic — Models: <https://docs.pydantic.dev/latest/concepts/models/>
- httpx — Quickstart: <https://www.python-httpx.org/quickstart/>
- Open-Meteo — Dokumentasi: <https://open-meteo.com/en/docs>
- pytest — Get started: <https://docs.pytest.org/en/stable/getting-started.html>

## Lampiran C — kalau mentok

1. **Baca ulang pesan error dari bawah**, lalu cari baris yang menyebut file milikmu.
2. **Kecilkan masalah.** Jangan jalankan semua lapisan; uji satu bagian dengan blok
   `uv run python - <<'PY'` seperti di setiap langkah `✅ Cek`.
3. **Pakai pembanding, jangan penyalinan.** `docs/weather-search-oop-dan-teknologi.md`
   bagian 6.4 memuat kerangka kode lengkap. Buka, baca **satu method** yang kamu butuhkan,
   tutup dokumen, lalu tulis ulang dengan namamu sendiri. Menyalin seluruh file akan
   membuat kamu bingung saat ada bug — dan kode itu memang bukan tanpa celah (bagian
   "Celah pada kerangka kode" menjelaskannya).
4. **Beri waktu 20 menit.** Kalau belum pecah juga, tinggalkan, kerjakan langkah lain yang
   masih bisa, lalu kembali.
