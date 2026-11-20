# EcoDown

Media kampanye hemat energi Kelompok 3, XI-3 PPLG.

## Struktur

```
index.html      Beranda
data.html       Data & Fakta (Fase 2, grafik Chart.js)
aksi.html       Aksi & Rekomendasi (Fase 3)
tentang.html    Tentang proyek
css/style.css   Tampilan
js/main.js      Mode gelap, menu HP, daftar aksi
js/data.js      Membaca data/energi.json lalu menggambar grafik
js/aksi.js      Rekomendasi dan Tantangan 7 Hari
data/energi.json  Data grafik
data/aksi.json    Rekomendasi dan isi tantangan
```

## Mengganti data contoh

Angka di `data/energi.json` masih data contoh. Setelah hasil angket dan observasi dari mapel lain diberikan:

1. Ganti isi `label` dan `nilai` di setiap grafik.
2. Tulis ulang `kesimpulan` (1-2 kalimat) agar sesuai angka baru. Teks di antara `**` akan ditebalkan.
3. Ubah `"status": "contoh"` menjadi `"status": "final"` supaya peringatan data contoh hilang.
4. Perbarui `diperbarui` dengan tanggal hari itu (format `YYYY-MM-DD`).

Setelah itu sesuaikan `data/aksi.json`: angka di setiap `temuan` harus sama dengan grafik yang dirujuk lewat `grafik` (id grafik di energi.json). Ubah juga `status` di sana menjadi `"final"`.

Grafik baru bisa ditambahkan dengan menyalin satu objek di dalam `grafik`. Pilihan `warna`: `green`, `yellow`, `blue`, `gray`, `red`.

## Menjalankan

Browser memblokir pembacaan file JSON jika halaman dibuka langsung dari folder (`file://`). Buka lewat Live Server di VS Code, atau lewat GitHub Pages.
