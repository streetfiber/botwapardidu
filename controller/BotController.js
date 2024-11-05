const { Controller, Response } = require("pepesan");
const f = require("../utils/Formatter");
const gsheet = require("../service/gsheet");
const { Validator } = require("node-input-validator");

module.exports = class BotController extends Controller {
    async introduction(request) {
        return Response.menu.fromArrayOfString(
            [
                f("menu.booking"),
                f("menu.rincian"),
                f("menu.chatadmin"),
                f("menu.feedback"),
                f("menu.helper"),
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
    
    
    async chatadmin(request) {
        return this.reply("Klik tombol ini untuk memulai live chat.");
        await this.reply(f("nomoradmin"))
    }

    async feedback(request) {
        return this.reply(f("feedback.question"))
        return this.reply(f("feedback.link"))
    }
    
    async helper(request){
        return this.reply(`📋 Panduan Fitur-Fitur Chatbot Rincian Booking\n\n 1. Rincian Booking
            \n a. Deskripsi: Fitur ini digunakan untuk melihat riwayat transaksi atau booking yang pernah Anda lakukan.
            \n b. Cara Penggunaan: Pilih menu Rincian Booking.
            \n  1) Jika Anda sudah pernah melakukan booking dan menyelesaikan pembayaran, chatbot akan menampilkan detail transaksi Anda.
            \n  2) Jika belum ada transaksi, pesan "Maaf, belum ada transaksi booking" akan ditampilkan.\n\n 2. Booking 
            \n a. Deskripsi: Fitur ini memandu Anda untuk melakukan pemesanan (booking) studio foto.
            \n b. Cara Penggunaan: Pilih menu Booking dan Anda akan menerima tautan untuk mengakses website pemesanan.
            \n Di website, Anda akan menemukan dua opsi:
            \n 1) Cek Booking: Untuk mengecek ketersediaan jadwal studio.
            \n 2) Booking: Untuk melakukan pemesanan dengan mengisi formulir berisi nama, nomor WhatsApp, jumlah orang, tanggal foto, dan jam foto.
            \n Setelah formulir diisi, lanjutkan ke proses pembayaran. Jika pembayaran berhasil, notifikasi konfirmasi akan muncul di website.\n\n 3. Chat Admin
            \n a. Deskripsi: Fitur ini menghubungkan Anda langsung dengan admin Pardidu Photoworks untuk bantuan lebih lanjut.
            \n b. Cara Penggunaan: Pilih menu Chat Admin, dan Anda akan diarahkan untuk mengirim pesan langsung ke admin. Pastikan untuk menghubungi admin selama jam kerja untuk respons cepat.\n\n 4. Feedback
            \n a. Deskripsi: Fitur ini berfungsi untuk memberikan penilaian terhadap layanan chatbot dan pengalaman Anda.
            \n b. Cara Penggunaan: Pilih menu Feedback, lalu berikan penilaian dalam bentuk rating (1-5) dan komentar singkat. Feedback Anda sangat berharga untuk perbaikan layanan.\n\n 5. Helper
            \n a. Deskripsi: Menu Helper adalah panduan lengkap penggunaan chatbot. Jika Anda mengalami kendala, pilih menu Helper ini kapan saja untuk mendapatkan informasi panduan seperti saat ini.\n\n
            `);
            
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
