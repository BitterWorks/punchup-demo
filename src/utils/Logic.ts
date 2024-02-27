/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable indent */

import { faker } from '@faker-js/faker/locale/en_US';

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
  return `${baseEmail.split('@')[0]}.${timestamp}@${'0fxrlxug.mailosaur.net'}`;
}

type MailosaurParams = {
  subject?: string;
  sentTo?: string;
  receivedAfter?: Date;
  timeout?: number;
};
export async function getLastMail(params: MailosaurParams = {}) {
  // Available in the API tab of a server
  const apiKey = 'SAVDhLDdHGQOiFw84ydfoxL3lSulWf6P';

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MailosaurClient = require('mailosaur');
  const mailosaur = new MailosaurClient(apiKey);

  const email = await mailosaur.messages.get('0fxrlxug', params);
  return email;
}
