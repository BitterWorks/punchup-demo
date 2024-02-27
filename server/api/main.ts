import { generateTeamsMsgBodyFromReport, logger, msTeamsMsg, readJsonFile } from './utils';
import { HEALTHCHECK_WEBHOOK } from './conts';
import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  const validApiKey = 'go41!qh2hsoajnlP409-8usqbn123e!@gafsg9h2';

  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // API key is valid, continue to the next middleware
  next();
};

const loggerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  logger.info(req.method, req.url, req.body);
  next();
};
const app = express();
app.use(apiKeyMiddleware);
app.use(express.json());
app.use(loggerMiddleware);
app.get('/', (_req: Request, res: Response) => {
  res.send('ok2');
});

app.post('/', (req: Request, res: Response) => {
  const { body } = req;
  res.json({ message: 'Received POST request!', body });
});

// app.post('/cron', (req: Request, res: Response) => {
//   const testRunId = uuidv4();
//   const { body } = req;
//   logger.info(body);
//   logger.info(testRunId);
//   const paramsString = Object.entries(body)
//     .map(([key, value]) => `${key}="${value}"`)
//     .join(' ');
//   logger.info(paramsString);
//   const command = `RUN_ID=${testRunId} npm run test:stg features/auth/login.feature:6`;
//   logger.info(command);
//   exec(command, (error, stdout) => {
//     logger.info('COMMAND NPM RUN CRON:STG');
//     // logger.info(req);
//     logger.info('----STDOUT----');
//     logger.info(stdout);

//     // Find messages between []
//     const match: RegExpMatchArray | null = stdout.match(/\[\[(.*?)\]\]/);
//     let msg = '';
//     if (match) {
//       msg = match[1];
//     }
//     logger.info('MSG -------- ', msg);
//     if (error) {
//       if (msg === '') {
//         logger.log('Sending MS Teams alert----------');
//         msTeamsMsg({
//           summary: 'Cron job failed',
//           text: 'Test run failed',
//           webhookUri: CRONJOB_WEBHOOK
//         });
//       }
//       logger.error('ERROR -------- ', error);
//       return res.status(503).json({ error: msg || 'Test run failed' });
//     }
//     msTeamsMsg({
//       summary: 'Healthcheck results',
//       text: 'All tests passed',
//       webhookUri: CRONJOB_WEBHOOK
//     });
//     res.status(200).send('Message sent');
//   });
// });

type ScenarioType = {
  status: string;
  name: string;
  attachments: string;
  stepLog: { name: string; status: string }[];
  imageString?: string;
  url: string;
};

type JsonReportType = {
  url: string;
  buildName: string;
  buildId: string;
  scenarios: ScenarioType[];
};

app.post('/healthcheck', (req: Request, res: Response) => {
  const { body } = req;
  logger.info(body);
  const testRunId = uuidv4();
  const command = `BROWSER=LT RUN_ID=${testRunId} npm run healthcheck:prd`;
  logger.info(command);
  exec(command, (_, stdout) => {
    logger.info('----STDOUT----');
    logger.info(stdout);
    const jsonReport: JsonReportType = readJsonFile(`temp/${testRunId}/report.json`);
    const body = generateTeamsMsgBodyFromReport(jsonReport);
    logger.info(body);
    msTeamsMsg(HEALTHCHECK_WEBHOOK, body);
    res.status(200).send('Message sent');
  });
});

app.listen(3005, () => logger.info('Server ready'));
