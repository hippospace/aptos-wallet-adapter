const { bootstrap } = require("./bootstrap");
const walletId = "#Pontem";

describe("test pontem wallet extension", () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: "http://localhost:3000" /*, slowMo: 50, devtools: true*/,
    });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  describe("pontem wallet extension", () => {
    it("should create a new wallet successfully", async () => {
      await extPage.bringToFront();

      // Wait until the page element loaded
      await extPage.waitForSelector('a[href="#/auth/create"]');

      // Create new wallet
      await extPage.click('a[href="#/auth/create"]');

      // Wait until password field loaded
      await extPage.waitForSelector('input[name="password"]');
      await extPage.type('input[name="password"]', "12345678");
      await extPage.type('input[name="confirm"]', "12345678");
      await extPage.$eval('input[type="checkbox"]', (check) => check.click());
      await extPage.click('button[type="submit"]');

      // Wait until mnemonic loaded
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 4`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[2].click()
      );

      // Checkbox
      await extPage.$eval('input[type="checkbox"]', (check) => check.click());

      // Wait for the mnemonic to show and click next button
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 3`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[2].click()
      );

      // Wait for the mnemonic to show and click next button
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 9`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[5].click()
      );

      // wait for faucet
      await extPage.waitForFunction(
        "document.querySelector('h2').innerText.includes('0.01')"
      );
      const text = await extPage.$eval("h2", (e) => e.innerText);
      expect(text).toContain("0.01");
    });

    xit("should connect to the extension", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForSelector('button[type="submit"]');
      await popupPage.click('button[type="submit"]');

      await popupPage.waitForSelector(".connect-success--screen");
      await popupPage.click('button[type="button"]');

      await appPage.waitForSelector("#address");
      const addressField = await appPage.$("#address");
      const publicKeyField = await appPage.$("#publicKey");
      const authKeyField = await appPage.$("#authKey");

      const address = await addressField.evaluate((e) => e.innerText);
      const publicKey = await publicKeyField.evaluate((e) => e.innerText);
      const authKey = await authKeyField.evaluate((e) => e.innerText);
      expect(address).not.toBe("");
      expect(publicKey).not.toBe("");
      expect(authKey).toBe("");
    });

    xit("should transfer token successfully", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const transferBtn = await appPage.$("#transferBtn");
      await transferBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForSelector('button[type="submit"]');
      await popupPage.click('button[type="submit"]');

      await appPage.waitForSelector(".transaction");
      const txLength = await appPage.$$eval(
        ".transaction",
        (ele) => ele.length
      );
      expect(txLength).toEqual(1);
    });

    xit("should disconnect the wallet gracefully", async () => {
      await appPage.bringToFront();

      const disconnectBtn = await appPage.$("#disconnectBtn");
      await disconnectBtn.click();

      await appPage.waitForSelector(".connect-btn");
      const connectionBtnLength = await appPage.$$eval(
        ".connect-btn",
        (ele) => ele.length
      );
      expect(connectionBtnLength).toEqual(6);
    });

    xit("should display user reject connection", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForSelector('button[type="button"]');
      await popupPage.click('button[type="button"]');

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("User has rejected the connection");
    });

    xit("should connect to the extension again successfully after disconnect", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForSelector('button[type="submit"]');
      await popupPage.click('button[type="submit"]');

      await popupPage.waitForSelector(".connect-success--screen");
      await popupPage.click('button[type="button"]');

      await appPage.waitForSelector("#address");
      const addressField = await appPage.$("#address");
      const publicKeyField = await appPage.$("#publicKey");
      const authKeyField = await appPage.$("#authKey");

      const address = await addressField.evaluate((e) => e.innerText);
      const publicKey = await publicKeyField.evaluate((e) => e.innerText);
      const authKey = await authKeyField.evaluate((e) => e.innerText);
      expect(address).not.toBe("");
      expect(publicKey).not.toBe("");
      expect(authKey).not.toBe(null);
    });

    xit("should display user reject transaction", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const transferBtn = await appPage.$("#transferBtn");
      await transferBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForSelector('button[type="button"]');
      await popupPage.evaluate(() =>
        document.querySelector('button[type="button"]').click()
      );

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("User has rejected the transaction");
    });
  });

  // afterAll(async () => {
  //   await browser.close();
  // });
});
