export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const { event, trackingCode, answer } = request.body || {}
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return response.status(500).json({ ok: false, error: 'Telegram belum dikonfigurasi' })
    }

    const labels = {
      tracking_lookup: 'Pengecekan tracking baru',
      survey_answer: 'Jawaban survei baru',
    }
    const lines = [`<b>${labels[event] || 'Aktivitas baru'}</b>`]
    if (trackingCode) lines.push(`Kode resi: <code>${escapeHtml(trackingCode)}</code>`)
    if (answer) lines.push(`Jawaban: ${escapeHtml(answer)}`)
    lines.push(`Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`)

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML' }),
    })

    if (!telegramResponse.ok) {
      return response.status(502).json({ ok: false, error: 'Telegram menolak pesan' })
    }

    return response.status(200).json({ ok: true })
  } catch {
    return response.status(500).json({ ok: false, error: 'Gagal mengirim notifikasi' })
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character])
}
