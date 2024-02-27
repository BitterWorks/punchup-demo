/* eslint-disable no-console */
import * as log4js from 'log4js';
import axios, { AxiosResponse } from 'axios';
import { createTransport } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

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

export async function msTeamsMsg(webhookUri: string, body: any) {
  const msgBody = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.0',
          ...body
        }
      }
    ]
  };
  try {
    const response: AxiosResponse = await axios.post(webhookUri, msgBody, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    console.log('MS Teams API response:', JSON.stringify(response));
  } catch (error: any) {
    console.error('Error sending message to MS Teams:', error.message);
  }
}

export function getAttachmentsPathsFromFolder(folderPath: string) {
  const attachments: { filename: string; path: string }[] = [];

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      attachments.push({
        filename: file,
        path: filePath
      });
    }
  } catch (error) {
    console.error('Error reading attachments folder:', error);
  }

  return attachments;
}

export async function sendEmail(
  params: {
    from?: string;
    to?: number;
    subject?: string;
  } = {},
  testRunId: string
): Promise<void> {
  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'lucas.miguel@southerncode.us',
      pass: 'ijtnjjtrngaxrhrj'
    }
  });

  const recipients = ['grace.batumbya@eztaxreturn.com', 'lucasmiguelmac@gmail.com'];

  const { from, to, subject } = params;
  const messageOptions = {
    from: from ?? 'Automation Results <lucas.miguel@eztaxreturn.com>', // Replace with the sender's email address
    to: to ?? recipients.join(','),
    subject: subject ?? 'Healthcheck [Working]',
    html: fs.readFileSync(`temp/${testRunId}/pipeline_report.html`, 'utf-8')
    // attachments:
    //   'temp/recordings/Can-login-with-valid-credentials/0b0e5cb526e0500538298b7463014fa8.webm'
    // attachments: getAttachmentsPathsFromFolder('temp/recordings')
  };

  try {
    const info = await transporter.sendMail(messageOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export function readJsonFile(filename) {
  // Read the JSON file
  const jsonData = fs.readFileSync(filename, 'utf8');

  // Parse the JSON data into JavaScript objects
  const data = JSON.parse(jsonData);

  return data;
}

export function generateTeamsMsgBodyFromReport(report) {
  let summary = 'Tests passed';
  const body: { type: string; text: string }[] = []; // Explicitly define the type

  // Check if any scenario failed
  if (report.status !== 'PASSED') {
    summary = 'Tests failed';
  }

  // Iterate through scenarios
  for (const scenario of report.scenarios) {
    // Determine emoji and status text based on scenario status
    let emoji = '✅';
    let statusText = '**PASSED**';
    if (scenario.status !== 'PASSED') {
      emoji = '❌';
      statusText = '**FAILED**';
    }

    // Construct text for the scenario
    const scenarioText = `${emoji} ${statusText} [${scenario.name}](${scenario.url})`;

    // Push TextBlock object to the body array
    body.push({
      type: 'TextBlock',
      text: scenarioText
    });
  }

  return { summary, body };
}
