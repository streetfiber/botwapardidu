require('dotenv').config();
const Pepesan = require("pepesan");
const express = require('express');
const router = require("./router");
const { ALLOWED_NUMBERS } = process.env;

const app = express();

// Variable untuk menyimpan data QR Code
let qrCodeData = null;

// Endpoint untuk mendapatkan teks QR Code
app.get('/qrcode', (req, res) => {
    if (qrCodeData) {
        res.json({ qrCodeText: qrCodeData });
    } else {
        res.status(404).json({ message: 'QR Code tidak tersedia' });
    }
});

(async () => {
    const config = {
        allowedNumbers: ALLOWED_NUMBERS ? ALLOWED_NUMBERS.split(',') : null,
        browserName: 'Dewakoding App'
    }
    const pepesan = Pepesan.init(router, config)

    // Pastikan pepesan.connect dipanggil setelah inisialisasi
    await pepesan.connect();

    // Jika Pepesan menyediakan cara lain untuk mendengarkan event, gunakan itu.
    pepesan.ev.on('connection.update', (update) => { // Coba menggunakan pepesan.ev jika ada
        const { connection, qr } = update;

        if (qr) {
            console.log('QR Code untuk login:', qr);
            qrCodeData = qr; // Simpan data QR Code di sini
        }

        if (connection === 'close') {
            console.log('Koneksi ditutup, mencoba sambung kembali...');
            pepesan.connect();
        }
    });

    // Menjalankan server pada port yang ditentukan
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
