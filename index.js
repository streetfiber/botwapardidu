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
        await pepesan.connect();
        console.log('Connected to WhatsApp, QR Code generated:', pepesan);
    } catch (error) {
        console.error('Error connecting to WhatsApp:', error);
    }
})();
