/* eslint-disable no-console */
import { ICustomWorld } from './custom-world';
import { config } from './config';
// import { generateMsTeamsStepsAndSaveToFile, generatePipelineReport } from '../utils/_shared/Logic';
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
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

let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
const tracesDir = 'traces';

declare global {
  // eslint-disable-next-line no-var
  let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
}

// Set to a high value because a full step can take more than 1 minute;
setDefaultTimeout(process.env.PWDEBUG ? -1 : 10 * 60 * 1000);

let stepLog = [];
const scenariosLog = [];

AfterStep(async function ({ pickleStep, result }) {
  const stepObj = {
    name: pickleStep.text,
    status: result.status
  };
  stepLog.push(stepObj);
});

BeforeAll(async function () {
  switch (config.browser) {
    case 'firefox':
      browser = await firefox.launch(config.browserOptions);
      break;
    case 'webkit':
      browser = await webkit.launch(config.browserOptions);
      break;
    default:
      browser = await chromium.launch(config.browserOptions);
  }
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
  this.envName = process.env.DOPPLER_ENVIRONMENT;
  this.startTime = new Date();
  this.testName = pickle.name.replace(/\W/g, '-');
  // customize the [browser context](https://playwright.dev/docs/next/api/class-browser#browsernewcontextoptions)
  const videosPath = `temp/recordings/${this.testName}`;
  this.context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    acceptDownloads: true,
    recordVideo: process.env.PWVIDEO ? { dir: videosPath } : undefined,
    viewport: { width: 1200, height: 800 }
  });
  // await this.context.route('**/*', (route) => {
  //   route.continue();
  // });
  this.server = await request.newContext({
    // All requests we send go to this API endpoint.
    // baseURL: import.meta.env.BACKEND_URL
  });

  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.page.on('console', async (msg: ConsoleMessage) => {
    if (msg.type() === 'log') {
      await this.attach(msg.text());
    }
  });

  // Block requests
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

    if (result.status !== Status.PASSED) {
      const image = await this.page.screenshot({ fullPage: true });
      imageString = image.toString('base64');
      // Replace : with _ because colons aren't allowed in Windows paths
      const timePart = this.startTime?.toISOString().split('.')[0].replaceAll(':', '_');

      image && (await this.attach(image, 'image/png'));
      await this.context?.tracing.stop({
        path: `${tracesDir}/${this.testName}-${timePart}trace.zip`
      });
    }
  }
  // add scenario to log
  const thisScenario = {
    status: result.status,
    name: `${gherkinDocument.feature.name} | ${pickle.name}`,
    attachments: this.attachments,
    stepLog,
    imageString
  };
  scenariosLog.push(thisScenario);
  // reset variables
  this.attachments = {};
  stepLog = [];
  imageString = null;
  await this.page.close();
  await this.context?.close();
});

AfterAll(async function () {
  console.log(scenariosLog);
  // generatePipelineReport(scenariosLog);
  // generateMsTeamsStepsAndSaveToFile(scenariosLog);
  await browser.close();
});
