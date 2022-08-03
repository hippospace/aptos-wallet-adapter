/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { bootstrap } = require('./bootstrap');

describe('test hippo wallet extension', () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: 'http://localhost:3000' /*, slowMo: 50, devtools: true*/
    });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  describe('hippo wallet extension', () => {
    it('should create a new wallet successfully', async () => {
      await extPage.bringToFront();
      // await extPage.waitForNavigation();

      // Wait until the page element loaded
      await extPage.waitForSelector('#create-wallet');

      // Create new wallet
      const createBtn = await extPage.$('#create-wallet');
      // const existingBtn = await extPage.$('#existing-wallet');
      const createBtnText = await createBtn.evaluate((e) => e.innerText);
      // const existingBtnText = await existingBtn.evaluate((e) => e.innerText);
      expect(createBtnText).toEqual('CREATE WALLET');
      // expect(existingBtnText).toEqual('ALREADY HAVE WALLET');

      await createBtn.click();

      // Wait until next page element loaded
      await extPage.waitForSelector('#understood');
      const understoodCheckbox = await extPage.$('#understood');
      await understoodCheckbox.click();

      const copyMnemoicBtn = await extPage.$('#copy-mnemoic');
      await copyMnemoicBtn.click();

      const continueBtn = await extPage.$('#continue-btn');
      await continueBtn.click();

      // Wait until wallet name element loaded
      await extPage.waitForSelector('input[name="walletName"]');
      await extPage.type('input[name="walletName"]', 'wallet1');
      const continue2Btn = await extPage.$('#continue-btn');
      await continue2Btn.click();

      // Wait until password field loaded
      await extPage.waitForSelector('input[name="password"]');
      await extPage.type('input[name="password"]', '12345678');
      await extPage.type('input[name="confirmPassword"]', '12345678');
      const agreementCheckbox = await extPage.$('#agreement');
      await agreementCheckbox.click();
      const createWalletBtn = await extPage.$('#create-btn');
      await createWalletBtn.click();

      await extPage.waitForSelector('.coinItem');
      const coinLength = await extPage.$$eval('.coinItem', (ele) => ele.length);
      expect(coinLength).toEqual(1);
    });

    it('should connect to the extension', async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page()))
      );

      const connectBtn = await appPage.$('#Hippo_Wallet');
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until password field loaded
      await popupPage.waitForSelector('#confirm-btn');
      const connectionBtn = await popupPage.$('#confirm-btn');
      await connectionBtn.click();

      await appPage.waitForSelector('#address');
      const addressField = await appPage.$('#address');
      const publicKeyField = await appPage.$('#publicKey');
      const authKeyField = await appPage.$('#authKey');

      const address = await addressField.evaluate((e) => e.innerText);
      const publicKey = await publicKeyField.evaluate((e) => e.innerText);
      const authKey = await authKeyField.evaluate((e) => e.innerText);
      expect(address).not.toBe('');
      expect(publicKey).not.toBe('');
      expect(authKey).not.toBe('');
    });
  });

  // it('extension should create new wallet', async () => {
  //   await extPage.bringToFront();

  //   const createBtn = await extPage.$('#create-wallet');
  //   await createBtn.click();

  //   const copyMnemoicBtn = await extPage.$('#copy-mnemoic');
  //   await copyMnemoicBtn.click();

  //   const understoodCheckbox = await extPage.$('#understood');
  //   await understoodCheckbox.check();

  //   expect(understoodCheckbox).toEqual(true);
  // });

  // it('should render a button in the web application', async () => {
  //   // 1. When a user opens the React application
  //   appPage.bringToFront();
  //   // 1.1. The user should see a button on the web page
  //   const btn = await appPage.$('#Hippo_Wallet');
  //   const btnText = await btn.evaluate((e) => e.innerText);
  //   expect(btnText).toEqual('Hippo Wallet');
  //   // 2. Then the user clicks the button to display the text
  //   await btn.click();

  //   // 3. When the user goes to the chrome extension
  //   await extPage.bringToFront();

  //   // 4. When the user writes the word "music" and its replacement "**TEST**"
  //   // in the extension and the user clicks on the "replace" button
  //   // const fromInput = await extPage.$('#from');
  //   // await fromInput.type('music');
  //   // const toInput = await extPage.$('#to');
  //   // await toInput.type('**TEST**');
  //   // const replaceBtn = await extPage.$('#replace');
  //   // await replaceBtn.click();

  //   // // 5. When the user goes back to the website
  //   // appPage.bringToFront();
  //   // const textEl = await appPage.$('.text');
  //   // const text = await textEl.evaluate((e) => e.innerText);
  //   // // 5.1. Then the user should see the string "**TEST**" on the page
  //   // expect(text).toEqual(expect.stringContaining('**TEST**'));
  //   // // 5.2 Then the user should no longer see the string "music" on the page
  //   // expect(text).toEqual(expect.not.stringContaining('music'));
  // });

  // afterAll(async () => {
  //   await browser.close();
  // });
});
