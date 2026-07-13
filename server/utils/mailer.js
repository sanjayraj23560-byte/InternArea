import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Intern Area <saans.duckdns.org>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend Email Error:", error);
            return false;
        }

        console.log("Email sent successfully:", data.id);
        return true;
    } catch (error) {
        console.error("Resend Delivery Exception:", error.message);
        return false;
    }
};