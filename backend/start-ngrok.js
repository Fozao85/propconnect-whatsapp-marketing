const ngrok = require('ngrok');

async function startNgrokTunnel() {
  console.log('🔄 Starting ngrok tunnel...');

  try {
    console.log('🔑 Configuring auth token...');
    await ngrok.authtoken('307knrJYrFISNNkEyVzrExWjRgF_x9AjhgTQwYdvEKJW9QFx');
    console.log('✅ Auth token configured');

    console.log('🌐 Creating tunnel for port 3000...');
    const url = await ngrok.connect(3000);

    console.log('🎉 ngrok tunnel created successfully!');
    console.log('🌐 Your public URL is:', url);
    console.log('📡 Webhook URL for WhatsApp:', url + '/api/webhook');
    console.log('');
    console.log('🔗 Copy this webhook URL to Meta Developer Console:');
    console.log('   ' + url + '/api/webhook');
    console.log('');
    console.log('✅ Tunnel is ready! Keep this running...');

    // Update environment file
    const fs = require('fs');
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /WEBHOOK_URL=.*/,
      `WEBHOOK_URL=${url}/api/webhook`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Updated .env file with new webhook URL');

    // Keep the process running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Error starting ngrok tunnel:', error.message);
    console.error('📋 Full error:', error);
    process.exit(1);
  }
}

startNgrokTunnel();
