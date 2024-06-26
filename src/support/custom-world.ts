import { compareToBaseImage, elementSelectorToFileName } from './utils';
import { IScreenshotOptions } from './Types';

import { APIRequestContext, BrowserContext, Page, PlaywrightTestOptions } from '@playwright/test';
import * as messages from '@cucumber/messages';
import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';

export interface ICustomWorld extends World {
  debug: boolean;
  feature?: messages.Pickle;
  context?: BrowserContext;
  page: Page;
  testRunId: string;
  attachments: { [key: string]: any };

  testSlug?: string;
  startTime?: Date;

  server?: APIRequestContext;

  playwrightOptions?: PlaywrightTestOptions;

  // Testing utils
  username?: string;

  validateElementAppearance(
    selector: string,
    maskSelectors?: string[],
    screenshotName?: string,
    options?: IScreenshotOptions
  ): Promise<void>;
  getWorkingSelector(selectors: string[], timeout?: number): Promise<string>;
  fillInput(inputLabel: string, inputValue: string): Promise<void>;
  selectOption(selectValue: string, selectLabel: string, selector: string | null): Promise<void>;
  pickOption(pickValue: string, labelText: string): Promise<void>;
}

export class CustomWorld extends World implements ICustomWorld {
  page: Page;
  testRunId: string;
  feature: messages.Pickle;
  constructor(options: IWorldOptions) {
    super(options);
  }
  debug = false;
  params = {};
  attachments = {};

  async setTestStatus(status, remark) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, prettier/prettier
      (_) => {},
      // eslint-disable-next-line indent
      `lambdatest_action: ${JSON.stringify({
        action: 'setTestStatus',
        arguments: { status, remark }
      })}`
    );
  }

  async validateElementAppearance(
    selector: string,
    maskSelectors: string[] = [],
    screenshotName: string | undefined = undefined,
    options: IScreenshotOptions = {}
  ) {
    const featureName = this.feature.name;
    const selectorName = screenshotName || elementSelectorToFileName(selector);
    const path = `screenshots/${featureName}/${selectorName}.png`;
    const mask = maskSelectors.map((selector) => this.page.locator(selector));
    const screenshot = await this.page
      .locator(selector)
      .screenshot({ timeout: 5000, path: `temp/${this.testRunId}/${path}`, mask });
    await compareToBaseImage(this, path, screenshot, options);
  }

  async getWorkingSelector(selectors: string[], timeout = 15000) {
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout, state: 'visible' });
        return selector;
      } catch {
        continue;
      }
    }
    throw new Error("Couldn't find working selector");
  }

  async fillInput(inputLabel: string, inputValue: string) {
    const locator = this.page.locator(`//input[@placeholder="${inputLabel}"]`);
    await locator.focus();
    await locator.fill(inputValue);
  }

  async selectOption(selectValue: string, selectLabel: string, selector: string | null = null) {
    const computedSelector =
      selector ?? `//*[label[text()="${selectLabel}" or .//text()="${selectLabel}"]]//select`;
    const values = selectValue.split('-');
    for (let index = 0; index < values.length; index++) {
      await this.page.locator(computedSelector).nth(index).selectOption(values[index]);
    }
  }

  async pickOption(labelText: string, choiceText: string) {
    const labelTrimmed = labelText.replaceAll('...', '');
    const choiceTrimmed = choiceText.replaceAll('...', '');
    const selector =
      '(' +
      [
        `//*[legend[contains(text(),"${labelTrimmed}") or .//*[contains(text(), "${labelTrimmed}")]]]/*[label[text()="${choiceTrimmed}" or *[text()="${choiceTrimmed}"]]]/input`,
        `//div[contains(@class,"form-container") and preceding-sibling::div[.//*[contains(text(), "${labelTrimmed}")]]]//input[following-sibling::label[contains(text(), "${choiceTrimmed}")]]`
      ].join(' | ') +
      ')';
    const timeout = 35000;
    const locator = this.page.locator(selector);
    const inputIsChecked = (await locator.getAttribute('checked', { timeout })) !== null;
    if (!inputIsChecked) {
      await locator.scrollIntoViewIfNeeded({ timeout });
      await locator.click({ force: true, timeout });
    }
  }
}

setWorldConstructor(CustomWorld);
