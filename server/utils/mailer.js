import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.sender = { name: 'Intern Area', email: 'sanjayraj23560@gmail.com' };
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