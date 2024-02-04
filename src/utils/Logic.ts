/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable indent */
import { DEFAULT_SCREENSHOT_OPTIONS } from './Consts';
import { IScreenshotOptions } from './Types';
import { CustomWorld, ICustomWorld } from '../support/custom-world';
import { config } from '../support/config';

import { faker } from '@faker-js/faker/locale/en_US';
import resemble from 'resemblejs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { ensureDir, ensureFile, pathExists } from 'fs-extra';
import { writeFileSync, readFileSync, createWriteStream, unlink, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import https from 'https';

/**
 * Extracts number from "nth" strings like  "1st" or "25th"
 *
 * @export
 * @param {string} inputString
 * @return {*}
 */
export function nthToNumber(inputString: string): number {
  // Use a regular expression to match and extract the number
  const match = inputString.match(/\d+/);

  if (match) {
    // Convert the matched string to a number
    return parseInt(match[0], 10);
  } else {
    // Handle cases where no number is found
    throw Error("Couldn't transform nth string into number");
  }
}

interface ImagePathOptions {
  skipOs: boolean;
}

export function getImagePath(
  customWorld: ICustomWorld,
  name: string,
  options?: ImagePathOptions
): string {
  return join(
    'screenshots',
    customWorld.feature?.uri || '',
    options?.skipOs ? '' : process.platform,
    config.browser,
    `${name}.png`
  );
}

export async function saveImage(path: string, image: Buffer) {
  await ensureFile(path);
  writeFileSync(path, image);
}

/**
 * Given a string, returns a slugified version of it
 *
 * @export
 * @param {string} name
 * @return {*}
 */
export function slugify(name: string) {
  return name
    .split(' ')
    .map((text) => text.toLowerCase())
    .join('-');
}

/**
 * Given a `pageName` and a `customWorld`, takes a whole page screenshot for that page
 * and temporarily saves it in `temp/<pageName>`
 *
 * @export
 * @param {ICustomWorld} customWorld
 * @param {string} pageName
 */
export async function saveTempScreenshot(customWorld: ICustomWorld, pageName: string) {
  const imgName = slugify(pageName);
  const fullImagePath = `temp/${imgName}.png`;
  const wholePageScreenshot = await customWorld.page.screenshot();
  await saveImage(fullImagePath, wholePageScreenshot);
}

/**
 * Returns the difference between 2 images
 * @param img1
 * @param img2
 * @param threshold the difference threshold
 */
export function getDifference(
  img1: PNG,
  img2: PNG,
  threshold = config.IMG_THRESHOLD
): { diff: Buffer | undefined; pixelDiff: number } {
  const { width, height } = img2;
  const diff = new PNG({ width, height });
  const difference = pixelmatch(img1.data, img2.data, diff.data, width, height, threshold);
  if (difference > 0) {
    return { diff: PNG.sync.write(diff), pixelDiff: difference };
  }
  return { diff: undefined, pixelDiff: 0 };
}

export async function downloadImage(url: string, fileName: string) {
  const downloadsDir = 'temp/downloads';
  await ensureDir(downloadsDir);
  const command = `curl -o ${downloadsDir}/${fileName} ${url}`;
  execSync(command);
}

export async function bufferImgFromUrl(url: string) {
  return await new Promise<Buffer>((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      response.on('error', (err) => {
        reject(err);
      });
    });
  });
}

export async function getImgsMismatchPercentage(img1: Buffer, img2: Buffer) {
  let misMatchPercentage;
  await resemble(img1)
    .compareTo(img2)
    .scaleToSameSize()
    .onComplete(function (data) {
      misMatchPercentage = parseFloat(data.misMatchPercentage);
    });
  return misMatchPercentage;
}

export function elementSelectorToFileName(selector: string): string {
  // Replace characters that are not allowed in file names with underscores
  const sanitizedSelector = selector.replace(/[^a-zA-Z0-9\-_]/g, '_');

  // You may want to limit the length of the resulting file name
  // if it's too long for your file system
  const maxLength = 255; // Adjust this to your needs
  if (sanitizedSelector.length > maxLength) {
    return sanitizedSelector.slice(0, maxLength);
  }

  return sanitizedSelector;
}

export async function compareToBaseImage(
  customWorld: CustomWorld,
  baseImagePath: string,
  screenshot: Buffer,
  options: IScreenshotOptions = DEFAULT_SCREENSHOT_OPTIONS
) {
  const { threshold, maxPixelDiff, reverse } = { ...DEFAULT_SCREENSHOT_OPTIONS, ...options };
  let baseImage;
  const baseImgExist = await pathExists(baseImagePath);
  if (baseImgExist) {
    baseImage = PNG.sync.read(readFileSync(baseImagePath));
  } else {
    await saveImage(baseImagePath, screenshot);
    customWorld.log(
      `The base Image doesn't exist, a screenshot was taken to ${baseImagePath} so it can be used for next run`
    );
    return;
  }
  const img1 = PNG.sync.read(screenshot);
  const { diff, pixelDiff } = getDifference(img1, baseImage, { threshold });
  if (diff && pixelDiff > maxPixelDiff) {
    await customWorld.attach(diff, 'image/png;base64');
    if (!reverse) {
      throw new Error(`Screenshot does not match : ${baseImagePath} \n DIFF: ${pixelDiff} pixels`);
    }
  }
}

export function getFakerValue(type: string): string {
  const fakerMap = {
    name: 'name.firstName',
    'last name': 'name.lastName',
    'phone number': 'phone.number',
    email: 'internet.email',
    birthday: 'date.past',
    passport: 'datatype.uuid',
    password: 'internet.password',
    nationalId: 'datatype.uuid',
    taxId: 'datatype.uuid'
  };
  const propertyPathArray = fakerMap[type].split('.');
  let result: any = faker;
  for (const pathPart of propertyPathArray) {
    result = result[pathPart];
  }
  return result();
}

export function generatePipelineReport(
  scenarios: {
    name: string;
    status: 'FAILED' | 'PASSED';
    attachments: { [key: string]: any };
    stepLog: { name: string; status: 'PASSED' | 'FAILED' }[];
    imageString: string;
  }[]
) {
  const htmlParts = [];

  for (const scenario of scenarios) {
    const { name, attachments, stepLog, status, imageString } = scenario;
    const attachmentsTable =
      status === 'FAILED' && Object.keys(attachments).length
        ? `
    <table>
    <thead>
        <tr>
        <td>Key</td>
        <td>Value</td>
        </tr>
        </thead>
      <tbody>
      ${Object.entries(attachments)
        .map(
          ([key, value]) => `
        <tr>
        <td>${key}</td>
            <td>${value}</td>
            </tr>
            `
        )
        .join('')}
      </tbody>
    </table>
    `
        : '';
    const stepLogTable =
      status === 'PASSED'
        ? ''
        : `
  <table>
    <thead>
        <tr>
        <td>#</td>
        <td>Step</td>
        <td>Status</td>
        </tr>
        </thead>
      <tbody>
      ${stepLog
        .map(({ name, status }, index) => ({ name, status, nth: index + 1 }))
        .filter(({ nth }) => nth === 1 || nth > stepLog.length - 5)
        .map(
          ({ name, status, nth }) => `
        <tr>
        <td>${nth}.</td>
        <td>${name}</td>
            <td style="color: ${status === 'PASSED' ? 'green' : 'red'};" alt="${status}">${
            status === 'PASSED' ? '✔' : '✖'
          }</td>
            </tr>
            `
        )
        .join('')}
  </tbody>
    </table>
      `;
    const imageTag = imageString ? `<img src="data:image/png;base64, ${imageString}" /> ` : '';
    const accordionContent = [attachmentsTable + stepLogTable + imageTag].join('<br/>');
    const scenarioHtml = `
    <details>
    <summary> <b style="color: ${status === 'PASSED' ? 'green' : 'red'};">${
      status === 'PASSED' ? '✔' : '✖'
    } ${name} </b></summary >
      ${accordionContent}
  </details>
    `;
    htmlParts.push(scenarioHtml);
  }

  // Write the HTML content to a file
  const filePath = 'temp/pipeline_report.html';
  const htmlContent = '<h2>Report:</h2>' + htmlParts.join('<hr>');
  writeFileSync(filePath, htmlContent);
  console.log(`Pipeline report generated at ${filePath} `);
}

function ensureFolderExists(filePath) {
  const folderPath = dirname(filePath);

  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }
}

export function downloadFromUrl(url: string, destination: string) {
  ensureFolderExists(destination);
  const file = createWriteStream(destination);
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close(resolve);
        });

        file.on('error', (err) => {
          unlink(destination, () => reject(err));
        });
      })
      .on('error', (err) => {
        unlink(destination, () => reject(err));
      });
  });
}

export function generateMsTeamsStepsAndSaveToFile(
  scenarios: {
    name: string;
    status: 'FAILED' | 'PASSED';
    attachments: { [key: string]: any };
    stepLog: { name: string; status: 'PASSED' | 'FAILED' }[];
    imageString: string;
  }[]
): void {
  const sections = scenarios.map(({ name, status }) => {
    return { activityTitle: `${status === 'PASSED' ? '✔' : '✖'} ${name}` };
  });

  // Convert the object to JSON
  const jsonContent = JSON.stringify(sections);
  const filePath = 'temp/sections.json';

  writeFileSync(filePath, jsonContent);
  console.log(`Generated and saved MS Teams steps to: ${filePath}`);
}

export function generatePassword() {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const specialCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const numbers = '0123456789';

  const getRandomChar = (characters) => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters.charAt(randomIndex);
  };

  const upperCaseLetter = getRandomChar(uppercaseLetters);
  const lowerCaseLetter = getRandomChar(lowercaseLetters);
  const specialCharacter = getRandomChar(specialCharacters);
  const number = getRandomChar(numbers);

  const remainingCharacters = faker.random.alphaNumeric(4); // Generates 4 alphanumeric characters
  const passwordArray = [
    upperCaseLetter,
    lowerCaseLetter,
    specialCharacter,
    number,
    ...remainingCharacters.split('') // Split alphanumeric characters into an array
  ];

  faker.helpers.shuffle(passwordArray); // Shuffle the characters
  return passwordArray.join('');
}

export function generateUniqueEmail(baseEmail: string): string {
  const timestamp = new Date().getTime();
  return `${baseEmail.split('@')[0]}.${timestamp}@${baseEmail.split('@')[1]}`;
}
