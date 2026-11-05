const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const sourceFiles = ['countries.js','world-context.js','politics.js','game-content.js','content7.js','world.js','content8.js','engine9.js','sim9.js','campaign.js','province-data.js','provinces.js'];
function load(seed=0.123456) {
  const box = { console, Math:Object.create(Math), setTimeout(){ throw new Error('Unresolved dependency'); }, clearTimeout(){}, clearInterval(){} };
  box.Math.random = () => seed;
  box.window = box;
  vm.createContext(box);
  for (const name of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),box,{ filename:name });
  box.fresh = (name='Pakistan') => {
    const g = box.NSG.newGame(name, {name:'Test',age:45,background:'Economist',ideology:'Centre',traits:['technocrat','dealmaker'],flaw:'aloof'});
    g.id = name + '-test'; return g;
  };
  return box;
}
function loadUI(box) {
  box.setTimeout = setTimeout;
  box.clearTimeout = clearTimeout;
  box.React = {
    createRef:() => ({current:null}),
    createElement:(type,props,...children)=>({type,props:props||{},children}),
    cloneElement:(element,props)=>({...element,props:{...element.props,...props}})
  };
  box.DCLogic = class {
    props = {};
    setState(change, done) { Object.assign(this.state, typeof change === 'function' ? change(this.state) : change); if (done) done(); }
  };
  const html = fs.readFileSync(path.join(root,'Nation Sim v9 publish.dc.html'),'utf8');
  const code = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(code + '\n globalThis.GameUI = Component;', box, {filename:'game-ui.js'});
  return new box.GameUI();
}
module.exports = {load,loadUI,root,sourceFiles};
