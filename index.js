require('dotenv').config();
const Pepesan = require("pepesan");
const router = require("./router");
const { ALLOWED_NUMBERS } = process.env;

(async () => {
    try {
        const config = {
            allowedNumbers: ALLOWED_NUMBERS ? ALLOWED_NUMBERS.split(',') : null,
            browserName: 'Dewakoding App'
        }
        const pepesan = Pepesan.init(router, config);

        // Menambahkan listener untuk event QR Code
        pepesan.on('qr', (qr) => {
            console.log('QR Code generated:', qr); // Menampilkan QR Code
        });

        await pepesan.connect();
        console.log('Connected to WhatsApp.');
    } catch (error) {
        console.error('Error connecting to WhatsApp:', error);
    }
})();
