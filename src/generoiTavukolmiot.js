// Täydellinen tavulista
/*const tavut = [
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
*/
const tavut = [
  "ka", "ta", "la", "li", "ri", "si", "ma", "ki", "va", "ku",
  "ko", "sa", "to", "ra", "vi", "su", "ti", "pa", "tu", "na",
  "ja", "ro", "mu", "pi", "te", "ha", "lo", "pu", "po", "ni",
  "ho", "mi", "ru", "lu", "no", "ke", "ju", "jo", "a", "de",
  "o", "so", "hi", "ve", "hu", "e", "le", "re", "kas", "pe",
  "las", "taa", "kaa", "vii", "ne", "lii", "nu", "kal", "he", "me",
  "ai", "kai", "kuu", "ras", "raa", "vas", "vo", "vaa", "luo", "pal",
  "al", "tai", "kä", "kar", "tos", "kii", "suo", "laa", "sä", "i",
  "kat", "var", "pis", "har", "vis", "nä", "vä", "kin", "kan", "vuo",
  "pas", "tä", "vin", "kor", "kuo", "lie", "se", "mo", "laus", "pii",
  "ky", "sii", "maa", "rä", "ten", "ruu", "ty", "mä", "hä", "saa",
  "lin", "sy", "ly", "kau", "ker", "an", "din", "je", "rin", "di",
  "sin", "saus", "tin", "kaus", "raus", "taus", "jaus", "paus", "rai", "vaus",
  "puu", "tur", "huu", "vu", "os", "lai", "tuo", "ry", "py", "tar",
  "vai", "jy", "haa", "da", "han", "tis", "naus", "kos", "maus", "nos",
  "lei", "rus", "ruo", "kei", "kur", "suu", "muu", "aa", "ar", "luu",
  "tää", "pö", "men", "ton", "sis", "kir", "sil", "sel", "sal", "paa",
  "lä", "tuu", "tuus", "tus", "gi", "kö", "keus", "jä", "kis", "kää",
  "keys", "kuus", "tö", "pä", "käys", "ah", "au", "jy"
];

function getTavujenMaara(tavut) {
  return tavut.length;
}
const tavujenMaara = getTavujenMaara(tavut);

function getTriangleKey(t1, t2, t3) {
  return [t1, t2, t3].sort().join('-');
}

function getKategoria(tavu, index, tavujenMaara) {
  const raja1 = Math.floor(tavujenMaara * 0.5);  // 50 %
  const raja2 = Math.floor(tavujenMaara * 0.8);  // 50 % + 30 %
  if (index < raja1) return 1;
  if (index < raja2) return 2;
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
  tavut.forEach((tavu, i) => kategoriat[tavu] = getKategoria(tavu, i, tavujenMaara ));

  const kolmioehdot = new Set();
  const kolmiot = [];
  const pisteLimiitit = { 1: 24, 2: 24, 3: 15, 4: 14, 5: 10, 6: 4, 7: 4, 8: 1 };
  const laskuri = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

  let yritykset = 0;
  const maxYritykset = 10000;

  while (kolmiot.length < 96 && yritykset < maxYritykset) {
    const [a, b, c] = [...new Set([
      tavut[Math.floor(Math.random() * tavut.length)],
      tavut[Math.floor(Math.random() * tavut.length)],
      tavut[Math.floor(Math.random() * tavut.length)]
    ])];

    if (!a || !b || !c) {
      yritykset++;
      continue;
    }

    const key = getTriangleKey(a, b, c);
    if (kolmioehdot.has(key)) {
      yritykset++;
      continue;
    }

    const piste = getPiste(a, b, c, kategoriat);
    if (laskuri[piste] >= pisteLimiitit[piste]) {
      yritykset++;
      continue;
    }

    kolmioehdot.add(key);
    laskuri[piste]++;
    kolmiot.push({ tavut: [a, b, c], pisteet: piste });
  }

  return kolmiot;
})();

export { tavukolmiot };
