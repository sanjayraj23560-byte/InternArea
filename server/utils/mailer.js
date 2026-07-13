import Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.sender = { name: 'Intern Area', email: 'sanjayraj23560@gmail.com' }; // ← replace with the exact email you verified in Brevo
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully:", data.body?.messageId);
        return true;
    } catch (error) {
        console.error("Brevo Delivery Exception:", error.message);
        return false;
    }
};