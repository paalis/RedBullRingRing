#!/usr/bin/env node
/**
 * Produce the website's complete intro assets with the project's locked CLI.
 * Render into staging first; publish only after all selected renders succeed.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const videoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetRoot = resolve(videoRoot, '../site/assets');
const cli = join(videoRoot, 'node_modules/@remotion/cli/remotion-cli.js');
const argv = process.argv.slice(2);
const allowedFlags = new Set(['--desktop', '--mobile', '--posters-only', '--help']);
const help = `Usage: npm run render:intro -- [--desktop | --mobile] [--posters-only]

Default: render both website MP4s and their posters.
  --desktop       Render the desktop variant only.
  --mobile        Render the mobile variant only.
  --posters-only  Render only the selected variants' posters (frame 1470).

Environment:
  BROWSER_EXECUTABLE  Optional path to an existing Chrome/Chromium executable.
  RENDER_CONCURRENCY  Positive number of parallel rendering tabs (default: 2).

Assets are prepared automatically. Existing website media are retained until
every selected render succeeds. No website deployment is performed.
`;

if (argv.includes('--help')) {
  console.log(help);
  process.exit(0);
}
for (const flag of argv) {
  if (!allowedFlags.has(flag)) throw new Error(`Unknown option: ${flag}\n${help}`);
}
if (argv.includes('--desktop') && argv.includes('--mobile')) {
  throw new Error('Choose either --desktop or --mobile, or omit both to render both variants.');
}
const concurrency = process.env.RENDER_CONCURRENCY || '2';
if (!/^[1-9]\d*$/.test(concurrency)) {
  throw new Error('RENDER_CONCURRENCY must be a positive integer.');
}
const browser = process.env.BROWSER_EXECUTABLE;
if (browser && !existsSync(resolve(browser))) {
  throw new Error(`BROWSER_EXECUTABLE does not exist: ${browser}`);
}
if (!existsSync(cli)) throw new Error('Remotion is not installed. Run npm ci in video/ first.');

const variants = [
  {name: 'desktop', composition: 'RedBullRingIntro', crf: 22},
  {name: 'mobile', composition: 'RedBullRingIntroMobile', crf: 23},
].filter((variant) => {
  if (argv.includes('--desktop')) return variant.name === 'desktop';
  if (argv.includes('--mobile')) return variant.name === 'mobile';
  return true;
});
const postersOnly = argv.includes('--posters-only');
const browserArgs = browser ? [`--browser-executable=${resolve(browser)}`] : [];
let activeChild = null;
let interrupted = false;
let staging = null;
let keepStaging = false;

function interrupt() {
  interrupted = true;
  activeChild?.kill('SIGTERM');
}
process.once('SIGINT', interrupt);
process.once('SIGTERM', interrupt);

function runNode(args) {
  if (interrupted) throw new Error('Render interrupted.');
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: videoRoot,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    });
    activeChild = child;
    child.once('error', reject);
    child.once('close', (code, signal) => {
      activeChild = null;
      if (code === 0 && !interrupted) resolvePromise();
      else reject(new Error(`Command failed${signal ? ` (${signal})` : ` (exit ${code})`}: ${args.join(' ')}`));
    });
  });
}

function publish(outputs) {
  const backupRoot = join(staging, 'previous');
  mkdirSync(backupRoot);
  // Complete and validate every backup before changing any public filename.
  const entries = outputs.map((name) => {
    const source = join(staging, name);
    const destination = join(assetRoot, name);
    const backup = join(backupRoot, name);
    if (!statSync(source).isFile() || statSync(source).size === 0) {
      throw new Error(`Render did not produce a non-empty file: ${name}`);
    }
    const hadPrevious = existsSync(destination);
    if (hadPrevious) copyFileSync(destination, backup);
    return {name, source, destination, backup, hadPrevious};
  });
  const replaced = [];
  try {
    for (const entry of entries) {
      // Staging is under assetRoot, ensuring an atomic same-filesystem rename.
      renameSync(entry.source, entry.destination);
      replaced.push(entry);
    }
  } catch (error) {
    for (const entry of replaced.reverse()) {
      try {
        if (entry.hadPrevious) renameSync(entry.backup, entry.destination);
        else rmSync(entry.destination, {force: true});
      } catch (rollbackError) {
        keepStaging = true;
        console.error(`Could not restore ${entry.name}. Backup remains in ${backupRoot}: ${rollbackError.message}`);
      }
    }
    throw error;
  }
  for (const {destination} of entries) {
    console.log(`${relative(videoRoot, destination)} · ${(statSync(destination).size / 1_000_000).toFixed(2)} MB`);
  }
}

try {
  await runNode([join(videoRoot, 'scripts/prepare-assets.mjs')]);
  mkdirSync(assetRoot, {recursive: true});
  staging = mkdtempSync(join(assetRoot, '.intro-render-'));
  const outputs = [];
  for (const variant of variants) {
    if (!postersOnly) {
      const filename = `intro-${variant.name}.mp4`;
      console.log(`Rendering ${variant.composition} (${variant.name}, CRF ${variant.crf})…`);
      await runNode([
        cli, 'render', 'src/index.ts', variant.composition, join(staging, filename),
        '--codec=h264', '--pixel-format=yuv420p', `--crf=${variant.crf}`,
        '--audio-codec=aac', '--audio-bitrate=160k',
        `--concurrency=${concurrency}`, '--overwrite', ...browserArgs,
      ]);
      // Remotion 4.0.539 finalizes MP4s with -movflags faststart automatically.
      outputs.push(filename);
    }
    const poster = `intro-poster-${variant.name}.jpg`;
    console.log(`Rendering ${variant.name} poster at frame 1470 (49 s)…`);
    await runNode([
      cli, 'still', 'src/index.ts', variant.composition, join(staging, poster),
      '--frame=1470', '--image-format=jpeg', '--jpeg-quality=90',
      '--overwrite', ...browserArgs,
    ]);
    outputs.push(poster);
  }
  if (interrupted) throw new Error('Render interrupted before publishing.');
  publish(outputs);
  console.log('Intro assets are ready. Open the local website to inspect playback and controls.');
} catch (error) {
  console.error(`Intro render failed: ${error.message}`);
  process.exitCode = interrupted ? 130 : 1;
} finally {
  if (staging && !keepStaging) rmSync(staging, {recursive: true, force: true});
  process.removeListener('SIGINT', interrupt);
  process.removeListener('SIGTERM', interrupt);
}
