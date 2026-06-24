const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const problems = [];

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function abs(file) {
  return path.join(root, file);
}

function read(file) {
  return fs.readFileSync(abs(file), 'utf8');
}

function existsLocal(url) {
  const clean = url.replace(/^\.?\//, '').split(/[?#]/)[0];
  if (!clean || clean === '.') return true;
  return fs.existsSync(abs(clean));
}

function walk(dir, predicate, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, found);
    } else if (!predicate || predicate(fullPath)) {
      found.push(fullPath);
    }
  }
  return found;
}

function collectMatches(text, regex, mapper = match => match[1]) {
  const values = [];
  for (const match of text.matchAll(regex)) values.push(mapper(match));
  return values;
}

function report(condition, message) {
  if (!condition) problems.push(message);
}

function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

function checkJsSyntax(jsFiles) {
  for (const file of jsFiles) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    report(result.status === 0, `JS syntax error in ${rel(file)}\n${result.stderr || result.stdout}`);
  }
}

function checkCssBraces(cssFiles) {
  for (const file of cssFiles) {
    const text = stripCssComments(fs.readFileSync(file, 'utf8'));
    const opens = (text.match(/{/g) || []).length;
    const closes = (text.match(/}/g) || []).length;
    report(opens === closes, `CSS brace mismatch in ${rel(file)} (${opens} open, ${closes} close)`);
  }
}

function checkDuplicateIds(html) {
  const ids = collectMatches(html, /\bid="([^"]+)"/g);
  const seen = new Set();
  const duplicateIds = [...new Set(ids.filter(id => {
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  }))];
  report(duplicateIds.length === 0, `Duplicate HTML id(s): ${duplicateIds.join(', ')}`);
  return new Set(ids);
}

function checkI18n(html) {
  const i18nSource = read('js/core/i18n.js');
  const context = { globalThis: {} };
  vm.runInNewContext(`${i18nSource}\nglobalThis.__I18N__ = I18N;`, context, {
    filename: 'js/core/i18n.js',
  });

  const translations = context.globalThis.__I18N__;
  const enKeys = new Set(Object.keys(translations.en || {}));
  const idKeys = new Set(Object.keys(translations.id || {}));
  const htmlKeys = new Set([
    ...collectMatches(html, /\bdata-i18n="([^"]+)"/g),
    ...collectMatches(html, /\bdata-i18n-title="([^"]+)"/g),
  ]);

  const missingEn = [...htmlKeys].filter(key => !enKeys.has(key));
  const missingId = [...htmlKeys].filter(key => !idKeys.has(key));
  const onlyEn = [...enKeys].filter(key => !idKeys.has(key));
  const onlyId = [...idKeys].filter(key => !enKeys.has(key));

  report(missingEn.length === 0, `Missing English i18n key(s): ${missingEn.join(', ')}`);
  report(missingId.length === 0, `Missing Indonesian i18n key(s): ${missingId.join(', ')}`);
  report(onlyEn.length === 0, `i18n key(s) only in English: ${onlyEn.join(', ')}`);
  report(onlyId.length === 0, `i18n key(s) only in Indonesian: ${onlyId.join(', ')}`);
}

function checkInlineHandlers(html, jsFiles) {
  const jsSource = jsFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const functions = new Set([
    ...collectMatches(jsSource, /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g),
    ...collectMatches(jsSource, /\b(?:window|globalThis)\.([A-Za-z_$][\w$]*)\s*=/g),
  ]);
  const builtIns = new Set([
    'alert',
    'clearInterval',
    'clearTimeout',
    'confirm',
    'Number',
    'parseFloat',
    'parseInt',
    'prompt',
    'setInterval',
    'setTimeout',
    'String',
    'if',
  ]);
  const handlerCalls = new Set();
  for (const handler of collectMatches(html, /\bon[a-z]+="([^"]*)"/g)) {
    for (const name of collectMatches(handler, /(?<![\.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (!builtIns.has(name)) handlerCalls.add(name);
    }
  }
  const missing = [...handlerCalls].filter(name => !functions.has(name));
  report(missing.length === 0, `Inline handler function(s) not found: ${missing.join(', ')}`);
}

function checkDomIds(htmlIds, jsFiles) {
  const jsSource = jsFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const referencedIds = new Set([
    ...collectMatches(jsSource, /\bgetElementById\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
    ...collectMatches(jsSource, /(?<![\w$])\$\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
  ]);
  const missing = [...referencedIds].filter(id => !htmlIds.has(id));
  report(missing.length === 0, `DOM id reference(s) not found in HTML: ${missing.join(', ')}`);
}

function checkAssets(html) {
  const localUrls = new Set();
  for (const url of collectMatches(html, /\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(url)) continue;
    localUrls.add(url);
  }

  const sw = read('service-worker.js');
  for (const url of collectMatches(sw, /['"]\.\/([^'"]*)['"]/g)) {
    localUrls.add(url || './');
  }

  const manifest = JSON.parse(read('manifest.json'));
  for (const icon of manifest.icons || []) {
    if (icon.src) localUrls.add(icon.src);
  }

  const missing = [...localUrls].filter(url => !existsLocal(url));
  report(missing.length === 0, `Missing local asset(s): ${missing.join(', ')}`);
}

function checkStalePatterns(jsFiles) {
  const checks = [
    [/console\.log/, 'console.log'],
    [/\bdebugger\b/, 'debugger'],
    [/\b_imgCache\b/, '_imgCache'],
    [/\bavgSliceAngle\b/, 'avgSliceAngle'],
    [/\bcrystal\b/i, 'crystal'],
    [/\bclsTeamCount\b/, 'clsTeamCount'],
    [/\bclsTeamResult\b/, 'clsTeamResult'],
    [/\bclsTeamCopyBtn\b/, 'clsTeamCopyBtn'],
    [/\bpickClassTeams\b/, 'pickClassTeams'],
    [/\bcopyClassTeamsResult\b/, 'copyClassTeamsResult'],
  ];

  for (const file of jsFiles) {
    if (rel(file).startsWith('js/vendor/')) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const [regex, label] of checks) {
      report(!regex.test(source), `Stale/debug pattern "${label}" found in ${rel(file)}`);
    }
  }
}

function main() {
  const html = read('index.html');
  const jsFiles = walk(abs('js'), file => file.endsWith('.js'));
  const cssFiles = walk(abs('css'), file => file.endsWith('.css'));
  const htmlIds = checkDuplicateIds(html);

  checkJsSyntax(jsFiles);
  checkCssBraces(cssFiles);
  checkI18n(html);
  checkInlineHandlers(html, jsFiles);
  checkDomIds(htmlIds, jsFiles);
  checkAssets(html);
  checkStalePatterns(jsFiles);

  if (problems.length) {
    console.error(`Project check failed with ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
  }

  console.log(`Project check passed (${jsFiles.length} JS files, ${cssFiles.length} CSS files).`);
}

main();
