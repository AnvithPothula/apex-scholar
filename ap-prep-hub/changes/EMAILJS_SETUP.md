# EmailJS Setup for Feedback System

This document explains how to configure EmailJS to enable real email sending for the feedback system.

## Current State

The feedback system is currently in **demo mode**. When users submit feedback, it logs the email content to the console instead of sending actual emails.

## Setting Up EmailJS

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Confirm your email address

### Step 2: Create an Email Service
1. In your EmailJS dashboard, click **"Add New Service"**
2. Choose your email provider (Gmail, Outlook, etc.)
3. Follow the setup instructions for your provider
4. Note down the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Click **"Create New Template"**
2. Use the following template variables:
   ```
   Subject: {{subject}}
   
   Feedback Type: {{feedback_type}}
   Title: {{feedback_title}}
   
   Message:
   {{feedback_message}}
   
   ---
   User Information:
   Name: {{user_name}}
   Email: {{user_email}}
   User ID: {{user_id}}
   Timestamp: {{timestamp}}
   ```
3. Set the **To Email** field to: `anvithpothula@gmail.com`
4. Note down the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** > **General**
2. Copy your **Public Key** (e.g., `user_abcdef123456`)

### Step 5: Update Environment Variables
Add the following to your `.env` file:

```bash
# EmailJS Configuration
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace the placeholder values with your actual EmailJS credentials.

### Step 6: Restart Development Server
```bash
npm start
```

## Testing

1. Click on your profile avatar
2. Select **"Feedback"**
3. Fill out the form and submit
4. Check that you receive the email at `anvithpothula@gmail.com`

## Email Template Example

Here's what the received email will look like:

```
Subject: Apex Scholar Feedback - [User's Title]

Feedback Type: Bug/Issue
Title: App crashes when clicking submit

Message:
When I try to submit my feedback, the app crashes and I get an error message.

---
User Information:
Name: John Doe
Email: john.doe@example.com
User ID: abc123xyz
Timestamp: 8/26/2025, 3:45:23 PM
```

## Troubleshooting

### Common Issues

1. **"Failed to send feedback"**
   - Check that all environment variables are set correctly
   - Verify your EmailJS service is active
   - Check the browser console for detailed error messages

2. **Emails not being received**
   - Check spam/junk folder
   - Verify the template's "To Email" field is set correctly
   - Test with EmailJS's test feature in their dashboard

3. **CORS errors**
   - Make sure you're using the correct public key
   - Check that your EmailJS service allows requests from your domain

### Rate Limits

EmailJS free plan includes:
- 200 emails per month
- 50 emails per day

For production use, consider upgrading to a paid plan.

## Security Notes

- Never commit real EmailJS credentials to version control
- Keep your environment variables secure
- Consider adding rate limiting to prevent spam
- Monitor email usage in your EmailJS dashboard

## Future Enhancements

Consider adding:
- Email templates for different feedback types
- Auto-replies to users confirming receipt
- Integration with a ticketing system
- Feedback analytics and reporting
