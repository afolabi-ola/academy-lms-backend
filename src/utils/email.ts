import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const host =
  process.env.NODE_ENV === 'production'
    ? process.env.EMAIL_HOST_PROD
    : process.env.EMAIL_HOST_DEV;

const port =
  process.env.NODE_ENV === 'production'
    ? process.env.EMAIL_PORT_PROD
    : process.env.EMAIL_PORT_DEV;

const auth =
  process.env.NODE_ENV === 'production'
    ? {
        user: process.env.EMAIL_USER_PROD,
        pass: process.env.EMAIL_PASS_PROD,
      }
    : {
        user: process.env.EMAIL_USER_DEV,
        pass: process.env.EMAIL_PASS_DEV,
      };

const smtpOptions: SMTPTransport.Options =
  process.env.NODE_ENV === 'production'
    ? {
        host,
        port: Number(port),
        auth,
        secure: false, // Use SSL first for production
      }
    : {
        host,
        port: Number(port),
      };

const transporter = nodemailer.createTransport(smtpOptions);

const sendWithRetries = async (
  fn: () => Promise<void>,
  retries = 3,
  delay = 2000,
): Promise<void> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Email sending failed. Retrying in ${delay}ms... (${retries} retries left)`,
      );
      await new Promise((res) => setTimeout(res, delay));
      return sendWithRetries(fn, retries - 1, delay * 2); // Exponential backoff
    } else {
      console.error('All email sending attempts failed:', error);
      throw error; // Rethrow the error after exhausting retries
    }
  }
};

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM_PROD || process.env.EMAIL_FROM_DEV,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
