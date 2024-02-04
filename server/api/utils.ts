import * as log4js from 'log4js';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';

log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    file: { type: 'file', filename: 'logs/out.log' }
  },
  categories: {
    default: { appenders: ['stdout', 'file'], level: 'info' }
  }
});

export const logger = log4js.getLogger();

export const readLog = (): string => {
  try {
    const log = fs.readFileSync('logs/out.log', 'utf8');
    return log;
  } catch (error: any) {
    logger.error(error);
    return error.message;
  }
};

export async function msTeamsMsg(text: string) {
  const webhookUri =
    'https://eztaxreturn.webhook.office.com/webhookb2/cecd0f01-c5ce-4980-bc61-0c1a7e4a9357@1bfff74d-1f77-4ee7-a4ed-10edd5c6103b/IncomingWebhook/a4a5dd9e2b064088a2236659a1258cef/d42695cd-d0b7-4d65-b131-71d13032b06d';
  const body = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    summary: 'Cron job results',
    themeColor: '0076D7',
    text
  };
  try {
    const response: AxiosResponse = await axios.post(webhookUri, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('MS Teams API response:', JSON.stringify(response));
  } catch (error: any) {
    console.error('Error sending message to MS Teams:', error.message);
  }
}

// export async function sendEmail(): Promise<void> {
//   const transporter = createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.GMAILBOX_USERNAME || '', // Use environment variables for security
//       pass: process.env.GMAILBOX_PASSWORD || ''
//     }
//   });

//   const recipients = ['lucas.miguel@eztaxreturn.com', 'lucasmiguelmac@gmail.com'];

//   const messageOptions = {
//     from: 'Automation Results <your-email@gmail.com>', // Replace with the sender's email address
//     to: recipients.join(','),
//     subject: 'Github Actions job result',
//     html: fs.readFileSync('temp/pipeline_report.html', 'utf-8'),
//     attachments: [
//       {
//         filename: 'attachment1.pdf',
//         path: 'temp/attachments/attachment1.pdf'
//       }
//       // Add more attachments as needed
//     ]
//   };

//   try {
//     const info = await transporter.sendMail(messageOptions);
//     console.log('Email sent:', info.messageId);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// }
