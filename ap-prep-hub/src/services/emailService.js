/**
 * Email Service for sending feedback emails using EmailJS
 * 
 * To set up EmailJS:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a new service (Gmail, Outlook, etc.)
 * 3. Create an email template with the following variables:
 *    - {{feedback_type}}
 *    - {{feedback_title}}
 *    - {{feedback_message}}
 *    - {{user_name}}
 *    - {{user_email}}
 *    - {{to_email}}
 * 4. Add your credentials to .env file:
 *    - REACT_APP_EMAILJS_SERVICE_ID
 *    - REACT_APP_EMAILJS_TEMPLATE_ID
 *    - REACT_APP_EMAILJS_PUBLIC_KEY
 */

import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    this.templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    this.publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    
    // Check if we have demo keys (indicating EmailJS is not properly configured)
    const isDemoConfig = this.serviceId?.includes('demo') || 
                        this.templateId?.includes('demo') || 
                        this.publicKey?.includes('demo');
    
    this.isConfigured = this.serviceId && this.templateId && this.publicKey && !isDemoConfig;
    
    // Simple logging
    console.log('🔧 EmailJS Configuration:', {
      isConfigured: this.isConfigured,
      isDemoMode: isDemoConfig
    });
  }

  /**
   * Test EmailJS configuration with minimal data
   */
  async testConfiguration() {
    if (!this.isConfigured) {
      console.log('❌ EmailJS not fully configured');
      return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
      // Test with minimal data that matches your template
      const testParams = {
        feedback_type: 'Test',
        feedback_title: 'EmailJS Configuration Test',
        feedback_message: 'This is a test message to verify EmailJS is working.',
        user_name: 'Test User',
        user_email: 'test@example.com',
        to_name: 'Apex Scholar Team',
        to_email: 'anvithpothula@gmail.com',
        subject: 'EmailJS Test',
        timestamp: new Date().toLocaleString(),
        user_id: 'test-user-id'
      };
      
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams,
        this.publicKey
      );
      
      console.log('✅ Test email sent successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send feedback email
   * @param {Object} feedbackData - The feedback data
   * @param {string} feedbackData.feedbackType - Type of feedback (bug, suggestion, etc.)
   * @param {string} feedbackData.title - Feedback title
   * @param {string} feedbackData.message - Feedback message
   * @param {Object} user - User object
   * @returns {Promise} - EmailJS promise
   */
  async sendFeedback({ feedbackType, title, message }, user) {
    if (!this.isConfigured) {
      console.warn('📧 EmailJS not configured. Running in demo mode.');
      
      // For demo purposes, simulate email sending
      await this.simulateEmailSending({ feedbackType, title, message }, user);
      return { success: true, demo: true };
    }

    // Map feedbackType to readable label
    const feedbackTypeLabels = {
      'bug': 'Bug/Issue',
      'suggestion': 'Suggestion',
      'feature': 'Feature Request',
      'general': 'General Feedback',
      'other': 'Other'
    };

    const templateParams = {
      feedback_type: feedbackTypeLabels[feedbackType] || feedbackType,
      feedback_title: title,
      feedback_message: message,
      user_name: user?.displayName || user?.fullName || user?.full_name || 'Anonymous User',
      user_email: user?.email || 'No email provided',
      to_name: 'Apex Scholar Team',
      to_email: 'anvithpothula@gmail.com',
      subject: `Apex Scholar Feedback - ${title}`,
      // Add timestamp for better tracking
      timestamp: new Date().toLocaleString(),
      // Add user ID if available
      user_id: user?.uid || 'N/A'
    };

    try {
      console.log('📧 Sending feedback email...');

      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('✅ Feedback email sent successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send feedback email:', error.message);
      
      // If EmailJS fails, fall back to demo mode
      console.log('📧 Falling back to demo mode due to EmailJS error');
      await this.simulateEmailSending({ feedbackType, title, message }, user);
      return { success: true, demo: true, fallback: true, error: error.message };
    }
  }

  /**
   * Simulate email sending for demo purposes
   */
  async simulateEmailSending({ feedbackType, title, message }, user) {
    const emailData = {
      to: 'anvithpothula@gmail.com',
      subject: `Apex Scholar Feedback - ${title}`,
      body: `
Feedback Type: ${feedbackType}

Title: ${title}

Message:
${message}

---
User Information:
Name: ${user?.displayName || user?.fullName || user?.full_name || 'Anonymous User'}
Email: ${user?.email || 'No email provided'}
User ID: ${user?.uid || 'N/A'}
Timestamp: ${new Date().toLocaleString()}
      `
    };

    console.log('📧 Demo: Email would be sent with the following content:');
    console.log('---');
    console.log(`To: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Body: ${emailData.body}`);
    console.log('---');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  /**
   * Create a mailto link as fallback
   */
  createMailtoLink({ feedbackType, title, message }, user) {
    const subject = encodeURIComponent(`Apex Scholar Feedback - ${title}`);
    const body = encodeURIComponent(`
Feedback Type: ${feedbackType}

Message:
${message}

---
User: ${user?.displayName || user?.fullName || user?.full_name || 'Anonymous User'}
Email: ${user?.email || 'No email provided'}
    `.trim());

    return `mailto:anvithpothula@gmail.com?subject=${subject}&body=${body}`;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
