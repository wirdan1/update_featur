import moment from 'moment-timezone';

const timeZone = 'Asia/Jakarta';

export const handler = async (m, { command, args, isOwner, isAdmin }) => {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup.');
    if (!(isAdmin || isOwner)) return m.reply('Perintah ini hanya bisa digunakan oleh admin grup.');

    if (command === 'aktif' && args[0] === 'closegc') {
        if (args.length < 2) return m.reply(`Format salah! Gunakan: ${command} <jam tutup>|<jam buka>\nContoh: ${command} 21|5`);
        
        let [closeTime, openTime] = args[1].split('|').map(Number);
        if (isNaN(closeTime) || isNaN(openTime)) return m.reply('Jam tutup dan buka harus berupa angka.');
        
        chat.autoGc = { closeTime, openTime };
        m.reply(`Auto group close/open diaktifkan. Grup akan tutup pukul ${closeTime}:00 dan buka pukul ${openTime}:00.`);
    } else if (command === 'mati' && args[0] === 'closegc') {
        delete chat.autoGc;
        m.reply('Auto group close/open dinonaktifkan.');
    }
};

handler.command = /^(aktif|mati)$/i;
handler.help = ['aktif closegc <jam tutup>|<jam buka>', 'mati closegc'];
handler.tags = ['group'];
handler.admin = true;
handler.group = true;

export default handler;

// Fungsi untuk mengecek status grup
const checkGroupsStatus = async (conn) => {
    const currentHour = moment().tz(timeZone).hour();
    const currentMinute = moment().tz(timeZone).minute();

    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (!chat.autoGc) continue;

        const { closeTime, openTime } = chat.autoGc;
        const closeReminder = (closeTime === 0 ? 23 : closeTime) - 1;
        const openReminder = (openTime === 0 ? 23 : openTime) - 1;

        if (currentHour === closeTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `Pemberitahuan: Grup akan ditutup dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi penutupan grup ${chatId}:`, error);
            }
        }

        if (currentHour === openTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `Pemberitahuan: Grup akan dibuka dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi pembukaan grup ${chatId}:`, error);
            }
        }

        if (currentHour === closeTime && currentMinute === 0 && chat.groupStatus !== 'closed') {
            try {
                await conn.groupSettingUpdate(chatId, 'announcement');
                await conn.sendMessage(chatId, { text: `Grup telah ditutup dan akan dibuka kembali pada pukul ${openTime}:00 WIB.` });
                chat.groupStatus = 'closed';
            } catch (error) {
                console.error(`Gagal menutup grup ${chatId}:`, error);
            }
        }

        if (currentHour === openTime && currentMinute === 0 && chat.groupStatus !== 'opened') {
            try {
                await conn.groupSettingUpdate(chatId, 'not_announcement');
                await conn.sendMessage(chatId, { text: `Grup telah dibuka dan akan ditutup kembali pada pukul ${closeTime}:00 WIB.` });
                chat.groupStatus = 'opened';
            } catch (error) {
                console.error(`Gagal membuka grup ${chatId}:`, error);
            }
        }
    }
};

// Jalankan fungsi setiap 1 menit
const interval = 60000;
setInterval(() => {
    checkGroupsStatus(global.conn);
}, interval);


// v2
import moment from 'moment-timezone';

const timeZone = 'Asia/Jakarta';

export const handler = async (m, { command, args, isOwner, isAdmin }) => {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup.');
    if (!(isAdmin || isOwner)) return m.reply('Perintah ini hanya bisa digunakan oleh admin grup.');

    if (command === 'aktif' && args[0] === 'closegc') {
        if (args.length < 2) return m.reply(`Format salah! Gunakan: ${command} <jam tutup>|<jam buka>\nContoh: ${command} 21|5`);
        
        let [closeTime, openTime] = args[1].split('|').map(Number);
        if (isNaN(closeTime) || isNaN(openTime)) return m.reply('Jam tutup dan buka harus berupa angka.');
        
        chat.autoGc = { closeTime, openTime };
        m.reply(`Auto group close/open diaktifkan. Grup akan tutup pukul ${closeTime}:00 dan buka pukul ${openTime}:00.`);
    } else if (command === 'mati' && args[0] === 'closegc') {
        delete chat.autoGc;
        m.reply('Auto group close/open dinonaktifkan.');
    }
};

handler.command = /^(aktif|mati)$/i;
handler.help = ['aktif closegc <jam tutup>|<jam buka>', 'mati closegc'];
handler.tags = ['group'];
handler.admin = true;
handler.group = true;

export default handler;

// Fungsi untuk mengecek status grup
const checkGroupsStatus = async (conn) => {
    const currentHour = moment().tz(timeZone).hour();
    const currentMinute = moment().tz(timeZone).minute();

    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (!chat.autoGc) continue;

        const { closeTime, openTime } = chat.autoGc;

        // Kirim pengingat 3 menit sebelum grup ditutup
        if (currentHour === closeTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `⚠️ Pemberitahuan: Grup akan ditutup dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi penutupan grup ${chatId}:`, error);
            }
        }

        // Kirim pengingat 3 menit sebelum grup dibuka
        if (currentHour === openTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `⚠️ Pemberitahuan: Grup akan dibuka dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi pembukaan grup ${chatId}:`, error);
            }
        }

        // Tutup grup saat jam tutup
        if (currentHour === closeTime && currentMinute === 0 && chat.groupStatus !== 'closed') {
            try {
                await conn.groupSettingUpdate(chatId, 'announcement');
                await conn.sendMessage(chatId, { text: `🔒 Grup telah ditutup dan akan dibuka kembali pada pukul ${openTime}:00 WIB.` });
                chat.groupStatus = 'closed';
            } catch (error) {
                console.error(`Gagal menutup grup ${chatId}:`, error);
            }
        }

        // Buka grup saat jam buka
        if (currentHour === openTime && currentMinute === 0 && chat.groupStatus !== 'opened') {
            try {
                await conn.groupSettingUpdate(chatId, 'not_announcement');
                await conn.sendMessage(chatId, { text: `🔓 Grup telah dibuka dan akan ditutup kembali pada pukul ${closeTime}:00 WIB.` });
                chat.groupStatus = 'opened';
            } catch (error) {
                console.error(`Gagal membuka grup ${chatId}:`, error);
            }
        }
    }
};

// Jalankan fungsi setiap 1 menit
const interval = 60000;
setInterval(() => {
    checkGroupsStatus(global.conn);
}, interval);


// v3
import moment from 'moment-timezone';

const timeZone = 'Asia/Jakarta';

export const handler = async (m, { command, args, isOwner, isAdmin }) => {
    let chat = global.db.data.chats[m.chat];
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup.');
    if (!(isAdmin || isOwner)) return m.reply('Perintah ini hanya bisa digunakan oleh admin grup.');

    if (command === 'aktif' && args[0] === 'closegc') {
        if (args.length < 2) return m.reply(`Format salah! Gunakan: ${command} <jam tutup>|<jam buka>\nContoh: ${command} 21|5`);
        
        let [closeTime, openTime] = args[1].split('|').map(Number);
        if (isNaN(closeTime) || isNaN(openTime)) return m.reply('Jam tutup dan buka harus berupa angka.');
        
        chat.autoGc = { closeTime, openTime };
        m.reply(`Auto group close/open diaktifkan. Grup akan tutup pukul ${closeTime}:00 dan buka pukul ${openTime}:00.`);
    } else if (command === 'mati' && args[0] === 'closegc') {
        delete chat.autoGc;
        m.reply('Auto group close/open dinonaktifkan.');
    }
};

handler.command = /^(aktif|mati)$/i;
handler.help = ['aktif closegc <jam tutup>|<jam buka>', 'mati closegc'];
handler.tags = ['group'];
handler.admin = true;
handler.group = true;

export default handler;

// Fungsi untuk mengecek status grup
const checkGroupsStatus = async (conn) => {
    const currentHour = moment().tz(timeZone).hour();
    const currentMinute = moment().tz(timeZone).minute();

    for (const chatId of Object.keys(global.db.data.chats)) {
        const chat = global.db.data.chats[chatId];
        if (!chat.autoGc) continue;

        const { closeTime, openTime } = chat.autoGc;

        // Pengingat 3 menit sebelum grup ditutup
        if (currentHour === closeTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `⚠️ Pemberitahuan: Grup akan ditutup dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi penutupan grup ${chatId}:`, error);
            }
        }

        // Pengingat 3 menit sebelum grup dibuka
        if (currentHour === openTime && currentMinute === 57) {
            try {
                await conn.sendMessage(chatId, { text: `⚠️ Pemberitahuan: Grup akan dibuka dalam 3 menit.` });
            } catch (error) {
                console.error(`Gagal mengirim notifikasi pembukaan grup ${chatId}:`, error);
            }
        }

        // Menutup grup saat waktu tutup
        if (currentHour === closeTime && currentMinute === 0 && chat.groupStatus !== 'closed') {
            try {
                await conn.groupSettingUpdate(chatId, 'announcement');
                await conn.sendMessage(chatId, { text: `✅ Grup telah ditutup dan akan dibuka kembali pada pukul ${openTime}:00 WIB.` });
                chat.groupStatus = 'closed';
            } catch (error) {
                console.error(`Gagal menutup grup ${chatId}:`, error);
            }
        }

        // Membuka grup saat waktu buka
        if (currentHour === openTime && currentMinute === 0 && chat.groupStatus !== 'opened') {
            try {
                await conn.groupSettingUpdate(chatId, 'not_announcement');
                await conn.sendMessage(chatId, { text: `✅ Grup telah dibuka dan akan ditutup kembali pada pukul ${closeTime}:00 WIB.` });
                chat.groupStatus = 'opened';
            } catch (error) {
                console.error(`Gagal membuka grup ${chatId}:`, error);
            }
        }
    }
};

// Jalankan fungsi setiap 1 menit
const interval = 60000;
setInterval(() => {
    checkGroupsStatus(global.conn);
}, interval);
