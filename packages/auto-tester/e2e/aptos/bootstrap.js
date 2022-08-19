/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');
const extentionPath = process.env.APTOS_EXT_PATH;

const bootstrap = async (options = {}) => {
  const { devtools = false, slowMo = false, appUrl } = options;
  const browser = await puppeteer.launch({
    headless: false,
    devtools,
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    args: [`--disable-extensions-except=${extentionPath}`, `--load-extension=${extentionPath}`],
    ...(slowMo && { slowMo })
  });

  const appPage = await browser.newPage();
  await appPage.goto(appUrl, { waitUntil: 'load' });

  const targets = await browser.targets();
  const extensionTarget = targets.find((target) => target.type() === 'service_worker');
  const partialExtensionUrl = extensionTarget.url() || '';
  const [, , extensionId] = partialExtensionUrl.split('/');

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
