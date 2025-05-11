// generoiTavukolmiot.js

// 150 tavun lista esiintymisjärjestyksessä
const tavut = [
  "ka","ti","ki","si","to","ta","ku","ko","li","ma",
  "pi","la","sa","pa","ri","ra","su","tu","va","taa",
  "tää","ni","mi","pu","na","ja","vi","te","kä","ke",
  "ne","po","mu","lo","ro","ha","ho","de","lu","ky",
  "re","sä","tä","tö","le","di","ru","a","hi","ve",
  "mo","so","e","ju","o","no","se","jo","kas","sy",
  "ty","kaa","he","nä","hu","tos","nu","tin","me","pe",
  "mä","lä","vo","las","ras","ly","vä","kin","jä","vas",
  "kuu","kuus","kö","je","rä","ai","bi","py","kal","lii",
  "vii","din","gi","da","kan","hä","pää","al","pis","ten",
  "kis","har","pö","vaa","laa","var","kat","kar","sin","raa",
  "luo","suo","tai","tur","men","vis","nen","pä","saa","kai",
  "pal","u","nos","ry","hy","i","pii","vuo","paa","mas",
  "tuus","maa","juus","pas","kau","ruu","kii","kor","ton","kuo",
  "lai","lie","sii","van","ba","tis","mus","an","sas","rus",
  "ros","puu","kir","kos","kyl","rai","sil","suu","tuo","vai",
  "das","lin","muu","ar","au","vu","man","ga","suus","han",
  "vin","huu","kään","tie","tus","kei","ker","kur","lei","sää",
  "luu","pai","tuu","uu","ruo","sel","tar","val","vie","aa",
  "bo","haa","ah","kel","fi","los","sal","huo","rin","os","jää"
];

function getKategoria(tavu, index) {
  if (index < 100) return 1;
  if (index < 130) return 2;
  return 3;
}

function getPiste(t1, t2, t3, kategoriat) {
  const yhdistelma = [kategoriat[t1], kategoriat[t2], kategoriat[t3]].sort().join('');
  const pisteet = {
    '111': 1,
    '112': 2,
    '122': 3,
    '222': 4,
    '123': 5,
    '223': 6,
    '233': 7,
    '333': 8
  };
  return pisteet[yhdistelma] || 1;
}

const tavukolmiot = (() => {
  const kategoriat = {};
  tavut.forEach((tavu, i) => kategoriat[tavu] = getKategoria(tavu, i));

  const kolmioehdot = new Set();
  const kolmiot = [];
  const pisteLimiitit = { 1: 24, 2: 24, 3: 15, 4: 14, 5: 10, 6: 4, 7: 4, 8: 1 };
  const laskuri = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

  while (kolmiot.length < 96) {
    const [a, b, c] = [...new Set([
      tavut[Math.floor(Math.random() * tavut.length)],
      tavut[Math.floor(Math.random() * tavut.length)],
      tavut[Math.floor(Math.random() * tavut.length)]
    ])];

    if (!a || !b || !c) continue;
    const key = [a, b, c].sort().join('-');
    if (kolmioehdot.has(key)) continue;

    const piste = getPiste(a, b, c, kategoriat);
    if (laskuri[piste] >= pisteLimiitit[piste]) continue;

    kolmioehdot.add(key);
    laskuri[piste]++;
    kolmiot.push({ tavut: [a, b, c], pisteet: piste });
  }

  return kolmiot;
})();

export { tavukolmiot };
