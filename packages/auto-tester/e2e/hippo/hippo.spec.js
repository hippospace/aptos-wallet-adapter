const { bootstrap } = require('./bootstrap');

xdescribe('test hippo wallet extension', () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: process.env.TESRTER_PATH /*, slowMo: 50, devtools: true*/
    });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  xdescribe('hippo wallet extension', () => {
    it('should create a new wallet successfully', async () => {
      await extPage.bringToFront();

      // Wait until the page element loaded
      await extPage.waitForSelector('#create-wallet');

      // Create new wallet
      await extPage.click('#create-wallet');

      // Wait until next page element loaded
      await extPage.waitForSelector('#understood');
      await extPage.click('#understood');
      await extPage.click('#copy-mnemoic');
      await extPage.click('#continue-btn');

      // Wait until wallet name element loaded
      await extPage.waitForSelector('input[name="walletName"]');
      await extPage.type('input[name="walletName"]', 'wallet1');
      await extPage.click('#continue-btn');

      // Wait until password field loaded
      await extPage.waitForSelector('input[name="password"]');
      await extPage.type('input[name="password"]', '12345678');
      await extPage.type('input[name="confirmPassword"]', '12345678');
      await extPage.click('#agreement');
      await extPage.click('#create-btn');

      await extPage.waitForSelector('.coinItem');
      const coinLength = await extPage.$$eval('.coinItem', (ele) => ele.length);
      expect(coinLength).toEqual(1);
    });

    it('should connect to the extension', async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page()))
      );

      await appPage.click('#Hippo_Wallet');

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForSelector('#confirm-btn');
      await popupPage.click('#confirm-btn');

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

    it('should transfer token successfully', async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page()))
      );

      await appPage.click('#transferBtn');

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForSelector('.txDetails');
      await popupPage.click('#confirm-btn');

      await appPage.waitForSelector('.transaction');
      const txLength = await appPage.$$eval('.transaction', (ele) => ele.length);
      expect(txLength).toEqual(1);
    });

    it('should disconnect the wallet gracefully', async () => {
      await appPage.bringToFront();

      await appPage.click('#disconnectBtn');

      await appPage.waitForSelector('.connect-btn');
      const connectionBtnLength = await appPage.$$eval('.connect-btn', (ele) => ele.length);
      expect(connectionBtnLength).toEqual(4);
    });
  });

  // afterAll(async () => {
  //   await browser.close();
  // });
});
