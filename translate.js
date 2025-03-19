import { translate } from '@vitalets/google-translate-api';

const defaultLang = 'id';

export const handler = async (m, { args, usedPrefix, command }) => {
    if (!args[0] && !m.quoted) {
        throw `*• Contoh Penggunaan* :  \n1. ${usedPrefix}${command} id how are you\n2. Reply pesan lalu ketik: ${usedPrefix}${command} id`;
    }

    let lang = args[0];
    let text = args.slice(1).join('-');

    if ((args[0] || '').length !== 2) {
        if (!m.quoted) {
            throw `*• Gunakan format yang benar!* \n\n1. ${usedPrefix}${command} <kode bahasa>-<teks>\n2. Reply pesan lalu ketik: ${usedPrefix}${command} <kode bahasa>`;
        }
        lang = defaultLang;
        text = args.join('-');
    }

    // Jika pengguna mereply pesan dan hanya memberikan kode bahasa
    if (!text && m.quoted && args[0].length === 2) {
        text = m.quoted.text;
    }

    try {
        let result = await translate(text, { to: lang, autoCorrect: true });
        if (!result) throw 'Terjemahan gagal.';
        
        let response = `*Hasil Terjemahan (${lang.toUpperCase()})*:\n${result.text.toString()}`;
        await m.reply(response);
    } catch (e) {
        throw 'Terjadi kesalahan saat menerjemahkan.';
    }
};

handler.help = ['tr <kode bahasa> <teks>'];
handler.tags = ['tools'];
handler.command = ['translate', 'tl', 'trid', 'tr'];

export default handler;
