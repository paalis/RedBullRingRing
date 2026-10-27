const { chromium } = require('playwright');
(async () => {
  const [,, out, ...ts] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8078/brag-output/work/stage.html');
  await p.evaluate(() => window.ready);
  for (const t of ts) {
    await p.evaluate(t => window.render(+t), t);
    await p.screenshot({ path: `${out}/still-${t}.png` });
  }
  await b.close();
})();
