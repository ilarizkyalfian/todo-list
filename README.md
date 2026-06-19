# To-Do List App — Project Akhir Komputasi Awan

Aplikasi To-Do List sederhana berbasis arsitektur 3-container (frontend, backend, database) yang di-deploy di atas VPS publik menggunakan Docker.

## Arsitektur

```
Internet
   |
   v
[ Frontend ]  Nginx, port 8080 (satu-satunya pintu publik)
   |  - menyajikan file statis (HTML/CSS/JS)
   |  - meneruskan request /api/* ke backend (reverse proxy)
   v
[ Backend ]   Node.js + Express, port 3000 (HANYA internal, tidak diekspos)
   |  query SQL
   v
[ Database ]  MySQL 8, HANYA bisa diakses dari dalam jaringan Docker internal
```

Frontend adalah satu-satunya container yang punya port terbuka ke publik. Backend dan database sama-sama tidak diekspos langsung ke internet — keduanya hanya bisa diakses lewat jaringan Docker internal (`todo-net`). Ini sekaligus memenuhi poin bonus **Nginx Reverse Proxy**.

## Struktur folder

```
todo-app/
├── docker-compose.yml
├── .env.example
├── db/
│   └── init.sql          # membuat tabel tasks otomatis saat container db pertama kali dibuat
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js          # REST API: GET/POST/PUT/DELETE /api/tasks
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── style.css
    └── script.js
```

## Cara menjalankan di VPS

1. Clone repository ini ke VPS:
   ```bash
   git clone <url-repo-kamu>.git
   cd todo-app
   ```

2. Salin file environment dan isi dengan password kamu sendiri:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. Build dan jalankan semua container:
   ```bash
   docker compose up -d --build
   ```

4. Cek semua container berjalan:
   ```bash
   docker compose ps
   ```

5. Buka di browser:
   ```
   http://IP-PUBLIK-VPS:8080
   ```

## Perintah berguna

```bash
docker compose logs -f backend   # lihat log backend (debug koneksi DB, dll)
docker compose down              # matikan semua container
docker compose down -v           # matikan + hapus data database
docker compose up -d --build     # rebuild ulang setelah ubah kode
```

## REST API

| Method | Endpoint          | Keterangan              |
|--------|-------------------|--------------------------|
| GET    | /api/tasks        | Ambil semua tugas       |
| POST   | /api/tasks        | Tambah tugas baru        |
| PUT    | /api/tasks/:id    | Update status selesai    |
| DELETE | /api/tasks/:id    | Hapus tugas              |

## Tech stack

- Frontend: HTML, CSS, JavaScript (vanilla), disajikan oleh Nginx
- Backend: Node.js, Express, mysql2
- Database: MySQL 8
- Orkestrasi: Docker Compose
