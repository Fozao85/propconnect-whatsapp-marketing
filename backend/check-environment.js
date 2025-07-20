/**
 * Environment Health Check Script
 * Run this to verify your PropConnect setup
 */

require('dotenv').config();
const EnvironmentManager = require('./utils/envManager');

async function main() {
  console.log('🚀 PropConnect Environment Health Check');
  console.log('========================================\n');
  
  const envManager = new EnvironmentManager();
  
  try {
    // Setup development environment
    await envManager.setupDevelopmentEnv();
    
    // Print comprehensive status report
    const report = await envManager.printStatusReport();
    
    // Show recommendations
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
    }
    
    // Show next steps based on status
    if (report.whatsappHealth.status === 'expired') {
      console.log('🔄 NEXT STEPS - WhatsApp Token Refresh:');
      report.whatsappHealth.refreshInstructions.forEach((step, index) => {
        console.log(`   ${step}`);
      });
      console.log('\n🔗 Quick Link: https://developers.facebook.com/apps/1401322174311422/whatsapp-business/wa-dev-console/');
    }
    
    if (report.validation.isValid && report.whatsappHealth.status === 'valid') {
      console.log('🎉 SYSTEM STATUS: READY FOR PRODUCTION!');
      console.log('✅ All systems operational');
      console.log('✅ WhatsApp integration working');
      console.log('✅ Database configured');
      console.log('✅ Environment secure');
    } else {
      console.log('⚠️  SYSTEM STATUS: NEEDS ATTENTION');
      console.log('❌ Some components need configuration');
    }
    
  } catch (error) {
    console.error('❌ Environment check failed:', error.message);
    process.exit(1);
  }
}

// Run the check
main().catch(console.error);
