
import {SendEmail} from "../../types/emails/send-email.js"

export const mockSendEmail: SendEmail = async email => console.log(`

====== EMAIL ======
to: ${email.to}
subject: ${email.subject}
time: ${new Date().toLocaleString()}

${email.body}

===================

`)