/* eslint-disable @typescript-eslint/quotes */
const { bootstrap } = require("./bootstrap");
const walletId = "#Martian";

describe("test martian wallet extension", () => {
  let appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({
      appUrl: process.env.TESRTER_PATH /*, slowMo: 50, devtools: true*/,
    });

    appPage = context.appPage;
    browser = context.browser;
  });

  describe("martian wallet extension", () => {
    it("should create a new wallet successfully", async () => {
      const pages = await browser.pages();

      const onboardingPage = await pages[pages.length - 1];
      await onboardingPage.bringToFront();

      // Wait until the page element loaded
      await onboardingPage.waitForSelector('button[type="button"]');

      // Create new wallet
      await onboardingPage.$eval('button[type="button"]', (check) =>
        check.click()
      );

      // Wait until password field loaded
      await onboardingPage.waitForSelector('input[type="password"]');
      await onboardingPage.type('input[type="password"]', "12345678");
      const allPasswordFields = await onboardingPage.$$(
        'input[type="password"]'
      );
      const confirmPassword = allPasswordFields[allPasswordFields.length - 1];
      await confirmPassword.type("12345678");
      await onboardingPage.$eval('input[type="checkbox"]', (check) =>
        check.click()
      );
      await onboardingPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Pass mnemonic page
      await onboardingPage.waitForFunction(
        "document.querySelectorAll('p').length === 6"
      );
      await onboardingPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Pass shortcut page
      await onboardingPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 3`
      );
      await onboardingPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Pass finish page
      await onboardingPage.waitForFunction(
        `document.querySelectorAll('button[type="button"]').length === 2`
      );
      await onboardingPage.$$eval('button[type="button"]', (elements) =>
        elements[elements.length - 1].click()
      );

      // Request Faucet
      const targets = await browser.targets();
      const extensionTarget = targets.find(
        (target) => target.type() === "service_worker"
      );
      const partialExtensionUrl = extensionTarget.url() || "";
      const [, , extensionId] = partialExtensionUrl.split("/");

      const extPage = await browser.newPage();
      const extensionUrl = `chrome-extension://${extensionId}/index.html`;
      await extPage.goto(extensionUrl, { waitUntil: "domcontentloaded" });
      await extPage.bringToFront();

      // Login
      await extPage.waitForSelector('input[type="password"]');
      await extPage.type('input[type="password"]', "12345678");
      await extPage.click("button");

      await extPage.waitForFunction(
        "document.querySelectorAll('button').length === 2"
      );
      await extPage.click("button");

      await extPage.waitForFunction(
        "document.querySelector('h1').innerText.includes('20000')"
      );
      const text = await extPage.$eval("h1", (e) => e.innerText);
      expect(text).toEqual("20000");
    });

    it("should connect to the extension", async () => {
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
        "document.querySelectorAll('div').length === 12"
      );
      await popupPage.$$eval("div", (elements) => elements[9].click());

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
        "document.querySelectorAll('div').length === 13"
      );
      await popupPage.$$eval("div", (elements) => elements[10].click());

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
        "document.querySelectorAll('div').length === 12"
      );
      await popupPage.$$eval("div", (elements) => elements[10].click());

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("User rejected the request");
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
        "document.querySelectorAll('div').length === 12"
      );
      await popupPage.$$eval("div", (elements) => elements[9].click());

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
        "document.querySelectorAll('div').length === 13"
      );
      await popupPage.$$eval("div", (elements) => elements[11].click());

      await appPage.waitForSelector(
        ".ant-message-custom-content.ant-message-error"
      );
      const errMsg = await appPage.$$eval(
        ".ant-message-custom-content.ant-message-error span",
        (elements) => elements[elements.length - 1].innerText
      );
      expect(errMsg).toEqual("User Rejected the request");
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
