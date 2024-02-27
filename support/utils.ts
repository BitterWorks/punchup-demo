/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable indent */

import { CustomWorld, ICustomWorld } from './custom-world';
import { config } from './config';

import { faker } from '@faker-js/faker/locale/en_US';
import resemble from 'resemblejs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { ensureFile, pathExists } from 'fs-extra';
import { writeFileSync, readFileSync, createWriteStream, unlink, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import https from 'https';

type IScreenshotOptions = {
  threshold?: number | undefined;
  maxPixelDiff?: number | undefined;
  reverse?: boolean;
};

const DEFAULT_SCREENSHOT_OPTIONS = {
  threshold: 0.05,
  maxPixelDiff: undefined,
  reverse: false
};

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
export async function saveTempScreenshot(this: ICustomWorld, pageName: string) {
  const imgName = slugify(pageName);
  const fullImagePath = `temp/${this.testRunId}/${imgName}.png`;
  const wholePageScreenshot = await this.page.screenshot();
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

export function saveToJsonFile(filename, data) {
  // Convert the data to JSON format
  const jsonData = JSON.stringify(data, null, 2); // null and 2 for pretty formatting

  // Get the directory name from the filename
  const directory = dirname(filename);

  // Create the directory if it doesn't exist
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  // Write the JSON data to the file
  writeFileSync(filename, jsonData, 'utf8');

  console.log(`Data saved to ${filename}`);
}

export function getEstTime() {
  // Get current date and time in EST
  const currentDate = new Date();
  const estOffset = -5 * 60; // Offset for Eastern Standard Time (EST) in minutes (UTC-5)
  const estTime = new Date(currentDate.getTime() + estOffset * 60 * 1000);

  // Format the date and time
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const formattedTime = formatter.format(estTime);

  // Print the formatted time
  return `${formattedTime} EST`;
}

const LT_GENERATE_SHARABLE_LINK_ENDPOINT =
  'https://api.lambdatest.com/lshs/api/v1.0/share-item/generate-sharable-link';
/**
 * Given a `buildId`, generates a sharable link for the LambdaTest build matching it.
 *
 * @export
 * @param {string} sessionId
 */
async function getLTSharableLink(
  entityId: string,
  entityType: 'Automation Build' | 'Automation Test'
) {
  const { LT_USERNAME, LT_ACCESS_KEY } = process.env;
  const authToken = Buffer.from(`${LT_USERNAME}:${LT_ACCESS_KEY}`).toString('base64');
  const headersList = {
    authorization: `Basic ${authToken}`,
    'Content-Type': 'application/json'
  };
  const bodyContent = JSON.stringify({
    expiresAt: 7,
    entityType,
    entityIds: [entityId]
  });
  const response = await fetch(LT_GENERATE_SHARABLE_LINK_ENDPOINT, {
    method: 'POST',
    body: bodyContent,
    headers: headersList
  });
  const data = await response.json();
  const url = (data as any).shareIdUrl;
  return url;
}

export function getLTBuildUrl(buildId: string) {
  return getLTSharableLink(buildId, 'Automation Build');
}

export function getLTTestUrl(testId: string) {
  return getLTSharableLink(testId, 'Automation Test');
}
