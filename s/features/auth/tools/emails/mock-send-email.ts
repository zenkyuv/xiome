
import {SendEmail} from "../../types/send-email"

export const sendEmail: SendEmail = async email => console.log(`

====== EMAIL ======
to: ${email.to}
subject: ${email.subject}
time: ${new Date().toLocaleString()}

${email.body}

===================

`)
