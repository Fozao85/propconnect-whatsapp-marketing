const localtunnel = require('localtunnel');

async function createTunnel() {
  console.log('🔄 Creating tunnel...');
  
  try {
    const tunnel = await localtunnel({ 
      port: 3000,
      local_host: '127.0.0.1'
    });

    console.log('🎉 Tunnel created successfully!');
    console.log('🌐 Your tunnel URL is:', tunnel.url);
    console.log('📡 Webhook URL for WhatsApp:', tunnel.url + '/api/webhook');
    console.log('');
    console.log('🔗 Copy this webhook URL to Meta Developer Console:');
    console.log('   ' + tunnel.url + '/api/webhook');
    console.log('');
    console.log('✅ Tunnel is ready! Keep this running...');

    // Update .env file
    const fs = require('fs');
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /WEBHOOK_URL=.*/,
      `WEBHOOK_URL=${tunnel.url}/api/webhook`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Updated .env file with new webhook URL');

    tunnel.on('close', () => {
      console.log('❌ Tunnel closed');
      process.exit(1);
    });

    tunnel.on('error', (err) => {
      console.error('❌ Tunnel error:', err.message);
      process.exit(1);
    });

    // Keep running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Error creating tunnel:', error.message);
    console.log('');
    console.log('🔄 Trying alternative approach...');
    
    // Try with different options
    try {
      const tunnel2 = await localtunnel({ 
        port: 3000,
        host: 'https://localtunnel.me'
      });
      
      console.log('🎉 Alternative tunnel created!');
      console.log('🌐 Your tunnel URL is:', tunnel2.url);
      console.log('📡 Webhook URL:', tunnel2.url + '/api/webhook');
      
    } catch (error2) {
      console.error('❌ Alternative tunnel also failed:', error2.message);
      console.log('');
      console.log('💡 Suggestions:');
      console.log('1. Check if port 3000 is accessible');
      console.log('2. Try disabling firewall temporarily');
      console.log('3. Use ngrok instead');
    }
  }
}

createTunnel();
