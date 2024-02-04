/* eslint-disable no-console */
import { ICustomWorld } from '../support/custom-world';
import { downloadFromUrl, nthToNumber } from '../utils/Logic';
import { Given, Then, When } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
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

Given('I am at the {string} page', async function (this: ICustomWorld, pagePath: string) {
  let url = process.env.BASE_URL + pagePath;
  let protocol = '';
  const urlOrigin = url.replace(/^(https?|http):\/\//, (_match, capturedProtocol) => {
    protocol = capturedProtocol + '://';
    return '';
  });
  url = `${protocol}${process.env.BASIC_AUTH_CREDENTIALS}@${urlOrigin}`;
  const authenticatedUrl = new URL(url);
  await this.page.goto(authenticatedUrl.href);
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
      `//a[.//text()="${btnText}"]`,
      `//input[@value="${btnText}"]`,
      `//button[text()="${btnText}"]`,
      `//a[contains(normalize-space(),"${btnText}")]`
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

When(
  'I input {string} under {string} for {string}',
  async function (this: ICustomWorld, inputValue: string, inputLabel: string, boxTitle: string) {
    if (inputValue) {
      const boxTitle2 = boxTitle.replaceAll('...', '');
      const inputLabel2 = inputLabel.replaceAll('...', '');
      const selector = `//div[@class="card" and div[b[contains(text(),"${boxTitle2}")]]]//*[label[normalize-space()="${inputLabel2}" or contains(text(), "${inputLabel2}") or .//text()="${inputLabel2}"]]//input`;
      await this.fillInput(inputLabel2, inputValue, selector);
    }
  }
);

When(
  'I input {string} under {string}',
  async function (this: ICustomWorld, inputValue: string, inputLabel: string) {
    if (inputValue) {
      const inputLabel2 = inputLabel.replaceAll('...', '');
      await this.fillInput(inputLabel2, inputValue, null);
    }
  }
);

When(
  'I attach the value for the {string} input as {string}',
  async function (this: ICustomWorld, inputLabel: string, attachmentKey: string) {
    const inputLabel2 = inputLabel.replaceAll('...', '');
    const inputSelector = `//*[label[normalize-space()="${inputLabel2}" or contains(text(), "${inputLabel2}") or .//text()="${inputLabel2}"]]//input`;
    const inputValue = await this.page.locator(inputSelector).inputValue();
    this.attachments[attachmentKey] = inputValue;
  }
);

When(
  'I select {string} under {string} for {string}',
  async function (this: ICustomWorld, selectValue: string, selectLabel: string, boxTitle: string) {
    if (selectValue) {
      const boxTitle2 = boxTitle.replaceAll('...', '');
      const selector = `//div[@class="card" and div[b[contains(text(),"${boxTitle2}")]]]//*[label[text()="${selectLabel}" or .//text()="${selectLabel}"]]//select`;
      await this.selectOption(selectValue, selectLabel, selector);
    }
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

When('I continue until the {string} step', async function (this: ICustomWorld, stepName: string) {
  while (true) {
    const titleLocator = this.page.locator('h1');
    const currentStepTitle = await titleLocator.textContent();
    const currentStepTitleTrimmed = currentStepTitle.trim();
    if (currentStepTitleTrimmed === stepName) {
      return;
    }
    if (currentStepTitleTrimmed === 'Federal Refund') {
      await this.pickOption(
        'How would you like to receive your federal refund?',
        'Direct deposit to a bank account'
      );
    } else if (currentStepTitleTrimmed === 'ezService Fee') {
      await this.pickOption('Please select from the following payment options', 'Credit card');
    } else if (currentStepTitleTrimmed === 'ezCheckout') {
      await this.fillInput('Card number', '9999-9999-9999-9999', null);
      await this.selectOption('Visa', 'Card type', null);
      await this.selectOption('April-2026', 'Expiration date', null);
      await this.fillInput('Security code', '999', null);
    } else if (currentStepTitle === 'Identity Verification') {
      await this.pickOption(
        'Tell us how you would like to receive a verification code',
        'email to...'
      );
      // Pick "email to..." under "Tell us how you would like to receive a verification code"
    }
    const stepsToWaitFor = [
      'Federal Signature',
      'Audit Defense Protection',
      'Amended Return Insurance',
      'Viewing Your Tax Return'
    ];
    if (stepsToWaitFor.includes(currentStepTitleTrimmed)) {
      await this.page.waitForTimeout(5000);
    }
    if (currentStepTitleTrimmed === 'Identity Verification') {
      const errorMsg =
        'The system needs human validation to bypass the "Identity Verification" step. Login and create';
      this.attachments['Error'] = errorMsg;
      throw Error(errorMsg);
    }
    const selector =
      '(' +
      [
        `//a[.//text()="Continue"]`,
        `//input[@value="Continue"]`,
        `//button[text()="Continue"]`,
        `//a[.//text()="Save & Continue"]`,
        `//input[@value="Save & Continue"]`,
        `//button[text()="Save & Continue"]`,
        `//input[@value="Submit Payment"]`
      ].join(' | ') +
      ')';
    const locator = this.page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    await this.page.waitForLoadState();
  }
});

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

When('I reset my account if I have already e-filed', async function (this: ICustomWorld) {
  const efileStatusSelector = '//b[contains(text(), "Your return has been e-filed")]';
  const efileSatus = this.page.locator(efileStatusSelector);
  if (await efileSatus.count()) {
    await this.page.locator('//a[contains(text(), "Reset account")]').click();
    const usernameInputLabel = 'Username';
    const userNameInputValue = this.attachments['username'];
    const usernameInputSelector = `//*[label[normalize-space()="${usernameInputLabel}" or contains(text(), "${usernameInputLabel}") or .//text()="${usernameInputLabel}"]]//input`;
    await this.fillInput(usernameInputLabel, userNameInputValue, usernameInputSelector);
    const passwordInputLabel = 'Password';
    const passwordInputValue = this.attachments['password'];
    const passwordInputSelector = `//*[label[normalize-space()="${passwordInputLabel}" or contains(text(), "${passwordInputLabel}") or .//text()="${passwordInputLabel}"]]//input`;
    await this.fillInput(passwordInputLabel, passwordInputValue, passwordInputSelector);
    const continueBtnSelector =
      '(' + [`//a[.//text()="Continue"]`, `//input[@value="Continue"]`].join(' | ') + ')';
    await this.page.locator(continueBtnSelector).click();
  }
});

When('I validate my account if prompted to', async function (this: ICustomWorld) {
  // try {
  await this.page.waitForSelector('//h1[contains(text(),"Help Us Verify Your Identity")]', {
    timeout: 5000
  });
  await this.pickOption('...@...', 'Help Us Verify Your Identity');
  // } catch (e) { }
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
      await this.fillInput(inputLabel2, inputValue, null);
    }
  }
);

Then('I solve the reCaptcha', async function (this: ICustomWorld) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await this.page.solveRecaptchas();
});
