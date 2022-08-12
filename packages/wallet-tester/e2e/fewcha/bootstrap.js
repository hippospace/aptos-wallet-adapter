/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');
const extensionId = 'ebfidpplhabeedpnhjnobghokpiioolj';
const extentionPath = process.env.FEWCHA_EXT_PATH;

const bootstrap = async (options = {}) => {
  const { devtools = false, slowMo = false, appUrl } = options;
  const browser = await puppeteer.launch({
    headless: true,
    devtools,
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    args: [`--disable-extensions-except=${extentionPath}`, `--load-extension=${extentionPath}`],
    ...(slowMo && { slowMo })
  });

  const appPage = await browser.newPage();
  await appPage.goto(appUrl, { waitUntil: 'load' });

  const extPage = await browser.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/index.html`;
  await extPage.goto(extensionUrl, { waitUntil: 'domcontentloaded' });

  return {
    appPage,
    browser,
    extensionUrl,
    extPage
  };
};

module.exports = { bootstrap };
