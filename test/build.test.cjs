const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const {execFileSync} = require('node:child_process');
const {root,sourceFiles} = require('./helpers.cjs');

test('published bundle contains current sources and resolves local dependencies', () => {
  execFileSync(process.execPath,[path.join(root,'build.cjs')]);
  const html=fs.readFileSync(path.join(root,'deploy/index.html'),'utf8');
  const block=type=>JSON.parse(html.match(new RegExp('<script type="'+type+'">([\\s\\S]*?)<\\/script>'))[1]);
  const manifest=block('__bundler/manifest'),template=block('__bundler/template');
  const mapping=JSON.parse(fs.readFileSync(path.join(root,'build/mapping.json'),'utf8'));
  for(const [file,id] of Object.entries(mapping)) {
    assert.ok(manifest[id],file);
    assert.equal(zlib.gunzipSync(Buffer.from(manifest[id].data,'base64')).toString(),fs.readFileSync(path.join(root,file),'utf8'),file);
  }
  assert.ok(!template.includes('src="./'),'no unresolved relative scripts');
  assert.ok(template.includes('Game Master assessment'));
  for(const file of sourceFiles.concat(['nation-map.js','ai-proxy.js','support.js'])) {
    new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
  }
  // Syntax-check inline boot scripts independently from inert manifest/template.
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
});
