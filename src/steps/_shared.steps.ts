/* eslint-disable no-console */
import { ICustomWorld } from '../support/custom-world';
import { generateUniqueEmail, getLastMail } from '../utils/Logic';
import { downloadFromUrl, getFakerValue, nthToNumber } from '../support/utils';

import { Given, Then, When } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { Context } from 'vm';

Given('I clicked the {string} button', async function (this: ICustomWorld, btnText: string) {
  const button = this.page.locator(`//button[span[text()="${btnText}"] or text()="${btnText}"]`);
  await button.click();
});

When('pause', async function (this: ICustomWorld) {
  await this.page.pause();
});

Then('Snapshot', async function (this: ICustomWorld) {
  const image = await this.page.screenshot();
  image && (await this.attach(image, 'image/png'));
});

Then('debug', async function () {
  // eslint-disable-next-line no-debugger
  debugger;
});

When('I wait for {string} ms', async function (this: ICustomWorld, ms: string) {
  await this.page.waitForTimeout(parseInt(ms));
});

When('I close the current tab', async function (this: ICustomWorld) {
  let allPages = await (this.context as Context).pages();
  if (allPages.length > 1) {
    // Close the current page
    await (this.page as Page).close();
    // Set the current page to the previous one (e.g., the main tab)
    allPages = await (this.context as Context).pages();
    const previousPage = allPages[allPages.length - 1];
    this.page = previousPage;
  } else {
    throw Error('No remaining tab to set as `page`');
  }
});

Given('I go to the {string} page', async function (this: ICustomWorld, pagePath: string) {
  const url = process.env.BASE_URL + pagePath;
  await this.page.goto(url);
});

When(
  'I pick {string} under {string}',
  async function (this: ICustomWorld, choiceLabel: string, fieldsetLabel: string) {
    if (choiceLabel) {
      await this.pickOption(fieldsetLabel, choiceLabel);
    }
  }
);

When('I click on {string}', async function (this: ICustomWorld, btnText: string) {
  let selector =
    '(' +
    [
      `//a[text()="${btnText}"]`,
      `(//button[normalize-space()="${btnText}"])[1]`,
      `//button[.//text()="${btnText}"]`,
      // `//input[@value="${btnText}"]`,
      // `//button[text()="${btnText}"]`,
      // `//a[contains(normalize-space(),"${btnText}")]`,
      `//a[normalize-space(text())="${btnText}"]`,
      // `//div[text()="${btnText}"]`,
      `//a[div[text()="${btnText}"]]`,
      `(//button[text()='${btnText}'])[2]`
    ].join(' | ') +
    ')';
  if (btnText === 'New Movies') {
    selector += '[1]';
  }
  console.log(selector);
  await this.page.pause();
  const locator = this.page.locator(selector);
  if (btnText === 'Close') {
    await locator.nth(1).click();
  } else {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }
});

When(
  'I wait for the {string} step to load',
  async function (this: ICustomWorld, stepTitle: string) {
    if (stepTitle) {
      if (stepTitle === 'One Moment Please') {
        await this.page.waitForTimeout(5000);
      } else {
        await this.page.waitForSelector(`//h1[contains(text(),"${stepTitle.replace('...', '')}")]`);
      }
    }
  }
);

When(
  'I input {string} under {string}',
  async function (this: ICustomWorld, inputValue: string, inputLabel: string) {
    if (inputValue) {
      if (inputLabel === 'Title') {
        await this.page.locator('.node-title').click({ force: true });
        // Loop through each character of the string
        for (let i = 0; i < inputValue.length; i++) {
          // Type the current character
          await this.page.keyboard.type(inputValue[i]);
        }
      } else {
        const inputLabel2 = inputLabel.replaceAll('...', '');
        await this.fillInput(inputLabel2, inputValue);
      }
    }
  }
);

When(
  'I save the value for the {string} input as {string}',
  async function (this: ICustomWorld, inputLabel: string, attachmentKey: string) {
    const inputLabelTrimmed = inputLabel.replaceAll('...', '');
    const inputSelector = `//input[@placeholder="${inputLabelTrimmed}"]`;
    const inputValue = await this.page.locator(inputSelector).inputValue();
    this.attachments[attachmentKey] = inputValue;
  }
);

When(
  'I select {string} under {string}',
  async function (this: ICustomWorld, selectValue: string, selectLabel: string) {
    if (selectValue) {
      await this.selectOption(selectValue, selectLabel, null);
    }
  }
);

When('I check {string}', async function (this: ICustomWorld, checkboxLabel: string) {
  const selector = `//*[normalize-space()="${checkboxLabel}"]//input`;
  await this.page.locator(selector).click();
});

When(
  'I click {string} on the {string} row of the table',
  async function (this: ICustomWorld, btnText: string, rowText: string) {
    const selector = `//tr[.//text()="${rowText}"]//a[.//text()="${btnText}"]`;
    await this.page.locator(selector).click();
  }
);

When(
  'I click {string} on the {string} row of the {string} table',
  async function (this: ICustomWorld, btnText: string, nthRow: string, nthTable: string) {
    const rowNum = nthToNumber(nthRow);
    const tableNum = nthToNumber(nthTable);
    const selector = `(//table//tbody//tr[${rowNum}]//a[.//text()="${btnText}"])[${tableNum}]`;
    await this.page.locator(selector).click();
  }
);

When(
  'I click {string} under {string}',
  async function (this: ICustomWorld, btnText: string, headingText: string) {
    const selector = `//*[*[text()="${headingText}"]]//a[.//text()="${btnText}"]`;
    await this.page.locator(selector).click();
  }
);

When(
  'I input {string} for the {string} row under the {string} column',
  async function (this: ICustomWorld, inputValue: string, nthRow: string, columnHeading: string) {
    const rowNum = nthToNumber(nthRow);
    const headers = this.page.locator('//thead/tr/th/a');
    const numOfCols = await this.page.locator('th').count();
    let colNum;
    for (let i = 0; i < numOfCols; i++) {
      const header = headers.nth(i);
      const headerText = await header.textContent();
      if (headerText === columnHeading) {
        colNum = i + 1;
        break;
      }
    }
    if (colNum === undefined) {
      throw Error("Couldn't find row number");
    }
    const selector = `//tbody/tr[${rowNum}]/td[${colNum}]//input`;
    await this.page.locator(selector).fill(inputValue);
  }
);

When('I switch to the popup window', async function (this: ICustomWorld) {
  const pages = await this.context.pages();
  console.log(JSON.stringify(pages));
  this.page = pages[pages.length - 1];
});

When('I download and attach the federal return PDF', async function (this: ICustomWorld) {
  const selector = 'object[type*=pdf]';
  await this.page.locator(selector).click();
  await this.page.waitForLoadState('networkidle');
  const dataAttribute = await this.page.locator(selector).getAttribute('data');
  const href = dataAttribute.replace('HTTPS://', `https://${process.env.BASIC_AUTH_CREDENTIALS}@`);
  // Bypass SSL certificate validation
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  await downloadFromUrl(href, './temp/attachments/federalReturn.pdf');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
});

When('I raise an error saying {string}', async function (this: ICustomWorld, errorText: string) {
  throw new Error(errorText);
});

Then('I see the {string} step', async function (this: ICustomWorld, stepTitle: string) {
  await this.page.waitForSelector(`//h1[contains(text(),"${stepTitle.replace('...', '')}")]`, {
    timeout: 5000
  });
});

Then(
  'I see a warning message saying {string}',
  async function (this: ICustomWorld, msgText: string) {
    await this.page.waitForSelector(
      `(//div[contains(@class, "alert")][.//*[contains(text(),"${msgText.replaceAll(
        '...',
        ''
      )}")]])[1]`,
      {
        timeout: 15000
      }
    );
  }
);

Then("I don't find an error message", async function (this: ICustomWorld) {
  await this.page.waitForSelector('//b[contains(text(),"Problem Encountered")]', {
    state: 'hidden',
    timeout: 5000
  });
});

Then(
  'I input the value attached as {string} under the {string} input',
  async function (this: ICustomWorld, attachmentKey: string, inputLabel: string) {
    const inputValue = this.attachments[attachmentKey];
    if (inputValue) {
      const inputLabel2 = inputLabel.replaceAll('...', '');
      await this.fillInput(inputLabel2, inputValue);
    }
  }
);

Then('I solve the reCaptcha', async function (this: ICustomWorld) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await this.page.solveRecaptchas();
});

Then(
  'I input the value saved as {string} under the {string} input',
  async function (this: ICustomWorld, attachmentKey: string, inputLabel: string) {
    const inputValue = this.attachments[attachmentKey];
    if (inputValue) {
      const inputLabelTrimmed = inputLabel.replaceAll('...', '');
      await this.fillInput(inputLabelTrimmed, inputValue);
    }
  }
);

Then(
  'I go to the {string} link of the {string} email sent to {string}',
  async function (
    this: ICustomWorld,
    btnText: string,
    emailSubject: string,
    recipientEmail: string
  ) {
    const email = await getLastMail({ subject: emailSubject, sentTo: recipientEmail });
    const { links } = email.html;
    const link = links.find(
      (linkObj: { text: string }) => linkObj['text'].trim() === btnText
    )?.href;
    await this.page.goto(link);
  }
);

Then(
  'I go to the {string} link of the {string} email sent to the email saved as {string}',
  async function (
    this: ICustomWorld,
    btnText: string,
    emailSubject: string,
    recipientEmailKey: string
  ) {
    const recipientEmail = this.attachments[recipientEmailKey];
    const email = await getLastMail({ subject: emailSubject, sentTo: recipientEmail });
    const { links } = email.html;
    const link = links.find(
      (linkObj: { text: string }) => linkObj['text'].trim() === btnText
    )?.href;
    await this.page.goto(link);
  }
);

Then('I am at the {string} feed', async function (this: ICustomWorld, titleText: string) {
  const feedTitleSelector = `//a[contains(@href, 'feed')]//div[text()="${titleText}"]`;
  const locator = await this.page.locator(feedTitleSelector);
  await expect(locator).toBeVisible();
});

Then(
  'I wait for {string} to receive a {string} email',
  async function (this: ICustomWorld, recipientEmail: string, emailSubject: string) {
    await this.page.waitForTimeout(20000);
    await getLastMail({
      subject: emailSubject,
      sentTo: recipientEmail,
      timeout: 7000
    });
  }
);

Then(
  'I wait for the email saved as {string} to receive a {string} email',
  async function (this: ICustomWorld, recipientEmailKey: string, emailSubject: string) {
    const recipientEmail = this.attachments[recipientEmailKey];
    await this.page.waitForTimeout(3000);
    await getLastMail({
      subject: emailSubject,
      sentTo: recipientEmail,
      timeout: 7000
    });
  }
);

When(
  'I input a valid {string} under {string}',
  async function (this: ICustomWorld, valueType: string, inputLabel: string) {
    let value: string;
    if (valueType === 'email') {
      const baseEmail = getFakerValue('name') + '@0fxrlxug.mailosaur.net';
      value = generateUniqueEmail(baseEmail);
    } else {
      value = getFakerValue('valueType');
    }
    await this.fillInput(inputLabel, value);
  }
);

Then(
  'I see a toast message saying {string}',
  async function (this: ICustomWorld, toastMsg: string) {
    const selector = `//div[div[span//*[local-name()='svg']] and button]//div/span[contains(text(),"${toastMsg.replaceAll(
      '...',
      ''
    )}")]`;
    const locator = await this.page.locator(selector);
    await expect(locator).toBeVisible();
  }
);

When('I click on the {string} icon', async function (this: ICustomWorld, iconName: string) {
  const icons = {
    lens: 'M229.7,218.3l-43.3-43.2a92.2,92.2,0,1,0-11.3,11.3l43.2,43.3a8.2,8.2,0,0,0,11.4,0A8.1,8.1,0,0,0,229.7,218.3ZM40,116a76,76,0,1,1,76,76A76.1,76.1,0,0,1,40,116Z',
    home: 'M208,224H160a16,16,0,0,1-16-16V160H112v48a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.5a16,16,0,0,1,5.2-11.8l80-72.7a16,16,0,0,1,21.6,0l80,72.7a16,16,0,0,1,5.2,11.8V208a16,16,0,0,1-16,16Zm-96-80h32a16,16,0,0,1,16,16v48h48V115.5L128,42.8,48,115.5V208H96V160A16,16,0,0,1,112,144Z',
    communities:
      'M121.2,157.9a60,60,0,1,0-66.4,0A95.5,95.5,0,0,0,9.5,192.8a8,8,0,1,0,13,9.2,80.1,80.1,0,0,1,131,0,8,8,0,1,0,13-9.2A95.5,95.5,0,0,0,121.2,157.9ZM44,108a44,44,0,1,1,44,44A44,44,0,0,1,44,108Zm202.1,95.9A7.9,7.9,0,0,1,235,202a80.2,80.2,0,0,0-65.5-34,8,8,0,0,1,0-16,44,44,0,0,0,0-88,47.4,47.4,0,0,0-11.9,1.6,8,8,0,0,1-9.9-5.5,8.1,8.1,0,0,1,5.5-9.9A64,64,0,0,1,169.5,48a59.9,59.9,0,0,1,33.2,109.9,96.3,96.3,0,0,1,45.4,34.9A8,8,0,0,1,246.1,203.9Z',
    conversations:
      'M169.6,72.6A80,80,0,0,0,16,104v66a14,14,0,0,0,14,14H86.7A80.2,80.2,0,0,0,160,232h66a14,14,0,0,0,14-14V152A79.8,79.8,0,0,0,169.6,72.6ZM32,104a64,64,0,1,1,64,64H32ZM224,216H160a64.2,64.2,0,0,1-55.7-32.4A80.2,80.2,0,0,0,176,104a83.6,83.6,0,0,0-1.3-14.3A64,64,0,0,1,224,152Z',
    x: 'M205.7,194.3a8.1,8.1,0,0,1,0,11.4,8.2,8.2,0,0,1-11.4,0L128,139.3,61.7,205.7a8.2,8.2,0,0,1-11.4,0,8.1,8.1,0,0,1,0-11.4L116.7,128,50.3,61.7A8.1,8.1,0,0,1,61.7,50.3L128,116.7l66.3-66.4a8.1,8.1,0,0,1,11.4,11.4L139.3,128Z',
    menu: 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z',
    document:
      'M213.7,66.3l-40-40A8.1,8.1,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8.1,8.1,0,0,0,213.7,66.3ZM168,216H56V72h76.7L168,107.3V216Zm32-32H184V104a8.1,8.1,0,0,0-2.3-5.7l-40-40A8.1,8.1,0,0,0,136,56H88V40h76.7L200,75.3Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z'
  };
  console.log(icons[iconName]);
  const selector = `//span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="${icons[iconName]}"]`;
  await this.page.locator(selector).click();
});

Then('I no longer see the search bar', async function (this: ICustomWorld) {
  const selector = `//div[div[input[@name="search"]]]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible({ visible: false });
});

Then(
  'I verify the {string} section appearance',
  async function (this: ICustomWorld, sectionName: string) {
    const sectionToSelectors = {
      center: `//div[@slot="center"]`
    };
    const selector = sectionToSelectors[sectionName];
    await this.validateElementAppeareance(selector, ['//p[contains(text(), "Last")]']);
  }
);

When('I click on the three-dot-option button', async function (this: ICustomWorld) {
  const selector = `//button[@id="headlessui-popover-button-1"]`;
  await this.page.locator(selector).click();
});

Then('I see the {string} title', async function (this: ICustomWorld, titleText: string) {
  const selector = `(//div[text()="${titleText}" and contains(@class, "text-3xl")])[1] | //div[text()="${titleText}" and contains(@class, "text-4xl")]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

Then('I see a total of {string} Feeds', async function (this: ICustomWorld, titleText: string) {
  const selector = `//div[contains(text(), '${titleText}')]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

When('go back', async function (this: ICustomWorld) {
  await this.page.goBack();
});
