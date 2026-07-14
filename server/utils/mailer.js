import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export const sendEmail = async (to, subject, html) => {
    try {
        const data = await brevo.transactionalEmails.sendTransacEmail({
            subject,
            htmlContent: html,
            sender: { name: 'Intern Area', email: 'sanjayraj23560@gmail.com' },
            to: [{ email: to }],
        });

        console.log("Email sent successfully:", data.messageId);
        return true;
    } catch (error) {
        console.error("Brevo Delivery Exception:", error.message);
        return false;
    }
};