/* eslint-disable no-console */
import { ICustomWorld } from './custom-world';
import { config } from './config';
import { getEstTime, getLTBuildUrl, getLTTestUrl, saveToJsonFile } from './utils';
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  // Status,
  setDefaultTimeout,
  AfterStep
} from '@cucumber/cucumber';
import {
  chromium,
  ChromiumBrowser,
  firefox,
  FirefoxBrowser,
  webkit,
  WebKitBrowser,
  ConsoleMessage,
  request
} from '@playwright/test';
import { ITestCaseHookParameter } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { ensureDir } from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
// import cp from 'child_process';

let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
const tracesDir = 'traces';
let testRunId: string;

declare global {
  // eslint-disable-next-line no-var
  let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
}

// Set to a high value because a full step can take more than 1 minute;
setDefaultTimeout(process.env.PWDEBUG ? -1 : 30 * 1000);

type ScenarioType = {
  status: string;
  name: string;
  attachments: string;
  stepLog: { name: string; status: string }[];
  imageString?: string;
  testId?: string;
  url?: string;
};

type JsonReportType = {
  buildName: string;
  scenarios: ScenarioType[];
  buildId?: string;
  url?: string;
  status?: 'PASSED' | 'FAILED';
};

let failedScenariosCount = 0;
let stepLog = [];
const scenariosLog = [];
const buildName: string = getEstTime();
const jsonReport: JsonReportType = {
  buildName,
  scenarios: []
};

AfterStep(async function ({ pickleStep, result }) {
  const stepObj = {
    name: pickleStep.text,
    status: result.status
  };
  stepLog.push(stepObj);
});

BeforeAll(async function () {
  // Set test run ID
  testRunId = process.env.RUN_ID ?? uuidv4();

  // Set browser
  switch (config.browser) {
    case 'firefox':
      browser = await firefox.launch(config.browserOptions);
      break;
    case 'webkit':
      browser = await webkit.launch(config.browserOptions);
      break;
    // Chromium
    default:
      if (config.browser !== 'LT') {
        browser = await chromium.launch(config.browserOptions);
      }
  }

  // Ensured traces dir
  await ensureDir(tracesDir);
});

Before({ tags: '@ignore' }, async function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return 'skipped';
});

Before({ tags: '@debug' }, async function (this: ICustomWorld) {
  this.debug = true;
});

Before(async function (this: ICustomWorld, { pickle }: ITestCaseHookParameter) {
  // console.log(process.env);
  if (config.browser === 'LT') {
    // const playwrightClientVersion = cp
    //   .execSync('npx playwright --version')
    //   .toString()
    //   .trim()
    //   .split(' ')[1];
    const capabilities = {
      browserName: 'Chrome', // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
      browserVersion: 'latest',
      'LT:Options': {
        platform: 'Windows 11',
        build: buildName,
        name: pickle.name,
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        network: true,
        video: true,
        console: true,
        tunnel: false // Add tunnel configuration if testing locally hosted webpage
        // tunnelName: '', // Optional,
        // geoLocation: 'US',
        // idleTimeout: 300,
        // playwrightClientVersion
      }
    };
    browser = await chromium.connect({
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
        JSON.stringify(capabilities)
      )}`
    });
  }

  // Set test run variables
  this.testRunId = testRunId;
  this.startTime = new Date();
  this.testSlug = pickle.name.replace(/\W/g, '-');
  // customize the [browser context](https://playwright.dev/docs/next/api/class-browser#browsernewcontextoptions)
  const videosPath = `temp/${testRunId}/recordings/${this.testSlug}`;
  this.context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    acceptDownloads: true,
    recordVideo: process.env.PWVIDEO && config.browser !== 'LT' ? { dir: videosPath } : undefined,
    viewport: config.browser === 'LT' ? { width: 1920, height: 1080 } : { width: 1200, height: 800 }
  });
  // await this.context.route('**/*', (route) => {
  //   route.continue();
  // });
  this.server = await request.newContext({
    // All requests we send go to this API endpoint.
    // baseURL: import.meta.env.BACKEND_URL
  });

  //
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.page.on('console', async (msg: ConsoleMessage) => {
    if (msg.type() === 'log') {
      await this.attach(msg.text());
    }
  });

  if (config.browser === 'LT') {
    // Get LambdaTest test ID
    const rawResponse = await this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-empty-function, prettier/prettier, @typescript-eslint/no-unused-vars
      (_) => {},
      // eslint-disable-next-line prettier/prettier
      `lambdatest_action: ${JSON.stringify({ action: 'getTestDetails' })}`
    );
    const formattedResponse = JSON.parse(rawResponse as unknown as string);
    jsonReport['buildId'] = formattedResponse['data']['build_id'];
  } else {
    // Block slowing non-key requests
    const domainBlacklist = [
      'seal.digicert.com',
      'bat.bing.com',
      'fonts.gstatic.com',
      'dev.visualwebsiteoptimizer.com',
      'connect.facebook.net',
      'www.google.com.ar',
      'www.googletagmanager.com',
      'www.google-analytics.com',
      'www.fonts.gstatic.com',
      'www.tags.srv.stackadapt.com',
      'www.googleadservices.com',
      'privacy-policy.truste.com',
      'www.wheelofpopups.com',
      'www.googleoptimize.com',
      'tags.srv.stackadapt.com',
      'fonts.googleapis.com'
    ];
    const regexStrings = domainBlacklist.map((domain) => `^https://${domain}.*`);
    const regex = new RegExp(regexStrings.join('|'));
    await this.page.route(regex, (route) => {
      route.abort();
    });
  }
  // Set debug logs
  if (process.env.PWDEBUG) {
    this.page.on('response', async (resp) => {
      const strStatus = resp.status().toString();
      if (strStatus.startsWith('2')) {
        console.log('\x1b[36m%s\x1b[0m', resp.url());
      } else if (strStatus.startsWith('3')) {
        console.log('\x1b[33m%s\x1b[0m', resp.url());
      } else {
        console.error('\x1b[31m%s\x1b[0m', resp.url());
      }
    });
  }
  this.feature = pickle;
});

After(async function (
  this: ICustomWorld,
  { result, pickle, gherkinDocument }: ITestCaseHookParameter
) {
  let imageString = null;
  if (result) {
    await this.attach(`Status: ${result?.status}. Duration:${result.duration?.seconds}s`);

    // Take screenshot on failure
    // if (result.status !== Status.PASSED) {
    //   const image = await this.page?.screenshot({ fullPage: true });
    //   if (image) {
    // Get Base64 or deploy to bucket
    //     imageString = image.toString('base64');
    //   }
    // }
  }
  // add scenario to log
  const thisScenario = {
    status: result.status,
    name: `${gherkinDocument.feature.name} | ${pickle.name}`,
    attachments: this.attachments,
    stepLog,
    imageString
  };
  // Set LT-related variables
  if (config.browser === 'LT') {
    // Get LambdaTest testId and recording url
    const rawResponse = await this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-empty-function, prettier/prettier, @typescript-eslint/no-unused-vars
      (_) => {},
      // eslint-disable-next-line prettier/prettier
      `lambdatest_action: ${JSON.stringify({ action: 'getTestDetails' })}`
    );
    const formattedResponse = JSON.parse(rawResponse as unknown as string);
    thisScenario['testId'] = formattedResponse['data']['test_id'];
    thisScenario['url'] = await getLTTestUrl(thisScenario['testId']);
    // Set test as failed in LT
    const testResultStatus = {
      action: 'setTestStatus',
      arguments: { status: result.status.toLowerCase() }
    };
    await this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_) => {
        //
      },
      `lambdatest_action: ${JSON.stringify(testResultStatus)}`
    );
  }
  scenariosLog.push(thisScenario);
  jsonReport['scenarios'] = scenariosLog;
  // reset variables
  this.attachments = {};
  stepLog = [];
  imageString = null;
  await this.page?.close();
  await this.context?.close();
  if (config.browser === 'LT') {
    await browser?.close();
  }
  if (result.status === 'FAILED') {
    failedScenariosCount++;
  }
});

AfterAll(async function () {
  jsonReport['url'] = await getLTBuildUrl(jsonReport['buildId']);
  jsonReport['status'] = failedScenariosCount > 0 ? 'FAILED' : 'PASSED';

  // Save report
  const jsonStepsFilename = `temp/${testRunId}/report.json`;
  saveToJsonFile(jsonStepsFilename, jsonReport);
  await browser?.close();
});
