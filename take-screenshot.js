const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('Filling login form...');
  await page.type('input[type="email"]', 'admin@edumerge.com');
  await page.type('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');

  console.log('Waiting for dashboard...');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for animations to settle
  await new Promise(r => setTimeout(r, 3000));

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'docs/dashboard-preview.png', fullPage: false });

  console.log('Screenshot saved to docs/dashboard-preview.png');
  await browser.close();
  process.exit(0);
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
