/* eslint-disable no-console */
import { ICustomWorld } from '../support/custom-world';
import {
  downloadFromUrl,
  generateUniqueEmail,
  getFakerValue,
  getLastMail,
  nthToNumber
} from '../utils/Logic';
import { Given, Then, When } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { Context } from 'vm';
// import { federalFormSections } from '../utils/_shared/Consts';

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
  const selector =
    '(' +
    [
      `//a[text()="${btnText}"]`,
      `(//button[normalize-space()="${btnText}"])[1]`,
      `//button[.//text()="${btnText}"]`
      // `//input[@value="${btnText}"]`,
      // `//button[text()="${btnText}"]`,
      // `//a[contains(normalize-space(),"${btnText}")]`
    ].join(' | ') +
    ')';
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

// When(
//   'I input {string} under {string} for {string}',
//   async function (this: ICustomWorld, inputValue: string, inputLabel: string, boxTitle: string) {
//     if (inputValue) {
//       const boxTitle2 = boxTitle.replaceAll('...', '');
//       const inputLabel2 = inputLabel.replaceAll('...', '');
//       const selector = `//div[@class="card" and div[b[contains(text(),"${boxTitle2}")]]]//*[label[normalize-space()="${inputLabel2}" or contains(text(), "${inputLabel2}") or .//text()="${inputLabel2}"]]//input`;
//       await this.fillInput(inputLabel2, inputValue, selector);
//     }
//   }
// );

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

// When(
//   'I select {string} under {string} for {string}',
//   async function (this: ICustomWorld, selectValue: string, selectLabel: string, boxTitle: string) {
//     if (selectValue) {
//       const boxTitle2 = boxTitle.replaceAll('...', '');
//       const selector = `//div[@class="card" and div[b[contains(text(),"${boxTitle2}")]]]//*[label[text()="${selectLabel}" or .//text()="${selectLabel}"]]//select`;
//       await this.selectOption(selectValue, selectLabel, selector);
//     }
//   }
// );

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

// When('I am at the {string} step', async function (this: ICustomWorld, stepTitle: string) {
//   const stepSection = federalFormSections.find((section) => section.steps.includes(stepTitle));
//   let currentSection = (await this.page.locator('li[class*=current] > a').textContent()).trim();
//   let currentStepTitle = (await this.page.locator('h1').textContent()).trim();
//   while (currentStepTitle !== stepTitle) {
//     if (currentSection !== stepSection.title) {
//       const sectionLocator = this.page.locator(`//li[a[contains(text(),"${currentStepTitle}")]]`);
//       const isSectionCompleted = (await sectionLocator.getAttribute('class')).includes('completed');
//       if (isSectionCompleted) {
//         await sectionLocator.hover();
//         const sectionOverviewBtnLocator = '//li/a[text()="Overview"]';
//         await this.page.locator(sectionOverviewBtnLocator).click();
//       } else {
//         // Continue to complete the section
//       }
//     }
//   }
// });

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

// Step for testing PDF downloads
// When('I download some PDF', async function (this: ICustomWorld) {
//   console.log(await this.context.pages());
//   await this.page.goto('https://robstarbuck.uk/cv');
//   await this.page.waitForLoadState('load');
//   const url = await this.page.getByRole('link', { name: 'PDF ↓' }).getAttribute('href');
//   console.log(url);
//   await downloadFromUrl(url, './test.pdf');
// });

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
        timeout: 5000
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
    await this.page.waitForTimeout(3000);
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
