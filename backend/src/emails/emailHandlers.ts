import { resendClient, sender } from '../lib/resend.ts';
import {
  createWelcomeEmailTemplate,
  resetPasswordEmailTemplate,
} from './emailTemplate.ts';

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  clientURL: string | undefined
) => {
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

export const sendForgotPasswordEmail = async (
  name: string,
  email: string,
  resetUrl: string
) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: 'Quickchat - Forgot your Password?',
    html: resetPasswordEmailTemplate(name, resetUrl),
  });
};
