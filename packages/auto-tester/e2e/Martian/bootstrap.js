/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');
const extentionPath = process.env.MARTIAN_EXT_PATH;

const bootstrap = async (options = {}) => {
  const { devtools = false, slowMo = false, appUrl } = options;
  const browser = await puppeteer.launch({
    headless: false,
    devtools,
    args: [`--disable-extensions-except=${extentionPath}`, `--load-extension=${extentionPath}`],
    ...(slowMo && { slowMo })
  });

  const appPage = await browser.newPage();
  await appPage.goto(appUrl, { waitUntil: 'load' });

  // const extPage = await browser.newPage();
  // const extensionUrl = `chrome-extension://${extensionId}/onboarding/onboarding.html`;
  // await extPage.goto(extensionUrl, { waitUntil: 'domcontentloaded' });

  // const onboardingPage = await browser.newPage();
  // const onboardingUrl = `chrome-extension://${extensionId}/onboarding/onboarding.html`;
  // await onboardingPage.goto(onboardingUrl, { waitUntil: 'domcontentloaded' });

  return {
    appPage,
    browser
    // extensionUrl,
    // extPage
  };
};

module.exports = { bootstrap };
