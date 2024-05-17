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
      `(//button[text()='${btnText}'])[2]`,
      `//button[span[contains(text(), '${btnText}')]]`,
      `//a[span[span[span[text()="${btnText}"]]]]`,
      `//button[div[div[text()="${btnText}"]]]`,
      `//button[@role="${btnText}"]`,
      `//div/a[contains(@href, "/@") and text()="${btnText}"]`,
      `//button[@aria-haspopup][span[text()="${btnText}"]]`
      // `//a[.//span[text()="${btnText}"]]`
    ].join(' | ') +
    ')';
  if (btnText === 'New Movies') {
    selector += '[1]';
  }
  console.log(selector);
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
      } else if (inputLabel === 'Search') {
        await this.page!.locator(`//input[@placeholder="${inputLabel}"]`).fill(`${inputValue}`);
      } else if (inputLabel === 'Message Hero') {
        await this.page!.locator(`//input[@placeholder="${inputLabel}"]`).fill(`${inputValue}`);
      } else if (inputLabel === 'Untitled Post') {
        await this.page!.locator(
          `//div[div[normalize-space(text())="${inputLabel}"]]/preceding-sibling::div/div`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Name') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/div/div/input | //div[label[text()="${inputLabel}"]]/following-sibling::div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Tagline') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/div/div/input | //div[label[text()="${inputLabel}"]]/following-sibling::div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Slug') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Member Nickname (Singular)') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Members Nickname (Plural)') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Description') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/textarea`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Display Name') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/div/div/input`
        ).fill(`${inputValue}`);
      } else if (inputLabel === 'Handle') {
        await this.page!.locator(
          `//div[label[text()="${inputLabel}"]]/following-sibling::div/div/div/input`
        ).fill(`${inputValue}`);
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
      'M213.7,66.3l-40-40A8.1,8.1,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8.1,8.1,0,0,0,213.7,66.3ZM168,216H56V72h76.7L168,107.3V216Zm32-32H184V104a8.1,8.1,0,0,0-2.3-5.7l-40-40A8.1,8.1,0,0,0,136,56H88V40h76.7L200,75.3Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z',
    emoji:
      'M128,24a104,104,0,0,0,0,208,102.2,102.2,0,0,0,30.6-4.6,6.7,6.7,0,0,0,3.3-2l63.5-63.5a7.2,7.2,0,0,0,2-3.3A102.2,102.2,0,0,0,232,128,104.2,104.2,0,0,0,128,24Zm84.7,128L152,212.7A87.9,87.9,0,1,1,212.7,152ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm72,0a12,12,0,1,1,12,12A12,12,0,0,1,152,108Zm24.5,48a56,56,0,0,1-97,0,8,8,0,1,1,13.8-8,40.1,40.1,0,0,0,69.4,0,8,8,0,0,1,13.8,8Z',
    image:
      'M232,184V56a16,16,0,0,0-16-16H40A16,16,0,0,0,24,56V168h0v32a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V184ZM216,56V164.7L187.3,136a16.1,16.1,0,0,0-22.6,0L144,156.7,99.3,112a16.1,16.1,0,0,0-22.6,0L40,148.7V56Zm0,144H40V171.3l48-48L132.7,168a15.9,15.9,0,0,0,22.6,0L176,147.3l40,40V200Zm-68.5-91.5A11.9,11.9,0,0,1,144,100a12,12,0,0,1,24,0h0a12,12,0,0,1-12,12A12.3,12.3,0,0,1,147.5,108.5Z',
    threeDots:
      'M76,128a12,12,0,1,1-12-12A12,12,0,0,1,76,128Zm116-12a12,12,0,1,0,12,12A12,12,0,0,0,192,116Zm-64,0a12,12,0,1,0,12,12A12,12,0,0,0,128,116Z',
    checkMark:
      'M104,192a8.5,8.5,0,0,1-5.7-2.3l-56-56a8.1,8.1,0,0,1,11.4-11.4L104,172.7,210.3,66.3a8.1,8.1,0,0,1,11.4,11.4l-112,112A8.5,8.5,0,0,1,104,192Z'
  };
  console.log(icons[iconName]);
  if (icons[iconName] === icons['emoji']) {
    const selectorEmoji = `(//span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="${icons[iconName]}"])[last()]`;
    await this.page.locator(selectorEmoji).click();
  } else if (icons[iconName] === icons['threeDots']) {
    const selectorThreeDots = `(//span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="${icons[iconName]}"])[1]`;
    await this.page.locator(selectorThreeDots).click();
  } else {
    const selector = `(//span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="${icons[iconName]}"])`;
    await this.page.locator(selector).click();
  }
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
      center: {
        selector: `//div[@slot="center"]`,
        masks: ['//p[contains(text(), "Last")]']
      },
      body: {
        selector: `//body`,
        masks: [
          `//feed | //div[@class = "flex w-full max-w-5xl flex-col gap-10"] | //div[@class="flex grow flex-row gap-8"]`
        ]
      }
    };
    const selector = sectionToSelectors[sectionName]['selector'];
    //turn mask array into object if it becomes problematic
    await this.validateElementAppearance(selector);
  }
);

When('I click on the hamburger menu button', async function (this: ICustomWorld) {
  const selector = `//button[@id="headlessui-popover-button-1"]`;
  await this.page.locator(selector).click();
});

When(`I click on jorge@0fxrlxug.mailosaur.net's Channel`, async function (this: ICustomWorld) {
  const selector = `//button[@aria-haspopup][span[text()="jorge@0fxrlxug.mailosaur.net's Channel"]]`;
  await this.page.locator(selector).click();
});

Then('I see the {string} title', async function (this: ICustomWorld, titleText: string) {
  const selector = `(//div[text()="${titleText}" and contains(@class, "text-3xl")])[1] | //div[text()="${titleText}" and contains(@class, "text-4xl")] | //span[text()='${titleText}'] | (//div[@class="text-3xl font-bold" and text()="${titleText}"])[1] | //div[@slot="left"]/div/div[2 and text()='${titleText}']`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

Then('I verify the number of feeds displayed is correct', async function (this: ICustomWorld) {
  const selector = `//div[contains(text(), 'We’ve')]`;
  const cardCount = await this.page
    .locator(
      `//div[@class="grid max-w-screen-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"]/a`
    )
    .count();
  const locator = this.page.locator(selector);
  const feedCount = await locator.textContent();
  //extract the number from feedCount and make sure it's 1
  // Extract the number (assuming it's always an integer)
  const extractedNumber = parseInt(feedCount.match(/\d+/)[0], 10);
  console.log(`Extracted number: ${extractedNumber}`);
  console.log(`Number of cards: ${cardCount}`);
  console.log(`${cardCount} === ${extractedNumber}`);
  await this.page.pause();
  const countsMatch = cardCount === extractedNumber;
  expect(countsMatch).toBeTruthy();
});

When('go back', async function (this: ICustomWorld) {
  await this.page.goBack();
});

When('refresh', async function (this: ICustomWorld) {
  await this.page.reload();
});

Then('I see the {string} pop-up menu', async function (this: ICustomWorld, popupText: string) {
  const selector = `//div[@slot="panel"][div[text()="${popupText}"]]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

Then('I see the {string} channel', async function (this: ICustomWorld, channelTitleText: string) {
  const selector = `((//ul/div/li)[last()])[span[text()="${channelTitleText}"]]`;
  // const selector = `//ul/div/li[span[text()="${channelTitleText}"]]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

When('I click the PUNCHUP logo', async function (this: ICustomWorld) {
  const selector = `//a[@href="/"][*[name()='svg' and @id="logo"]]`;
  await this.page.locator(selector).click();
});

// When(
//   `I input {string} under {string}`,
//   async function (this: ICustomWorld, inputValue: string, placeholderText: string) {
//     // await this.page!.locator(`//*[@placeholder="${placeholderText}"]`).fill(`${inputValue}`);
//     await this.page!.locator(`//input[@placeholder="${placeholderText}"]`).fill(`${inputValue}`);
//   }
// );

Then('I see the {string} user result', async function (this: ICustomWorld, userText: string) {
  const selector = `//span[text()="${userText}"]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

When('I click the {string} user result', async function (this: ICustomWorld, searchResult: string) {
  const selector = `//a[div[span[text()="${searchResult}"]]]`;
  await this.page.locator(selector).click();
});

Then('I see the {string} user profile', async function (this: ICustomWorld, searchText: string) {
  const usernameSelector = `//div[@class="text-xl font-bold dark:text-onyx-100"]`;
  const nicknameSelector = `//div[@class="dark:text-onyx-300"]`;

  // Get the text content of the elements
  const usernameText = await this.page.locator(usernameSelector).textContent();
  const nicknameText = await this.page.locator(nicknameSelector).textContent();

  // Check if either of the text content contains the search text
  const textContained = usernameText.includes(searchText) || nicknameText.includes(searchText);
  expect(textContained).toBe(true);
});

When('I press {string}', async function (this: ICustomWorld, key: string) {
  await this.page.keyboard.down(`${key}`);
});

When(
  'I save the current datetime as {string}',
  async function (this: ICustomWorld, attachmentKey: string) {
    const currentDate = new Date();
    console.log(this.attachments);
    this.attachments[attachmentKey] = currentDate.toISOString();
    console.log(this.attachments);
    console.log(currentDate);
  }
);

Then(
  'I see that the last message contains {string} and was sent after {string}',
  async function (this: ICustomWorld, messageText: string, messageDateTime: string) {
    // Retrieve the last message sent
    const lastMessage = await this.page.waitForSelector(
      '(//div[@class="group relative"])[1]/div/span/span[2] | (//div[@class="group relative"])[1]/div/span/span'
    );

    // Get the text content of the last message
    const lastMessageText = await lastMessage.textContent();

    // Check if the last message contains the specified text
    expect(lastMessageText).toContain(messageText);

    // Get the message sending time from attachments
    const savedDateTimeString = this.attachments[messageDateTime];
    const savedDateTime = new Date(savedDateTimeString);

    // Get the sending time of the last message
    const lastMessageTimestampString = await this.page
      .locator(
        `(//div[@class="group relative"])[1]/div/div/div | (//div[@class="group relative"])[1]/div/span/span/span[2]`
      )
      .textContent();

    // const selectorOnlyMessage = `//div[@class="group relative"]//span[text()="jorge@0fxrlxug.mailosaur.net"]/following-sibling::span)[1]`;
    // const selectorMessageWithNickname = `(//div[@class="group relative"]//span[@class="flex flex-row items-center gap-3"]/following-sibling::span)[1]`;

    const lastMessageTimestampAndNameString = await this.page
      .locator(
        `(//div[@class="group relative"]//span[text()="tester J"]/following-sibling::span)[1]`
      )
      .textContent();

    const lastMessageTimestampAndNameStringAMPM: 'AM' | 'PM' = lastMessageTimestampAndNameString
      .split(' ')
      .pop() as 'AM' | 'PM';

    const timeOffset = 0;

    const lastMessageTimestampDate = new Date();
    const [hours, minutes] = lastMessageTimestampString.split(':');
    console.log({ lastMessageTimestampDate });
    if (lastMessageTimestampAndNameStringAMPM === 'PM') {
      lastMessageTimestampDate.setHours(parseInt(hours + timeOffset), parseInt(minutes));
    } else {
      lastMessageTimestampDate.setHours(parseInt(hours), parseInt(minutes));
    }
    console.log({ lastMessageTimestampDate });

    console.log({ lastMessageTimestampDate, savedDateTime });
    // Assert that the last message was sent after the specified messageDateTime
    expect(lastMessageTimestampDate.getTime()).toBeGreaterThan(savedDateTime.getTime());
  }
);

Then(
  'NEW I see that the last message contains {string} and was sent after {string}',
  async function (this: ICustomWorld, user: string, messageText: string, messageDateTime: string) {
    // Retrieve the last message sent
    const lastMessage = await this.page.waitForSelector(
      '(//div[@class="group relative"])[1]/div/span/span | (//div[@class="group relative"])[1]/div/span/span[2]'
    );

    // Get the text content of the last message
    const lastMessageText = await lastMessage.textContent();

    console.log(lastMessageText);

    // Check if the last message contains the specified text
    expect(lastMessageText).toContain(messageText);

    // Get the message sending time from attachments
    const savedDateTimeString = this.attachments[messageDateTime];
    const savedDateTime = new Date(savedDateTimeString);

    // Get the sending time of the last message
    const lastMessageTimestampString = await this.page
      .locator(`(//div[@class="group relative"])[1]/div/div/div`)
      .textContent();

    // const selectorOnlyMessage = `//div[@class="group relative"]//span[text()="jorge@0fxrlxug.mailosaur.net"]/following-sibling::span)[1]`;
    // const selectorMessageWithNickname = `(//div[@class="group relative"]//span[@class="flex flex-row items-center gap-3"]/following-sibling::span)[1]`;

    const lastMessageTimestampAndNameString = await this.page
      .locator(
        `(//div[@class="group relative"]//span[text()="${user}"]/following-sibling::span)[1]`
      )
      .textContent();

    const lastMessageTimestampAndNameStringAMPM: 'AM' | 'PM' = lastMessageTimestampAndNameString
      .split(' ')
      .pop() as 'AM' | 'PM';

    const timeOffset = 0;

    const lastMessageTimestampDate = new Date();
    const [hours, minutes] = lastMessageTimestampString.split(':');
    console.log({ lastMessageTimestampDate });
    if (lastMessageTimestampAndNameStringAMPM === 'PM') {
      lastMessageTimestampDate.setHours(parseInt(hours + timeOffset), parseInt(minutes));
    } else {
      lastMessageTimestampDate.setHours(parseInt(hours), parseInt(minutes));
    }
    console.log({ lastMessageTimestampDate });

    console.log({ lastMessageTimestampDate, savedDateTime });
    // Assert that the last message was sent after the specified messageDateTime
    expect(lastMessageTimestampDate.getTime()).toBeGreaterThan(savedDateTime.getTime());
  }
);

When(
  'I click on {string} user in the conversations menu',
  async function (this: ICustomWorld, user: string) {
    await this.page.locator(`//a[span[span[span[text()="${user}"]]]]`).click();
  }
);

When('I click on the {string} emoji', async function (this: ICustomWorld, emoji: string) {
  await this.page.locator(`//button[@data-emoji="${emoji}"]`).click();
});

When(
  `I upload {string} under {string}`,
  async function (this: ICustomWorld, fileName: string, inputTitle: string) {
    console.log(fileName);
    const inputSelector = `//label[@for='${inputTitle}'] | //label[text()="${inputTitle}"]`;
    await this.page!.locator(inputSelector).setInputFiles(
      `C:\\Users\\Jozka\\Documents\\Bitter Works\\punchup-demo\\media\\${fileName}`
    );
  }
);

When('I hover over the first post', async function (this: ICustomWorld) {
  await this.page.locator(`(//article)[1]`).hover();
});

When(
  'I hover over the {string} feed and click on the settings icon',
  async function (this: ICustomWorld, feedTitle: string) {
    await this.page.locator(`//a[div[div[text()="${feedTitle}"]]]`).hover();
    await this.page
      .locator(
        `//a[div[div[text()="${feedTitle}"]]]/following-sibling::div/button/span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="M234.8,150.4l-14.9-19.8c.1-1.8,0-3.7,0-5.1l14.9-19.9a7.8,7.8,0,0,0,1.3-6.9,114.8,114.8,0,0,0-10.9-26.4,8.2,8.2,0,0,0-5.8-4l-24.5-3.5-3.7-3.7-3.5-24.5a8.2,8.2,0,0,0-4-5.8,114.8,114.8,0,0,0-26.4-10.9,7.8,7.8,0,0,0-6.9,1.3L130.6,36h-5.2L105.6,21.2a7.8,7.8,0,0,0-6.9-1.3A114.8,114.8,0,0,0,72.3,30.8a8.2,8.2,0,0,0-4,5.8L64.8,61.1l-3.7,3.7L36.6,68.3a8.2,8.2,0,0,0-5.8,4A114.8,114.8,0,0,0,19.9,98.7a7.8,7.8,0,0,0,1.3,6.9l14.9,19.8v5.1L21.2,150.4a7.8,7.8,0,0,0-1.3,6.9,114.8,114.8,0,0,0,10.9,26.4,8.2,8.2,0,0,0,5.8,4l24.5,3.5,3.7,3.7,3.5,24.5a8.2,8.2,0,0,0,4,5.8,114.8,114.8,0,0,0,26.4,10.9,7.6,7.6,0,0,0,2.1.3,7.7,7.7,0,0,0,4.8-1.6L125.4,220h5.2l19.8,14.8a7.8,7.8,0,0,0,6.9,1.3,114.8,114.8,0,0,0,26.4-10.9,8.2,8.2,0,0,0,4-5.8l3.5-24.6c1.2-1.2,2.6-2.5,3.6-3.6l24.6-3.5a8.2,8.2,0,0,0,5.8-4,114.8,114.8,0,0,0,10.9-26.4A7.8,7.8,0,0,0,234.8,150.4ZM128,172a44,44,0,1,1,44-44A44,44,0,0,1,128,172Z"]`
      )
      .click();
  }
);

When('I hover over the {string} feed', async function (this: ICustomWorld, feedTitle: string) {
  await this.page.locator(`//a[div[div[text()="${feedTitle}"]]]`).hover();
});

When(
  'I click on the {string} icon next to {string}',
  async function (this: ICustomWorld, iconName: string, feedTitle: string) {
    const icons = {
      gear: 'M234.8,150.4l-14.9-19.8c.1-1.8,0-3.7,0-5.1l14.9-19.9a7.8,7.8,0,0,0,1.3-6.9,114.8,114.8,0,0,0-10.9-26.4,8.2,8.2,0,0,0-5.8-4l-24.5-3.5-3.7-3.7-3.5-24.5a8.2,8.2,0,0,0-4-5.8,114.8,114.8,0,0,0-26.4-10.9,7.8,7.8,0,0,0-6.9,1.3L130.6,36h-5.2L105.6,21.2a7.8,7.8,0,0,0-6.9-1.3A114.8,114.8,0,0,0,72.3,30.8a8.2,8.2,0,0,0-4,5.8L64.8,61.1l-3.7,3.7L36.6,68.3a8.2,8.2,0,0,0-5.8,4A114.8,114.8,0,0,0,19.9,98.7a7.8,7.8,0,0,0,1.3,6.9l14.9,19.8v5.1L21.2,150.4a7.8,7.8,0,0,0-1.3,6.9,114.8,114.8,0,0,0,10.9,26.4,8.2,8.2,0,0,0,5.8,4l24.5,3.5,3.7,3.7,3.5,24.5a8.2,8.2,0,0,0,4,5.8,114.8,114.8,0,0,0,26.4,10.9,7.6,7.6,0,0,0,2.1.3,7.7,7.7,0,0,0,4.8-1.6L125.4,220h5.2l19.8,14.8a7.8,7.8,0,0,0,6.9,1.3,114.8,114.8,0,0,0,26.4-10.9,8.2,8.2,0,0,0,4-5.8l3.5-24.6c1.2-1.2,2.6-2.5,3.6-3.6l24.6-3.5a8.2,8.2,0,0,0,5.8-4,114.8,114.8,0,0,0,10.9-26.4A7.8,7.8,0,0,0,234.8,150.4ZM128,172a44,44,0,1,1,44-44A44,44,0,0,1,128,172Z'
    };
    console.log(icons[iconName]);
    const selector = `//a[div[div[text()="${feedTitle}"]]]/following-sibling::div/button/span[contains(@class, 'icon')]/*[name()='svg']/*[name()='path' and @d="${icons[iconName]}"]`;
    await this.page.locator(selector).click();
  }
);

When('I clear the text under {string}', async function (this: ICustomWorld, heading: string) {
  await this.page
    .locator(`//div[label[text()="${heading}"]]/following-sibling::div/div/div/input`)
    .fill('');
});

When(
  'I select the input under {string} and replace the original text with {string}',
  async function (this: ICustomWorld, heading: string, newText: string) {
    await this.page
      .locator(`//div[label[text()="${heading}"]]/following-sibling::div/div/div/input`)
      .fill('');
    await this.page
      .locator(`//div[label[text()="${heading}"]]/following-sibling::div/div/div/input`)
      .fill(`${newText}`);
  }
);

When('I click on the check mark button', async function (this: ICustomWorld) {
  await this.page.locator(`//button[@type="submit"]`).click();
});

When('I click on the {string} channel', async function (this: ICustomWorld, channelTitle: string) {
  await this.page.locator(`//a[div[div[text()="${channelTitle}"]]]`).click();
});

When('I click on the {string} feed', async function (this: ICustomWorld, feedTitle: string) {
  await this.page.locator(`//a[div[div[text()="${feedTitle}"]]]`).click();
});

Then('I see the {string} feed', async function (this: ICustomWorld, feedTitleText: string) {
  const selector = `//a[div[div[text()="${feedTitleText}"]]]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

Then(
  'I see the {string} feed tagline',
  async function (this: ICustomWorld, feedTaglineText: string) {
    const selector = `(//div[div]/following-sibling::div[text()="${feedTaglineText}"])[1]`;
    const locator = await this.page.locator(selector);
    await expect(locator).toBeVisible();
  }
);

Then(
  'I see {string} under {string}',
  async function (this: ICustomWorld, underTitle: string, titleText: string) {
    const selector = `(//div[div[text()="${titleText}"]]/following-sibling::div[text()="${underTitle}"])[1]`;
    await this.page.locator(selector).click();
  }
);

Then(
  'I see the {string} emoji next to {string}',
  async function (this: ICustomWorld, emojiName: string, feedTitle: string) {
    const selector = `//div[span[text()="${emojiName}"]]/following-sibling::div/div[text()="${feedTitle}"]`;
    await this.page.locator(selector).click();
  }
);

When(
  'I click on the toggle button next to {string}',
  async function (this: ICustomWorld, titleText: string) {
    await this.page.locator(`//button[div[text()="${titleText}"]]`).click();
  }
);

Then('I see the {string} text', async function (this: ICustomWorld, text: string) {
  const selector = `//p[text()="${text}"]`;
  await this.page.locator(selector).click();
});

When('I click on the {string} button', async function (this: ICustomWorld, btnText: string) {
  await this.page.locator(`//button[text()="${btnText}"]`).click();
});

Then('I see the {string} community', async function (this: ICustomWorld, titleText: string) {
  const selector = `//div[button[text()="Community Feeds"]]/following-sibling::div/div/a/div/div[text()="${titleText}"]`;
  const locator = await this.page.locator(selector);
  await expect(locator).toBeVisible();
});

When('I click on the profile icon', async function (this: ICustomWorld) {
  await this.page.locator(`//button[@id="headlessui-popover-button-9"]`).click();
});

Then(
  'I see the {string} Display Name',
  async function (this: ICustomWorld, displayNameText: string) {
    const selector = `//a[text()="${displayNameText}"]`;
    await this.page.locator(selector).click();
  }
);

Then('I see the {string} Handle', async function (this: ICustomWorld, handleText: string) {
  const selector = `//a[text()="${handleText}"]`;
  await this.page.locator(selector).click();
});

When('I wait for {string} seconds', async function (this: ICustomWorld, numberAsString: string) {
  const number = Number(`${numberAsString}000`);
  await this.page.waitForTimeout(number);
});
