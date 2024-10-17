const { Controller, Response } = require("pepesan");
const f = require("../utils/Formatter");
const gsheet = require("../service/gsheet");

module.exports = class BotController extends Controller {
    async handleIncomingMessage(socket, from, text) {
        // Ganti dengan logika pengolahan pesan Anda
        if (text === 'menu.booking') {
            await this.booking(socket, from);
        } else if (text === 'menu.rincian') {
            await this.rincian(socket, from);
        } else {
            await this.introduction(socket, from);
        }
    }

    async introduction(socket, from) {
        const message = Response.menu.fromArrayOfString(
            [
                f("menu.booking"),
                f("menu.rincian"),
                f("menu.livechat"),
                f("menu.feedback")
            ],
            f("intro", [from]), // Menggunakan 'from' untuk menampilkan nama pengguna
            f("template.menu")
        );
        await socket.sendMessage(from, { text: message });
    }

    async booking(socket, from) {
        // Pastikan nomor WhatsApp tersedia
        if (!from) {
            await socket.sendMessage(from, "Silakan masukkan nomor WhatsApp untuk melanjutkan.");
            return;
        }

        // Kirimkan link Google Form
        await socket.sendMessage(from, f("menubookingtemplate"));
        await socket.sendMessage(from, f("menubookingtemplate2"));

        // Setelah mengirim template booking, cek status pembayaran dengan GET request
        try {
            const response = await axios.get("https://my-nodejs-project-production.up.railway.app/midtrans-finish", {
                params: {
                    order_id: "your_order_id", // Sesuaikan dengan order_id dari form, jika ada
                    whatsapp: from,
                    jumlah_orang: "your_jumlah_orang", // Ganti dengan data yang sesuai
                    tanggal_foto: "your_tanggal_foto", // Ganti dengan data yang sesuai
                    jam_foto: "your_jam_foto", // Ganti dengan data yang sesuai
                    harga_total: "your_harga_total", // Ganti dengan data yang sesuai
                    status_message: 'berhasil',
                },
            });

            const paymentData = response.data;

            // Kirimkan detail pembayaran ke client via WhatsApp
            await socket.sendMessage(from, `Pembayaran untuk Order ID: ${paymentData.order_id} berhasil. Detail pembayaran:\nNama: ${paymentData.name}\nJumlah Orang: ${paymentData.jumlah_orang}\nTanggal Foto: ${paymentData.tanggal_foto}\nJam Foto: ${paymentData.jam_foto}\nTotal: Rp${paymentData.harga_total}\nStatus: ${paymentData.transaction_status}`);
        } catch (error) {
            console.error("Error mengambil data dari /midtrans-finish:", error);
            await socket.sendMessage(from, "Terimakasih Telah menggunakan bot kami, see you soon!");
        }

        // Tampilkan menu dasar setelahnya
        return this.sendBasicMenu(socket, from);
    }

    async rincian(socket, from) {
        const responseStr = await gsheet.getData(from);
        await socket.sendMessage(from, f("headercekriwayat"));
        
        if (responseStr) {
            await socket.sendMessage(from, responseStr);
        } else {
            await socket.sendMessage(from, "Tidak ada data riwayat yang ditemukan.");
        }

        return this.sendBasicMenu(socket, from);
    }
    
    async livechat(socket, from) {
        return socket.sendMessage(from, "Klik tombol ini untuk memulai live chat.");
    }

    async feedback(socket, from) {
        return socket.sendMessage(from, "Terimakasih telah menggunakan bot pelayanan kami, mohon untuk mengisi survei penilaian.");
    }

    async sendBasicMenu(socket, from) {
        return Response.menu.fromArrayOfObject(
            [
                {
                    value: "menu.back",
                    text: f("menu.back"),
                    code: "0"
                }
            ],
            "",
            f("template.menu")
        ).then(menu => {
            return socket.sendMessage(from, { text: menu });
        });
    }
};
