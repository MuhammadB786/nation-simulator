const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const mapping = JSON.parse(read('build/mapping.json'));
const manifest = JSON.parse(read('build/resources.json'));
let template = read('Nation Sim v9 publish.dc.html');
for (const [file, id] of Object.entries(mapping)) {
  const source = read(file);
  manifest[id] = { mime:file.endsWith('.css') ? 'text/css' : 'text/javascript', compressed:true, data:zlib.gzipSync(source, { level:9 }).toString('base64') };
  template = template.split('./' + file).join(id);
}
const block = type => new RegExp('(<script type="' + type + '">)([\\s\\S]*?)(<\\/script>)');
// JSON inside an HTML script must never contain a literal closing script tag.
const encode = value => JSON.stringify(value).replace(/</g, '\\u003c');
const title = template.match(/<title>([^<]*)<\/title>/)[1];
const output = read('build/shell.html').replace(/<title>[^<]*<\/title>/,()=>'<title>'+title+'</title>')
  .replace(block('__bundler/manifest'), (_,a,b,c) => a + encode(manifest) + c)
  .replace(block('__bundler/template'), (_,a,b,c) => a + encode(template) + c);
fs.mkdirSync(path.join(root, 'deploy'), { recursive:true });
fs.writeFileSync(path.join(root, 'deploy/index.html'), output);
console.log('Built deploy/index.html from current source (' + Buffer.byteLength(output) + ' bytes).');
