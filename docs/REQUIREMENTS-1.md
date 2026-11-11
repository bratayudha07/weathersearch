# REQUIREMENTS.md

# Weather Search --- Persyaratan dan Rancangan Sistem

**Versi:** 1.0\
**Status:** Draft rancangan\
**Backend:** Python + FastAPI\
**Sumber data:** Open-Meteo\
**Bahasa dokumentasi:** Indonesia

------------------------------------------------------------------------

## 1. Deskripsi Proyek

Weather Search adalah aplikasi web sederhana untuk mencari informasi
cuaca berdasarkan nama kota atau daerah. Pengguna memasukkan nama
lokasi, kemudian aplikasi mengambil informasi cuaca saat ini dan
ringkasan cuaca harian selama tujuh hari sebelumnya.

Backend dikembangkan menggunakan Python dan FastAPI. Data cuaca
diperoleh dari layanan Open-Meteo sehingga aplikasi tidak memerlukan
database untuk ruang lingkup awal.

## 2. Tujuan

1.  Memungkinkan pengguna mencari cuaca berdasarkan nama kota atau
    daerah.
2.  Menampilkan informasi cuaca terkini untuk lokasi yang dicari.
3.  Menampilkan ringkasan cuaca harian selama tujuh hari sebelum tanggal
    pencarian.
4.  Menerapkan pemrograman berorientasi objek (OOP) dengan struktur yang
    sederhana dan mudah dipahami.
5.  Memisahkan proses penerimaan permintaan, logika aplikasi, dan
    komunikasi dengan API eksternal.

## 3. Ruang Lingkup

### 3.1 Fitur yang termasuk

-   Pencarian lokasi menggunakan nama kota atau daerah.
-   Menampilkan nama lokasi dan negara hasil pencarian.
-   Menampilkan suhu saat ini.
-   Menampilkan curah hujan saat ini.
-   Menampilkan kondisi cuaca saat ini.
-   Menampilkan riwayat cuaca dalam bentuk ringkasan harian selama tujuh
    hari sebelumnya.
-   Menampilkan suhu maksimum, suhu minimum, curah hujan, dan kondisi
    cuaca untuk setiap hari dalam riwayat.
-   Menangani lokasi yang tidak ditemukan dan kegagalan komunikasi API.

### 3.2 Di luar ruang lingkup versi awal

-   Prakiraan cuaca untuk hari-hari mendatang.
-   Peta interaktif dan pelacakan GPS pengguna.
-   Akun, login, dan pengelolaan pengguna.
-   Penyimpanan riwayat pencarian.
-   Database lokal.
-   Notifikasi cuaca.
-   Perbandingan cuaca beberapa kota sekaligus.

## 4. Persyaratan Fungsional

  -----------------------------------------------------------------------
  ID                                  Persyaratan
  ----------------------------------- -----------------------------------
  FR-01                               Sistem harus menerima nama kota
                                      atau daerah dari pengguna.

  FR-02                               Sistem harus mencari lokasi dan
                                      koordinat menggunakan Geocoding API
                                      Open-Meteo.

  FR-03                               Sistem harus memberikan informasi
                                      lokasi yang ditemukan, setidaknya
                                      nama lokasi dan negara.

  FR-04                               Sistem harus mengambil kondisi
                                      cuaca terkini berdasarkan koordinat
                                      lokasi.

  FR-05                               Sistem harus menampilkan suhu,
                                      curah hujan, dan kondisi cuaca saat
                                      ini.

  FR-06                               Sistem harus mengambil data
                                      historis untuk tujuh tanggal
                                      kalender sebelum tanggal saat ini.

  FR-07                               Sistem harus menyajikan data
                                      historis dalam ringkasan harian,
                                      bukan data per jam.

  FR-08                               Setiap ringkasan harian harus
                                      memuat tanggal, suhu maksimum, suhu
                                      minimum, curah hujan, dan kondisi
                                      cuaca.

  FR-09                               Sistem harus mengembalikan pesan
                                      yang sesuai apabila lokasi tidak
                                      ditemukan.

  FR-10                               Sistem harus menangani kegagalan
                                      atau respons tidak valid dari API
                                      eksternal tanpa membuat aplikasi
                                      berhenti secara tidak terkendali.
  -----------------------------------------------------------------------

## 5. Aturan Data dan Perhitungan

### 5.1 Cuaca saat ini

Data cuaca saat ini diambil menggunakan koordinat lokasi yang ditemukan.
Informasi minimum:

-   `temperature`: suhu saat ini dalam derajat Celsius.
-   `precipitation`: curah hujan dalam milimeter.
-   `weather_code`: kode kondisi cuaca dari Open-Meteo.
-   `condition`: keterangan kondisi cuaca yang diperoleh dari pemetaan
    `weather_code`.

### 5.2 Riwayat cuaca

Riwayat terdiri dari **tujuh hari kalender sebelum hari ini**. Hari ini
tidak dihitung sebagai bagian dari tujuh hari riwayat.

Contoh: apabila tanggal pencarian adalah 9 November, riwayat yang
ditampilkan adalah 2--8 November.

Setiap data harian memuat:

-   `date`: tanggal data.
-   `temp_max`: suhu maksimum harian dalam derajat Celsius.
-   `temp_min`: suhu minimum harian dalam derajat Celsius.
-   `precipitation`: total curah hujan harian dalam milimeter.
-   `weather_code`: kode kondisi cuaca harian.
-   `condition`: keterangan kondisi cuaca hasil pemetaan kode.

Sistem harus memperhatikan zona waktu lokasi agar batas tanggal hari ini
dan tujuh hari sebelumnya konsisten dengan lokasi yang dicari.

### 5.3 Sumber dan keterbatasan data

-   Geocoding: Open-Meteo Geocoding API.
-   Cuaca saat ini: Open-Meteo Forecast API.
-   Riwayat cuaca: Open-Meteo Historical Weather API (Archive API).

Data historis Open-Meteo merupakan data berbasis model cuaca dan tidak
selalu sama dengan hasil pengukuran langsung stasiun cuaca setempat.
Aplikasi tidak boleh menyatakan data tersebut sebagai pengukuran
langsung apabila sumbernya tidak mendukung klaim tersebut.

## 6. Persyaratan Nonfungsional

  -----------------------------------------------------------------------
  ID                                  Persyaratan
  ----------------------------------- -----------------------------------
  NFR-01                              Kode backend harus menggunakan
                                      Python.

  NFR-02                              Backend harus menyediakan REST API
                                      menggunakan FastAPI.

  NFR-03                              Komunikasi HTTP ke layanan
                                      eksternal menggunakan HTTPX.

  NFR-04                              Struktur data dan validasi model
                                      menggunakan Pydantic.

  NFR-05                              Kode harus dipisahkan berdasarkan
                                      tanggung jawabnya.

  NFR-06                              Kegagalan API eksternal harus
                                      ditangani dengan pesan kesalahan
                                      yang jelas.

  NFR-07                              URL layanan eksternal dan
                                      konfigurasi penting tidak boleh
                                      tersebar di banyak bagian kode.

  NFR-08                              Kode harus mudah dibaca,
                                      dipelajari, dan diuji oleh
                                      mahasiswa.
  -----------------------------------------------------------------------

## 7. Rancangan Arsitektur

Sistem menggunakan pemisahan tanggung jawab sederhana:

1.  **Controller** menerima permintaan HTTP dan mengembalikan respons.
2.  **Service** mengatur alur pencarian lokasi, pengambilan cuaca, dan
    penyusunan laporan.
3.  **API Client** berkomunikasi dengan layanan Open-Meteo.
4.  **Models** merepresentasikan data lokasi, cuaca saat ini, cuaca
    harian, dan laporan cuaca.

### Alur proses

``` mermaid
flowchart TD
    A([Mulai]) --> B[Pengguna memasukkan nama kota]
    B --> C[Weather Controller menerima permintaan]
    C --> D[Weather Service meminta pencarian lokasi]
    D --> E[Weather API Client memanggil Geocoding API]
    E --> F{Lokasi ditemukan?}
    F -- Tidak --> G[Kembalikan pesan lokasi tidak ditemukan]
    G --> H([Selesai])
    F -- Ya --> I[Ambil koordinat lokasi]
    I --> J[Ambil cuaca saat ini dari Forecast API]
    J --> K[Ambil riwayat 7 hari dari Archive API]
    K --> L[Bentuk objek Location dan data cuaca]
    L --> M[Susun Weather Report]
    M --> N[Kembalikan respons JSON]
    N --> H
```

## 8. Rancangan OOP dan Class

Rancangan menggunakan enam class Python utama dan satu modul Controller.
Controller direncanakan sebagai fungsi endpoint FastAPI, bukan class
khusus.

### 8.1 `WeatherService`

**Tanggung jawab:** mengatur proses pencarian cuaca dari awal sampai
laporan siap dikembalikan.

Atribut: - `api_client`: objek `WeatherAPIClient` yang digunakan untuk
mengambil data.

Method: - `get_weather_report(city: str) -> WeatherReport`: mencari
lokasi, mengambil cuaca saat ini dan riwayat, lalu menyusun laporan.

### 8.2 `WeatherAPIClient`

**Tanggung jawab:** menjadi penghubung antara aplikasi dan Open-Meteo
API.

Atribut: - `base_url`: alamat dasar Forecast API. - `geocoding_url`:
alamat Geocoding API. - `archive_url`: alamat Historical Weather API.

Method: - `search_location(city: str) -> dict`: mencari lokasi
berdasarkan nama kota atau daerah. -
`get_current_weather(latitude: float, longitude: float) -> dict`:
mengambil data cuaca saat ini. -
`get_historical_weather(latitude: float, longitude: float, start_date: str, end_date: str) -> dict`:
mengambil data historis harian.

Catatan: HTTPX digunakan di dalam class ini. Pengaturan timeout dan
penanganan HTTP error dilakukan di sini agar detail komunikasi API tidak
tersebar ke bagian lain.

### 8.3 `Location`

**Tanggung jawab:** merepresentasikan lokasi yang ditemukan.

Atribut: - `name: str` - `country: str` - `latitude: float` -
`longitude: float`

Method: - `get_info() -> str`: menghasilkan informasi singkat lokasi
jika diperlukan.

### 8.4 `CurrentWeather`

**Tanggung jawab:** merepresentasikan kondisi cuaca saat ini.

Atribut: - `temperature: float` - `precipitation: float` -
`weather_code: int` - `condition: str`

Method: - `get_info() -> str`: menghasilkan ringkasan kondisi cuaca jika
diperlukan.

### 8.5 `DailyWeather`

**Tanggung jawab:** merepresentasikan ringkasan cuaca untuk satu hari.

Atribut: - `date: str` - `temp_max: float` - `temp_min: float` -
`precipitation: float` - `weather_code: int` - `condition: str`

Method: - `get_info() -> str`: menghasilkan ringkasan cuaca harian jika
diperlukan.

### 8.6 `WeatherReport`

**Tanggung jawab:** menggabungkan lokasi, cuaca saat ini, dan riwayat
harian menjadi satu hasil pencarian.

Atribut: - `location: Location` - `current_weather: CurrentWeather` -
`daily_history: list[DailyWeather]`

Method khusus belum diwajibkan. Class ini berfungsi sebagai objek hasil
yang dikembalikan oleh `WeatherService`.

### 8.7 `WeatherController` (modul, bukan class)

**Tanggung jawab:** menyediakan endpoint FastAPI untuk menerima nama
kota dan mengembalikan `WeatherReport` sebagai JSON.

Endpoint yang direncanakan: - `GET /api/weather?city={nama_kota}`

Controller menggunakan `WeatherService` yang diberikan melalui mekanisme
dependency injection FastAPI.

## 9. UML Class Diagram

Diagram berikut merupakan rancangan hubungan class. `WeatherController`
ditampilkan sebagai komponen `FastAPI Router`, bukan class bisnis
Python.

``` mermaid
classDiagram
    direction LR

    class WeatherController {
        <<FastAPI Router>>
        +search_weather(city: str) WeatherReport
    }

    class WeatherService {
        -api_client: WeatherAPIClient
        +get_weather_report(city: str) WeatherReport
    }

    class WeatherAPIClient {
        -base_url: str
        -geocoding_url: str
        -archive_url: str
        +search_location(city: str) dict
        +get_current_weather(latitude: float, longitude: float) dict
        +get_historical_weather(latitude: float, longitude: float, start_date: str, end_date: str) dict
    }

    class Location {
        +name: str
        +country: str
        +latitude: float
        +longitude: float
        +get_info() str
    }

    class CurrentWeather {
        +temperature: float
        +precipitation: float
        +weather_code: int
        +condition: str
        +get_info() str
    }

    class DailyWeather {
        +date: str
        +temp_max: float
        +temp_min: float
        +precipitation: float
        +weather_code: int
        +condition: str
        +get_info() str
    }

    class WeatherReport {
        +location: Location
        +current_weather: CurrentWeather
        +daily_history: list~DailyWeather~
    }

    WeatherController ..> WeatherService : menggunakan
    WeatherService ..> WeatherAPIClient : menggunakan
    WeatherService ..> Location : membuat
    WeatherService ..> CurrentWeather : membuat
    WeatherService ..> DailyWeather : membuat
    WeatherService ..> WeatherReport : menghasilkan

    WeatherReport "1" *-- "1" Location : memiliki
    WeatherReport "1" *-- "1" CurrentWeather : memiliki
    WeatherReport "1" *-- "7" DailyWeather : memiliki
```

## 10. Penjelasan Relasi Antarclass

### 10.1 Dependency

-   `WeatherController` bergantung pada `WeatherService` untuk memproses
    permintaan.
-   `WeatherService` bergantung pada `WeatherAPIClient` untuk mengambil
    data eksternal.
-   `WeatherService` menggunakan class model untuk membentuk hasil
    pencarian.

Dependency digambarkan menggunakan garis putus-putus dengan panah.

### 10.2 Composition

`WeatherReport` memiliki tiga bagian: - Satu `Location`. - Satu
`CurrentWeather`. - Tujuh `DailyWeather`.

Hubungan ini digambarkan menggunakan composition (berlian hitam), karena
objek-objek tersebut menjadi bagian dari satu laporan cuaca.

Multiplicity `7` menunjukkan bahwa laporan lengkap harus memiliki tujuh
ringkasan harian. Jika pengambilan data historis gagal, sistem harus
mengembalikan kesalahan yang sesuai, bukan membuat laporan lengkap
dengan data palsu.

## 11. Penerapan OOP dan Design Pattern

### 11.1 Encapsulation

Encapsulation diterapkan dengan mengelompokkan data dan validasi dalam
model masing-masing, seperti `Location`, `CurrentWeather`, dan
`DailyWeather`.

Model dapat menggunakan Pydantic `BaseModel` agar tipe data dan validasi
lebih mudah dikelola.

### 11.2 Abstraction

Abstraction diterapkan melalui `WeatherService`. Controller tidak perlu
mengetahui detail endpoint Open-Meteo, parameter HTTP, atau cara membaca
respons API. Controller cukup meminta laporan cuaca kepada service.

### 11.3 Layered Architecture

Aplikasi membagi tanggung jawab menjadi Controller, Service, API Client,
dan Models. Pemisahan ini membuat kode lebih terorganisasi dan lebih
mudah dipelajari.

### 11.4 Service Layer Pattern

`WeatherService` menjadi pusat logika aplikasi. Proses pencarian lokasi,
pengambilan cuaca saat ini, pengambilan riwayat, dan penyusunan laporan
dikelola melalui satu lapisan service.

### 11.5 Dependency Injection

`WeatherAPIClient` diberikan kepada `WeatherService` melalui
constructor. Dengan demikian, service tidak membuat sendiri objek API
Client di dalam setiap method.

Contoh:

``` python
class WeatherService:
    def __init__(self, api_client):
        self.api_client = api_client
```

**Catatan istilah:** Layered Architecture adalah pola arsitektur,
sedangkan Service Layer adalah pola desain arsitektural. Dependency
Injection merupakan teknik desain. Ketiganya tidak perlu disebut sebagai
tiga GoF Design Pattern. Singleton, Factory, Observer, dan Strategy
tidak digunakan karena belum dibutuhkan oleh ruang lingkup aplikasi.

## 12. Teknologi dan Library

  Teknologi / Library   Kegunaan
  --------------------- ---------------------------------------
  Python                Bahasa pemrograman backend.
  FastAPI               Membuat REST API dan endpoint.
  Uvicorn               Menjalankan aplikasi FastAPI.
  HTTPX                 Mengirim HTTP request ke Open-Meteo.
  Pydantic              Validasi dan representasi data model.
  Pytest                Pengujian fungsi dan service.
  Open-Meteo            Penyedia data geocoding dan cuaca.

Instalasi awal:

``` bash
uv add fastapi uvicorn httpx
uv add --dev pytest
```

Pydantic sudah menjadi dependency FastAPI dan dapat digunakan tanpa
instalasi terpisah untuk kebutuhan dasar.

## 13. Struktur Folder Backend

``` text
backend/
├── main.py
│
├── controllers/
│   └── weather_controller.py
│
├── services/
│   └── weather_service.py
│
├── clients/
│   └── weather_api_client.py
│
└── models/
    ├── location.py
    ├── current_weather.py
    ├── daily_weather.py
    └── weather_report.py
```

## 14. Kriteria Penerimaan

Versi awal aplikasi dianggap memenuhi kebutuhan apabila:

1.  Backend dapat dijalankan menggunakan Uvicorn.
2.  Endpoint pencarian menerima parameter nama kota atau daerah.
3.  Lokasi yang ditemukan memiliki nama dan koordinat yang valid.
4.  Respons berhasil memuat cuaca saat ini: suhu, curah hujan, dan
    kondisi cuaca.
5.  Respons berhasil memuat tepat tujuh ringkasan cuaca harian sebelum
    hari ini.
6.  Setiap ringkasan harian memuat tanggal, suhu maksimum, suhu minimum,
    curah hujan, dan kondisi cuaca.
7.  Lokasi yang tidak ditemukan menghasilkan respons kesalahan yang
    sesuai.
8.  Kegagalan komunikasi API ditangani dengan baik.
9.  Struktur kode mengikuti pemisahan Controller, Service, API Client,
    dan Models.

## 15. Catatan Implementasi

-   Gunakan satuan metrik: suhu Celsius, curah hujan milimeter, dan
    kecepatan angin tidak menjadi informasi wajib versi awal.
-   Gunakan zona waktu otomatis berdasarkan koordinat lokasi untuk
    menentukan tanggal lokal.
-   Gunakan Forecast API untuk kondisi saat ini dan Archive API untuk
    riwayat tujuh hari sebelumnya.
-   Pemetaan `weather_code` ke teks kondisi cuaca dilakukan secara
    konsisten.
-   Jangan mengembalikan data contoh atau nilai default seolah-olah
    merupakan data cuaca asli ketika API gagal.
-   Frontend dirancang pada bagian 16 dan desain visualnya akan
    dikembangkan lebih lanjut melalui Penpot.
-   UML merupakan rancangan awal yang harus tetap disesuaikan jika
    implementasi menemukan kebutuhan teknis yang berbeda.

## 16. Rancangan Frontend

Frontend merupakan kelanjutan dari tahap rancangan backend ini. Desain
frontend dibangun berdasarkan kontrak data yang dihasilkan `WeatherService`
dan menampilkan hasilnya dalam bentuk antarmuka pengguna.

### 16.1 Tujuan Frontend

1.  Menerima nama kota atau daerah dari pengguna melalui form pencarian.
2.  Mengonsumsi backend melalui endpoint `GET /api/weather?city={nama}`.
3.  Menampilkan informasi cuaca saat ini dan riwayat tujuh hari sebelumnya.
4.  Menampilkan pesan kesalahan yang sesuai ketika lokasi tidak ditemukan
    atau backend gagal mengambil data.

### 16.2 Teknologi Frontend

-   Framework: React + Vite.
-   Komunikasi data: HTTP client berbasis `fetch` ke backend lokal.
-   Styling: Tailwind CSS.

### 16.3 Komponen Frontend

-   `WeatherApp`: mengelola state pencarian, status loading, dan penyusunan
    laporan cuaca dari backend.
-   `WeatherSearchForm`: menerima input nama kota atau daerah dan tombol
    pencarian.
-   `CurrentWeatherCard`: menampilkan lokasi, negara, suhu, curah hujan, dan
    kondisi cuaca saat ini.
-   `DailyWeatherList`: menampilkan tujuh ringkasan cuaca harian.

### 16.4 Alur Frontend dan Backend

Frontend mengirim nama kota ke backend melalui endpoint
`GET /api/weather?city={nama_kota}`. Backend akan mengembalikan objek
`WeatherReport`, lalu frontend menyusun tampilan dari hasilnya.

### 16.5 Desain Visual

Desain visual difokuskan pada halaman pencarian dan kartu cuaca. Proses
desain visual akan dikembangkan melalui skill `ui-ux-pro-max` dan `ui-styling`
pada MCP Penpot.

### 16.6 Kriteria Penerimaan Frontend

1.  Form pencarian menerima nama kota atau daerah.
2.  Saat backend merespons berhasil, frontend menampilkan cuaca saat ini.
3.  Saat backend merespons berhasil, frontend menampilkan tujuh ringkasan
    cuaca harian sebelum hari ini.
4.  Saat backend merespons gagal, frontend menampilkan pesan kesalahan yang
    sesuai.
