const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2], fps = 30, dur = 12;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8078/brag-output/work/stage.html');
  await p.evaluate(() => window.ready);
  for (let f = 0; f < fps * dur; f++) {
    await p.evaluate(t => window.render(t), f / fps);
    await p.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 95 });
  }
  await b.close();
})();
