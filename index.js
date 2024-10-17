require('dotenv').config();
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Boom } = require('@hapi/boom');
const router = require('./router'); // Mengimpor router
const app = express();

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static('public'));
app.use(express.json()); // Untuk mengurai JSON pada body request

// Membuat folder 'public' jika belum ada
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    console.log('Folder public dibuat.');
}

// Fungsi untuk memulai socket dan koneksi WhatsApp
const startSock = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        
        const socket = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ['My WhatsApp Bot', 'Chrome', '1.0.0'],
        });

        // Event saat menerima pembaruan koneksi
        socket.ev.on('connection.update', async (update) => {
            const { connection, qr } = update;
            
            if (qr) {
                console.log('Scan QR code yang muncul di terminal...');
                // Meng-generate QR code untuk ditampilkan di browser
                const qrCodeDataURL = await QRCode.toDataURL(qr);
                console.log('QR Code data generated:', qrCodeDataURL);
            }

            if (connection === 'close') {
                const reason = new Boom(update.lastDisconnect?.error)?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log('WhatsApp logged out, reconnecting...');
                    await startSock();
                } else {
                    console.log('Connection closed, reconnecting...', reason);
                    await startSock();
                }
            }
        });

        // Simpan session credentials
        socket.ev.on('creds.update', saveCreds);

        // Event saat menerima pesan
        socket.ev.on('messages.upsert', async (msg) => {
            const message = msg.messages[0];
            if (!message.key.fromMe && message.message) {
                console.log('Received message:', message);
                const from = message.key.remoteJid;
                const text = message.message.conversation || message.message.extendedTextMessage.text;

                // Mengarahkan pesan ke router untuk diproses
                await router.processMessage(socket, from, text);
            }
        });

    } catch (err) {
        console.error('Error connecting to WhatsApp:', err);
    }
};

// Mulai socket dan koneksi WhatsApp
startSock();

// Menjalankan server pada port yang ditentukan (gunakan PORT dari environment jika tersedia)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
