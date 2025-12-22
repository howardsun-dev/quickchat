import { resendClient, sender } from '../lib/resend.ts';
import { createWelcomeEmailTemplate } from './emailTemplate.ts';

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Welcome to Quickchat!',
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error('Error sending welcome email', error);
    throw new Error('Failed to send welcome email');
  }

  console.log('Welcome email sent successfully', data);
};
