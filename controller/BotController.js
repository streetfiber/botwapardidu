const { Controller, Response } = require("pepesan");
const f = require("../utils/Formatter");
const gsheet = require("../service/gsheet");

module.exports = class BotController extends Controller {
    async introduction(request) {
        return Response.menu.fromArrayOfString(
            [
                f("menu.booking"),
                f("menu.rincian"),
                f("menu.livechat"),
                f("menu.feedback")
            ],
            f("intro", [request.name]),
            f("template.menu")
        );
    }

    async booking(request) {
        if (!request.number) {
            await this.reply("Silakan masukkan nomor WhatsApp untuk melanjutkan.");
            return;
        }
    
        // Kirimkan link Google Form
        await this.reply(f("menubookingtemplate"));
        await this.reply(f("menubookingtemplate2"));
        
        // Setelah mengirim template booking, cek status pembayaran dengan GET request
        try {
            
            const response = await axios.get("https://my-nodejs-project-production.up.railway.app/midtrans-finish", {
                params: {
                    order_id: request.body.order_id, // Sesuaikan dengan order_id dari form, jika ada
                    whatsapp : request.body.whatsapp,
                    jumlah_orang : request.body.jumlah_orang,
                    tanggal_foto : request.body.tanggal_foto,
                    jam_foto : request.body.jam_foto,
                    harga_total : request.body.harga_total,
                    status_message : 'berhasil',
                },
            });

            const paymentData = response.data;

            // Kirimkan detail pembayaran ke client via WhatsApp
            await this.reply(`Pembayaran untuk Order ID: ${paymentData.order_id} berhasil. Detail pembayaran:\nNama: ${paymentData.name}\nJumlah Orang: ${paymentData.jumlah_orang}\nTanggal Foto: ${paymentData.tanggal_foto}\nJam Foto: ${paymentData.jam_foto}\nTotal: Rp${paymentData.harga_total}\nStatus: ${paymentData.transaction_status}`);
        } catch (error) {
            console.error("Error mengambil data dari /midtrans-finish:", error);
            await this.reply("Terimakasih Telah menggunakan bot kami, see you soon!");
        }

        // Tampilkan menu dasar setelahnya
        return this.sendBasicMenu();
    }

    async rincian(request) {
        const responseStr = await gsheet.getData(request.number);
        await this.reply(f("headercekriwayat"));
        
        if (responseStr) {
            await this.reply(responseStr);
        } else {
            await this.reply("Tidak ada data riwayat yang ditemukan.");
        }
        
        return this.sendBasicMenu();
    }
    
    
    async livechat(request) {
        return this.reply("Klik tombol ini untuk memulai live chat.");
    }

    async feedback(request) {
        return this.reply("Terimakasih telah menggunakan bot pelayanan kami, mohon untuk mengisi survei penilaian.");
    }

    async sendBasicMenu(request) {
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
        );
    }

};
