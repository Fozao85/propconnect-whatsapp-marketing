/**
 * Environment Configuration Manager
 * Handles secure credential management and validation
 */

const fs = require('fs').promises;
const path = require('path');

class EnvironmentManager {
  constructor() {
    this.envPath = path.join(__dirname, '../.env');
    this.requiredVars = [
      'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'JWT_SECRET', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID',
      'META_APP_ID', 'META_APP_SECRET', 'WHATSAPP_WEBHOOK_VERIFY_TOKEN'
    ];
  }

  /**
   * Validate all required environment variables
   */
  async validateEnvironment() {
    const missing = [];
    const warnings = [];

    for (const varName of this.requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        missing.push(varName);
      } else if (this.isDefaultValue(varName, value)) {
        warnings.push(varName);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      warnings,
      summary: this.getEnvironmentSummary()
    };
  }

  /**
   * Check if a value is a default/placeholder value
   */
  isDefaultValue(varName, value) {
    const defaultPatterns = [
      'your_', 'placeholder', 'change_me', 'update_this',
      'example', 'demo', 'test_token', 'fake_'
    ];

    return defaultPatterns.some(pattern => 
      value.toLowerCase().includes(pattern)
    );
  }

  /**
   * Get environment summary for debugging
   */
  getEnvironmentSummary() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'propconnect',
        user: process.env.DB_USER || 'postgres'
      },
      whatsapp: {
        hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        tokenLength: process.env.WHATSAPP_ACCESS_TOKEN?.length || 0,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'not_set',
        webhookToken: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
      },
      meta: {
        appId: process.env.META_APP_ID || 'not_set',
        hasSecret: !!process.env.META_APP_SECRET
      }
    };
  }

  /**
   * Update environment variable in .env file
   */
  async updateEnvVar(varName, newValue) {
    try {
      let envContent = await fs.readFile(this.envPath, 'utf8');
      
      const regex = new RegExp(`^${varName}=.*$`, 'm');
      
      if (regex.test(envContent)) {
        // Update existing variable
        envContent = envContent.replace(regex, `${varName}=${newValue}`);
      } else {
        // Add new variable
        envContent += `\n${varName}=${newValue}`;
      }
      
      await fs.writeFile(this.envPath, envContent);
      
      // Update process.env
      process.env[varName] = newValue;
      
      console.log(`✅ Updated ${varName} in environment`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to update ${varName}:`, error.message);
      return false;
    }
  }

  /**
   * Generate secure random JWT secret
   */
  generateJWTSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Setup development environment with secure defaults
   */
  async setupDevelopmentEnv() {
    console.log('🔧 Setting up development environment...');
    
    const updates = [];
    
    // Generate secure JWT secret if using default
    if (this.isDefaultValue('JWT_SECRET', process.env.JWT_SECRET)) {
      const newSecret = this.generateJWTSecret();
      await this.updateEnvVar('JWT_SECRET', newSecret);
      updates.push('JWT_SECRET');
    }

    // Set development-specific settings
    await this.updateEnvVar('NODE_ENV', 'development');
    await this.updateEnvVar('DEBUG_WHATSAPP', 'true');
    await this.updateEnvVar('ENABLE_MESSAGE_LOGGING', 'true');
    
    console.log(`✅ Development environment configured`);
    if (updates.length > 0) {
      console.log(`🔐 Updated security settings: ${updates.join(', ')}`);
    }
    
    return updates;
  }

  /**
   * Check WhatsApp token health
   */
  async checkWhatsAppHealth() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !phoneId) {
      return {
        status: 'missing_credentials',
        message: 'WhatsApp credentials not configured'
      };
    }

    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${phoneId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );

      await this.updateEnvVar('WHATSAPP_TOKEN_STATUS', 'VALID');
      await this.updateEnvVar('WHATSAPP_TOKEN_LAST_CHECK', new Date().toISOString());

      return {
        status: 'valid',
        message: 'WhatsApp credentials are working',
        phoneInfo: {
          id: response.data.id,
          displayNumber: response.data.display_phone_number,
          verifiedName: response.data.verified_name
        }
      };

    } catch (error) {
      await this.updateEnvVar('WHATSAPP_TOKEN_STATUS', 'EXPIRED');
      
      return {
        status: 'expired',
        message: 'WhatsApp token has expired',
        error: error.response?.data || error.message,
        refreshInstructions: [
          '1. Go to Meta Developer Console',
          '2. Navigate to your PropConnect app',
          '3. Go to WhatsApp > Getting Started',
          '4. Copy the new Access Token',
          '5. Update WHATSAPP_ACCESS_TOKEN in .env file',
          '6. Restart the server'
        ]
      };
    }
  }

  /**
   * Print environment status report
   */
  async printStatusReport() {
    console.log('\n🔍 ENVIRONMENT STATUS REPORT');
    console.log('================================');
    
    const validation = await this.validateEnvironment();
    const whatsappHealth = await this.checkWhatsAppHealth();
    
    // Environment validation
    if (validation.isValid) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log('❌ Missing required environment variables:');
      validation.missing.forEach(var => console.log(`   - ${var}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('⚠️  Variables using default values:');
      validation.warnings.forEach(var => console.log(`   - ${var}`));
    }
    
    // WhatsApp status
    console.log('\n📱 WhatsApp Integration Status:');
    console.log(`   Status: ${whatsappHealth.status.toUpperCase()}`);
    console.log(`   Message: ${whatsappHealth.message}`);
    
    if (whatsappHealth.phoneInfo) {
      console.log(`   Phone: ${whatsappHealth.phoneInfo.displayNumber}`);
      console.log(`   Business: ${whatsappHealth.phoneInfo.verifiedName}`);
    }
    
    // Database status
    console.log('\n🗄️  Database Configuration:');
    const dbSummary = validation.summary.database;
    console.log(`   Host: ${dbSummary.host}:${dbSummary.port}`);
    console.log(`   Database: ${dbSummary.name}`);
    console.log(`   User: ${dbSummary.user}`);
    
    console.log('\n================================\n');
    
    return {
      validation,
      whatsappHealth,
      recommendations: this.getRecommendations(validation, whatsappHealth)
    };
  }

  /**
   * Get recommendations based on current status
   */
  getRecommendations(validation, whatsappHealth) {
    const recommendations = [];
    
    if (!validation.isValid) {
      recommendations.push('Configure missing environment variables');
    }
    
    if (validation.warnings.length > 0) {
      recommendations.push('Update default values with real credentials');
    }
    
    if (whatsappHealth.status === 'expired') {
      recommendations.push('Refresh WhatsApp access token');
    }
    
    if (whatsappHealth.status === 'missing_credentials') {
      recommendations.push('Set up WhatsApp Business API credentials');
    }
    
    return recommendations;
  }
}

module.exports = EnvironmentManager;
