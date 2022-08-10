/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { bootstrap } = require('./bootstrap');

describe('test hippo wallet extension', () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: 'http://localhost:3030' /*, slowMo: 50, devtools: true*/
    });

    // extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  describe('fewcha wallet extension', () => {
    it('should create a new wallet successfully', async () => {
      const pages = await browser.pages();

      const onboardingPage = await pages[pages.length - 1];
      await onboardingPage.bringToFront();

      // Wait until the page element loaded
      await onboardingPage.waitForSelector('button[type="button"]');

      // // Create new wallet
      await onboardingPage.click('button[type="button"]');

      // // // Wait until wallet name element loaded
      // // await extPage.waitForSelector('input[name="walletName"]');
      // // await extPage.type('input[name="walletName"]', 'wallet1');
      // // const continue2Btn = await extPage.$('#continue-btn');
      // // await continue2Btn.click();

      // // Wait until password field loaded
      // await onboardingPage.waitForSelector('input[type="password"]');
      // await onboardingPage.type('input[type="password"]', '12345678');
      // // await onboardingPage.type('input[name="confirmPassword"]', '12345678');
      // await onboardingPage.$eval('input[type="checkbox"]', (check) => check.parentElement.click());
      // await onboardingPage.click('button[type="button"]');

      // // Wait until mnemonic loaded
      // await onboardingPage.waitForSelector('button[type="button"]');
      // await onboardingPage.click('button[type="button"]');

      // // Wait for Finish button
      // await onboardingPage.waitForSelector('button[type="button"]');
      // await onboardingPage.click('button[type="button"]');

      // await onboardingPage.waitForSelector('button[type="button"]');
      // await onboardingPage.click('button[type="button"]');

      // await extPage.waitForSelector('button[type="submit"]');
      // await extPage.click('button[type="submit"]');

      // await extPage.waitForSelector('.balance');
      // const text = await extPage.$eval('.balance', (e) => e.innerText);
      // // await extPage.click('header a:nth-child(1)');
      // // await extPage.click('.sidebar button[type="button"]');
      // // const coinLength = await extPage.$$eval('.coinItem', (ele) => ele.length);
      // expect(text).toEqual('0');
    });

    xit('should connect to the extension', async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page()))
      );

      const connectBtn = await appPage.$('#Fewcha_Wallet');
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForSelector('button[type="submit"]');
      await popupPage.click('button[type="submit"]');

      await popupPage.waitForSelector('.connect-success--screen');
      // await popupPage.click('button[type="button"]');

      // await appPage.waitForSelector('#address');
      // const addressField = await appPage.$('#address');
      // const publicKeyField = await appPage.$('#publicKey');
      // const authKeyField = await appPage.$('#authKey');

      // const address = await addressField.evaluate((e) => e.innerText);
      // const publicKey = await publicKeyField.evaluate((e) => e.innerText);
      // const authKey = await authKeyField.evaluate((e) => e.innerText);
      // expect(address).not.toBe('');
      // expect(publicKey).not.toBe('');
      // expect(authKey).not.toBe(null);
    });

    xit('should transfer token successfully', async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page()))
      );

      const transferBtn = await appPage.$('#transferBtn');
      await transferBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForSelector('.txDetails');
      const confirmBtn = await popupPage.$('#confirm-btn');
      await confirmBtn.click();

      await appPage.waitForSelector('.transaction');
      const txLength = await appPage.$$eval('.transaction', (ele) => ele.length);
      expect(txLength).toEqual(1);
    });

    xit('should disconnect the wallet gracefully', async () => {
      await appPage.bringToFront();

      const disconnectBtn = await appPage.$('#disconnectBtn');
      await disconnectBtn.click();

      await appPage.waitForSelector('.connect-btn');
      const connectionBtnLength = await appPage.$$eval('.connect-btn', (ele) => ele.length);
      expect(connectionBtnLength).toEqual(4);
    });
  });

  // afterAll(async () => {
  //   await browser.close();
  // });
});
