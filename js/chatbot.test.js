const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, 'chatbot.js'), 'utf8');

// Run the shipped script through its normal input, timer and message handlers.
function openWidget() {
  const elements = new Map();
  function element() {
    return {
      children: [], listeners: {}, style: {},
      appendChild(child) { this.children.push(child); },
      addEventListener(name, listener) { this.listeners[name] = listener; },
      set innerHTML(markup) {
        this.markup = markup;
        for (const [, id] of markup.matchAll(/ id="([^"]+)"/g)) elements.set(id, element());
        this.firstChild = elements.get('chatbot-widget');
      }
    };
  }

  const document = Object.assign(element(), {
    head: element(), body: element(), createElement: element,
    getElementById: id => elements.get(id)
  });
  vm.runInNewContext(script, { document, setTimeout: callback => callback() });
  document.listeners.DOMContentLoaded();
  const messages = elements.get('chatbot-messages');
  const last = () => messages.children.at(-1).children[0].textContent;
  return {
    welcome: last(),
    ask(question, key) {
      const input = elements.get('chatbot-input');
      input.value = question;
      if (key) input.listeners.keydown({ key });
      else elements.get('chatbot-send').listeners.click();
      const reply = messages.children.at(-1).children[0];
      assert.equal(reply.className, 'cb-msg bot');
      return last();
    }
  };
}

test('welcome identifies demo before the first question', () => {
  assert.match(openWidget().welcome, /demo/i);
});

const cases = [
  ['SOC2 Type II', /nije naveden SOC 2 Type II izveštaj/],
  ['Kako proveriti SOC 2 pre kupovine BTC?', /nezavisnog revizora/],
  ['SOC-2?', /periodom provere/],
  ['Da li je menjačnica sigurna?', /ne potvrđuje koje su mere/],
  ['Kako uključiti 2FA?', /ne potvrđuje koje su mere/],
  ['Koliko sredstava je u cold storage?', /kako se čuvaju sredstva/],
  ['Da li je bilo incidenata?', /istorija incidenata/],
  ['Koliko iznosi naknada za BTC?', /važeći cenovnik/],
  ['Kako kupiti bitcoin?', /demo obrazac/],
  ['Koje kripto valute podržavate?', /ne potvrđuje listu/],
  ['Koliki je prinos od stakinga?', /ne nudi aktivaciju/],
  ['Preporuči portfolio za BTC', /bez preporuke/],
  ['Kakva je cena BTC?', /izmišljena cena/],
  ['Šta je DeFi?', /Uslovi pristupa zavise/],
  ['Dobar dan', /Pitajte o SOC 2/]
];
for (const [question, expected] of cases) {
  test(question, () => {
    const reply = openWidget().ask(question, 'Enter');
    assert.match(reply, /^Demo · /);
    assert.match(reply, expected);
    assert.doesNotMatch(reply, /sertifikat|95%|nikad nismo|500\+|prethodno odobren|50% popust|uplatite/i);
  });
}

test('send button returns the same SOC 2 status as Enter', () => {
  const widget = openWidget();
  assert.equal(widget.ask('SOC 2'), widget.ask('SOC 2', 'Enter'));
});
