export interface Motivation {
  id: string;
  title: string;
  message: string;
  category: string;
}

export const motivations: Motivation[] = [
  {
    id: "1",
    title: "Kucuk Adimlar",
    message: "Her buyuk yolculuk tek bir adimla baslar. Bugun attigin kucuk adimlar, yarinin buyuk basarilarinin temelidir.",
    category: "Ilerleme",
  },
  {
    id: "2",
    title: "Nefes Al",
    message: "Bazen yapabilecegin en cesur sey, sadece derin bir nefes alip devam etmektir.",
    category: "Sakinlik",
  },
  {
    id: "3",
    title: "Kendinle Baris",
    message: "Mukemmel olmak zorunda degilsin. Bugun elinden gelenin en iyisini yapman yeterli.",
    category: "Oz-sefkat",
  },
  {
    id: "4",
    title: "Guclu Oldugunu Unutma",
    message: "Simdi burada olman, daha once zorlukların ustesinden geldiginin kanitidir.",
    category: "Guc",
  },
  {
    id: "5",
    title: "Yeni Bir Gun",
    message: "Her yeni gun, yeni bir baslangiçtir. Dun ne olursa olsun, bugun farkli olabilir.",
    category: "Umut",
  },
  {
    id: "6",
    title: "Sabir",
    message: "Iyilesme zaman alir. Kendine karsi sabırlı ol, cicekler de bir gunde acmaz.",
    category: "Sabir",
  },
  {
    id: "7",
    title: "Minnettarlik",
    message: "Bugün sahip oldugun kucuk guzellikler icin minnettar ol. Minnettarlik mutlulugun anahtaridir.",
    category: "Minnettarlik",
  },
  {
    id: "8",
    title: "Cesaret",
    message: "Korkmak normaldir. Onemli olan korkuna ragmen ileri adim atabilmektir.",
    category: "Cesaret",
  },
  {
    id: "9",
    title: "Dinlenme Hakki",
    message: "Dinlenmek tembellik degildir. Vucudun ve zihnin icin gerekli bir yatirimdir.",
    category: "Dinlenme",
  },
  {
    id: "10",
    title: "Degisim",
    message: "Degisim korkutucu olabilir, ama buyumenin tek yoludur. Seni neyin bekledigini merak et.",
    category: "Buyume",
  },
  {
    id: "11",
    title: "Kendi Isigini Yak",
    message: "Karanlikta baskalarindan isik beklemek yerine, kendi isigini yak. Sen dusundugunden cok daha parlaksin.",
    category: "Oz-guven",
  },
  {
    id: "12",
    title: "Simdiki An",
    message: "Gecmiste yasama, gelecek icin endiselenme. Simdiki an, senin en buyuk hediyendir.",
    category: "Farkindalik",
  },
];

export function getRandomMotivation(): Motivation {
  return motivations[Math.floor(Math.random() * motivations.length)];
}

export function getMotivationForMood(moodIndex: number): Motivation {
  if (moodIndex <= 1) {
    const comforting = motivations.filter(
      (m) => m.category === "Oz-sefkat" || m.category === "Guc" || m.category === "Umut"
    );
    return comforting[Math.floor(Math.random() * comforting.length)];
  }
  if (moodIndex === 2) {
    const encouraging = motivations.filter(
      (m) => m.category === "Ilerleme" || m.category === "Cesaret" || m.category === "Buyume"
    );
    return encouraging[Math.floor(Math.random() * encouraging.length)];
  }
  return getRandomMotivation();
}
