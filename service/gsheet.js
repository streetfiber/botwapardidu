const axios = require('axios');

// Endpoint untuk mengambil data riwayat booking
const bookingBaseUrl = "https://script.google.com/macros/s/AKfycbzRBxkZxSbD8iNZk3yw79MFS4kVeqdUFbDE2iJ7WUDH14U2aZJPEuf4IgTuE2dyb9WCWA/exec"; // Ganti dengan URL skrip Apps Script untuk riwayat booking
// Endpoint untuk mengirim feedback
const feedbackBaseUrl = "https://script.google.com/macros/s/AKfycbxtzw1MyU8frN_nWpPfJhUK6ueEJsg9bSKm_dLq9QXVKodLGUte5aMem4euQOKhIDOr/exec"; // Ganti dengan URL skrip Apps Script untuk feedback

const axiosBookingInstance = axios.create({
    baseURL: bookingBaseUrl,
    headers: {
        "Content-Type": "application/json"
    }
});

const axiosFeedbackInstance = axios.create({
    baseURL: feedbackBaseUrl,
    headers: {
        "Content-Type": "application/json"
    }
});

const formatTanggal = (tanggal) => {
    const date = new Date(tanggal); // Membuat objek Date dari string

    // Mendapatkan nilai tanggal, bulan, dan tahun
    const day = String(date.getDate()).padStart(2, '0'); // Menambah nol di depan jika perlu
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = String(date.getFullYear()).slice(-2); // Mengambil dua digit terakhir dari tahun

    return `${day}/${month}/${year}`; // Mengembalikan format dd/mm/yy
};

exports.getData = async (whatsapp) => {
    console.log(">>> WhatsApp yang dicari:", whatsapp);
    let responseStr = ""; // Inisialisasi variabel di sini

    try {
        const response = await axiosBookingInstance.get();
        console.log("Response dari API:", response.data.data); // Log respons API
        
        if (response.data && Array.isArray(response.data.data)) {
            console.log(">>> Struktur data dari Apps Script valid.");
            let dataFound = false; // Flag untuk memeriksa apakah data ditemukan
            
            response.data.data.forEach(element => {
                const whatsappFromAppsScript = element.whatsapp.toString();
                const formattedWhatsAppWithDomain = whatsappFromAppsScript + '@s.whatsapp.net';
                
                console.log(">>> WhatsApp dari Apps Script:", whatsappFromAppsScript);
                console.log(">>> WhatsApp dengan domain:", formattedWhatsAppWithDomain);
                
                if (whatsapp === whatsappFromAppsScript || whatsapp === formattedWhatsAppWithDomain) {
                    dataFound = true; // Menandai bahwa data ditemukan
                    const tanggalFormatted = formatTanggal(element.tanggal_foto);
                    responseStr += `Nama: ${element.name}, Jumlah Orang: ${element.jumlah_orang}, Tanggal Foto: ${tanggalFormatted}, Jam Foto: ${element.jam_foto}, Status: ${element.transaction_status}\n`;
                }
            });

            if (!dataFound) {
                console.log(">>> Data tidak ditemukan atau format salah");
            }
        } else {
            console.log(">>> Data dari Apps Script tidak sesuai format yang diharapkan");
        }
    } catch (error) {
        console.error(">>> Error saat mengambil data:", error);
    }

    return responseStr; // Mengembalikan responseStr
};

exports.sendFeedback = async (whatsapp, detail) => {
    const feedbackData = {
        feedback_id: Date.now(),
        nama :nama,
        whatsapp: whatsapp,
        penilaian:penilaian,
        detail: detail
        
    };
    try {
        const response = await axiosFeedbackInstance.post('', feedbackData);
        console.log("Feedback berhasil dikirim:", response.data);
    } catch (error) {
        console.error("Error saat mengirim feedback:", error);
    }
};

