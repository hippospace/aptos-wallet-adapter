/* eslint-disable @typescript-eslint/quotes */
const { bootstrap } = require("./bootstrap");
const walletId = "#Bitkeep";

describe("test bitkeep wallet extension", () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: "http://localhost:3000" /*, slowMo: 50, devtools: true*/,
    });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  describe("bitkeep wallet extension", () => {
    it("should create a new wallet successfully", async () => {
      await extPage.bringToFront();

      // Wait until the page element loaded
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );

      // Create new wallet
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[0].click()
      );

      // Wait until password field loaded
      await extPage.waitForSelector('input[name="initialPassword"]');
      await extPage.type('input[name="initialPassword"]', "TT23456!!");
      await extPage.type('input[name="confirmPassword"]', "TT23456!!");
      await extPage.$eval('input[name="termsOfService"]', (check) =>
        check.parentElement.click()
      );
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 4`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Wait until mnemonic loaded
      await extPage.waitForFunction(
        "document.querySelectorAll('input[readOnly]').length === 12"
      );
      await extPage.$eval('input[name="secretRecoveryPhrase"]', (check) =>
        check.parentElement.click()
      );
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Wait for Finish button
      await extPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 1`
      );
      await extPage.$$eval('button[type="button"]', (elements) =>
        elements[0].click()
      );
    });

    it("should connect to the extension", async () => {
      await extPage.close();
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await popupPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

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

    it("should request faucet successfully", async () => {
      await appPage.bringToFront();

      const faucetBtn = await appPage.$("#faucetBtn");
      await faucetBtn.click();

      await appPage.waitForSelector(".faucet");
      const txLength = await appPage.$$eval(".faucet", (ele) => ele.length);
      expect(txLength).toEqual(1);
    });

    it("should transfer token successfully", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const transferBtn = await appPage.$("#transferBtn");
      await transferBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await popupPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      await appPage.waitForSelector(".transaction");
      const txLength = await appPage.$$eval(
        ".transaction",
        (ele) => ele.length
      );
      expect(txLength).toEqual(1);
    });

    it("should disconnect the wallet gracefully", async () => {
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

    it("should display user reject connection", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await popupPage.$$eval('button[type="button"]', (elements) =>
        elements[0].click()
      );

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("The user rejected the request");
    });

    it("should connect to the extension again successfully after disconnect", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const connectBtn = await appPage.$(walletId);
      await connectBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until connection modal loaded
      await popupPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await popupPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

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

    it("should display user reject transaction", async () => {
      await appPage.bringToFront();
      const popupPagePromise = new Promise((x) =>
        browser.once("targetcreated", (target) => x(target.page()))
      );

      const transferBtn = await appPage.$("#transferBtn");
      await transferBtn.click();

      const popupPage = await popupPagePromise;
      await popupPage.bringToFront();

      // Wait until confirmation modal loaded
      await popupPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await popupPage.$$eval('button[type="button"]', (elements) =>
        elements[0].click()
      );

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("The user rejected the request");
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
