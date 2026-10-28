#!/usr/bin/env node
/**
 * Refresh the video's local assets from the real website and normalize the
 * supplied soundtrack. No site code is evaluated, and no files are fetched.
 *
 * From video/:
 *   node scripts/prepare-assets.mjs [path/to/f1theme.m4a]
 *
 * With no argument the retained public/audio/f1theme-source.m4a is used.
 * Requires FFmpeg/FFprobe on PATH, or the installed Remotion CLI fallback.
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const videoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(videoRoot, '..');
const siteRoot = join(repoRoot, 'site');
const publicRoot = join(videoRoot, 'public');
const audioRoot = join(publicRoot, 'audio');
const retainedSource = join(audioRoot, 'f1theme-source.m4a');
const normalizedAudio = join(audioRoot, 'f1theme.wav');
const suppliedSource = process.argv[2] ? resolve(process.argv[2]) : retainedSource;
const analyzedSourceSha256 = '4a56fc218e1247aaf9a5688719f45914f701fca381ec9bc691fc52a48ec5ca7c';

if (process.argv.length > 3 || process.argv.includes('--help')) {
  console.log('Usage: node scripts/prepare-assets.mjs [path/to/f1theme.m4a]');
  process.exit(process.argv.includes('--help') ? 0 : 1);
}

function runMediaTool(tool, args) {
  let result = spawnSync(tool, args, {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    cwd: videoRoot,
  });
  if (result.error?.code === 'ENOENT') {
    const cli = join(videoRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
    if (!existsSync(cli)) {
      throw new Error(`${tool} was not found. Run npm ci in video/, or install FFmpeg.`);
    }
    result = spawnSync(process.execPath, [cli, tool, ...args], {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      cwd: videoRoot,
    });
  }
  if (result.error || result.status !== 0) {
    throw new Error(`${tool} failed: ${result.error?.message || result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function probe(path) {
  return JSON.parse(runMediaTool('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration,size:stream=codec_name,sample_rate,channels,start_time,duration',
    '-of', 'json', path,
  ]));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function readCrew() {
  const source = readFileSync(join(siteRoot, 'app.js'), 'utf8');
  const literal = source.match(/const\s+CREW\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!literal) throw new Error('Could not find the literal CREW array in site/app.js.');
  // The existing CREW array uses JSON-compatible double-quoted values. Convert
  // property keys and trailing commas only; never run app.js or use eval().
  const json = literal[1]
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/,\s*([}\]])/g, '$1');
  const crew = JSON.parse(json);
  if (!Array.isArray(crew) || crew.length === 0) throw new Error('CREW must be a non-empty array.');
  return crew.map((person) => {
    for (const key of ['name', 'fullName', 'code', 'home', 'role', 'team', 'photo']) {
      if (typeof person[key] !== 'string') throw new Error(`CREW.${key} must be a string.`);
    }
    if (!Number.isInteger(person.number)) throw new Error('CREW.number must be an integer.');
    const asset = (path) => {
      if (typeof path !== 'string' || !/^assets\/crew\/[a-z0-9-]+\.webp$/.test(path)) {
        throw new Error(`Unexpected local crew asset path: ${path}`);
      }
      if (!existsSync(join(siteRoot, path))) throw new Error(`Missing crew image: ${path}`);
      return path.slice('assets/'.length);
    };
    const photo = asset(person.photo);
    return {
      id: photo.slice('crew/'.length, -'.webp'.length),
      name: person.name,
      fullName: person.fullName,
      code: person.code,
      number: person.number,
      home: person.home,
      role: person.role,
      team: person.team,
      photo,
      photos: {close: asset(person.photos?.close), wide: asset(person.photos?.wide)},
    };
  });
}

function readCircuit() {
  const html = readFileSync(join(siteRoot, 'index.html'), 'utf8');
  const svg = html.match(/<svg\b[^>]*class=["'][^"']*\bhero-track\b[^"']*["'][^>]*>[\s\S]*?<\/svg>/);
  const viewBox = svg?.[0].match(/\bviewBox=["']([^"']+)["']/)?.[1];
  const path = svg?.[0].match(/<path\b[^>]*\sd=["']([^"']+)["']/)?.[1];
  if (!viewBox || !path) throw new Error('Could not read the existing hero-track SVG from site/index.html.');
  return {viewBox, path};
}

if (!existsSync(suppliedSource)) {
  throw new Error('Soundtrack missing. Pass the supplied f1theme.m4a as the first argument.');
}

mkdirSync(audioRoot, {recursive: true});
if (suppliedSource !== retainedSource) copyFileSync(suppliedSource, retainedSource);
for (const folder of ['crew', 'fonts']) {
  cpSync(join(siteRoot, 'assets', folder), join(publicRoot, folder), {recursive: true});
}
copyFileSync(join(siteRoot, 'assets', 'car.webp'), join(publicRoot, 'car.webp'));

const project = {
  schemaVersion: 1,
  sources: {crew: 'site/app.js#CREW', circuit: 'site/index.html#hero-track'},
  crew: readCrew(),
  circuit: readCircuit(),
};
writeJson(join(publicRoot, 'project.json'), project);

const sourceProbe = probe(retainedSource);
runMediaTool('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', retainedSource,
  '-map', '0:a:0', '-vn',
  '-af', 'asetpts=PTS-STARTPTS',
  '-ar', '44100', '-ac', '2',
  // Float PCM preserves decoded overs. Apply gain/fades on the Remotion
  // timeline before the final AAC encode, not during asset preparation.
  '-c:a', 'pcm_f32le',
  normalizedAudio,
]);
const normalizedProbe = probe(normalizedAudio);
const sourceHash = createHash('sha256').update(readFileSync(retainedSource)).digest('hex');
const matchesAnalysis = sourceHash === analyzedSourceSha256;
const normalizedDuration = Number(normalizedProbe.format.duration);
const sourceStream = sourceProbe.streams[0];
const normalizedStream = normalizedProbe.streams[0];
const suggestedFps = 30;
const marker = (seconds, description) => ({
  seconds,
  frameAt30Fps: Math.round(seconds * suggestedFps),
  description,
});

writeJson(join(audioRoot, 'audio-analysis.json'), {
  schemaVersion: 1,
  source: {
    file: 'audio/f1theme-source.m4a',
    sha256: sourceHash,
    bytes: Number(sourceProbe.format.size),
    codec: sourceStream.codec_name,
    channels: sourceStream.channels,
    sampleRate: Number(sourceStream.sample_rate),
    containerDurationSeconds: Number(sourceProbe.format.duration),
    startTimestampSeconds: Number(sourceStream.start_time || 0),
  },
  normalized: {
    file: 'audio/f1theme.wav',
    codec: normalizedStream.codec_name,
    channels: normalizedStream.channels,
    sampleRate: Number(normalizedStream.sample_rate),
    durationSeconds: normalizedDuration,
    startTimestampSeconds: 0,
    processing: 'Decode the supplied AAC to stereo 44.1 kHz float PCM; asetpts=PTS-STARTPTS. No gain, fades, speed changes or musical edits.',
  },
  analysis: {
    matchesOriginalAnalyzedSource: matchesAnalysis,
    auditioned: false,
    method: 'Waveform, frequency-band energy, spectral flux and onset autocorrelation of the decoded audio.',
    caution: 'The 15.375s structure change is a candidate for the drums/horns entrance, not an identification confirmed by listening. Audition before locking musical interpretation. Times are relative to the first decoded sample, not the container timestamps.',
    approximateBpm: matchesAnalysis ? 100 : null,
    needsNewAnalysis: !matchesAnalysis,
    measuredOriginalIntegratedLufs: matchesAnalysis ? -11.9 : null,
    measuredOriginalTruePeakDbtp: matchesAnalysis ? 0.7 : null,
    sourceEndsAtSilence: matchesAnalysis ? false : null,
    suggestedGainDb: -3,
    suggestedEndFadeSeconds: [1.2, 1.5],
  },
  suggestedTimeline: {
    fps: suggestedFps,
    durationInFrames: Math.ceil(normalizedDuration * suggestedFps),
    durationSeconds: Math.ceil(normalizedDuration * suggestedFps) / suggestedFps,
    markers: matchesAnalysis ? [
      marker(0, 'Opening'),
      marker(5.178, 'Build'),
      marker(15.375, 'Measured energy return; candidate driver presentation start'),
      marker(39.979, 'Final build'),
      marker(47.183, 'Title reveal'),
      marker(50.824, 'Last accent; handoff and audio fade'),
    ] : [],
    mainSectionFourBeatMarkersSeconds: matchesAnalysis
      ? [17.780, 20.184, 22.579, 24.983, 27.378, 29.782, 32.177, 34.581]
      : [],
  },
});

console.log(`Prepared ${project.crew.length} crew members, local fonts, car and exact site circuit.`);
console.log(`${relative(videoRoot, normalizedAudio)}: ${normalizedDuration.toFixed(6)}s, ${normalizedStream.codec_name}, ${normalizedStream.sample_rate}Hz, ${normalizedStream.channels}ch, timeline starts at 0.`);
if (!matchesAnalysis) {
  console.warn('The soundtrack changed: analyze/listen again and update the composition timings before rendering.');
}
