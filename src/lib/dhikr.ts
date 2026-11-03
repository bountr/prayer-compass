/**
 * Zikir içerik modeli ve cihaz üstü sayaç kayıtları (Faz 5D, 5D.3'te sertleştirildi).
 *
 * Kurallar:
 * - Yerleşik zikirlerin kimlikleri SABİTTİR (dilden ve sıradan bağımsız).
 * - Kanonik içerik (Arapça metin, okunuş, kaynak) BURADA veridir; asla arayüz
 *   çeviri sözlüklerinde tutulmaz ve çoğaltılmaz.
 * - Meal (anlam) durumu her dil için bağımsızdır; İngilizce yedek metin
 *   "yerelleştirilmiş" gibi gösterilmez (bkz. meaningFor).
 * - Hiçbir kaynak/atıf uydurulmaz; güvenilir kaynak bilinmiyorsa
 *   sourceStatus = "verification_required" olur ve atıf gösterilmez.
 * - Tüm sayımlar yalnızca cihazda saklanır; sunucuya gönderilmez.
 */
import type { Locale } from "@/lib/i18n";

export type DhikrTranslations = Partial<Record<Locale, string>>;

/**
 * Dinî içerik inceleme durumu (Faz 5D.1).
 * Yalnızca gerçek insan incelemesi kaydedildiğinde "reviewed" olur;
 * makine çevirisi asla incelenmiş sayılmaz.
 */
export type ReviewStatus = "draft" | "review_required" | "reviewed";

/** Meal durumu dil bazında bağımsız izlenir. */
export type MeaningStatus = "missing" | "draft" | "review_required" | "reviewed";

/** Kaynak türü sınıflandırması (Faz 5D.3 §3). */
export type SourceType = "quran" | "hadith" | "established_dua" | "common_dhikr" | "user_custom";

/** Atıf durumu: atıf yalnızca insan incelemesinden sonra kesinleşir. */
export type SourceStatus = "cited_pending_review" | "verification_required";

/** Hedef sayının dayanağı (Faz 5D.3 §4). */
export type TargetBasis = "hadith_specified" | "traditional" | "user_preference";

/** Ses kaydı durumu (Faz 5D.3 §18). */
export type AudioStatus = "missing" | "candidate" | "review_required" | "reviewed";

export type QuranRef = { surahLatin: string; surah: number; ayah: number };

export type Dhikr = {
  /** Sabit iç kimlik. */
  id: string;
  /** Tek kanonik Arapça kaynak metin. */
  arabic: string;
  /** Tek kanonik Latin okunuş (tutarlı sistem, dilden bağımsız). */
  transliteration: string;
  /** Kullanıcıya gösterilen, dile göre doğal okunuş. */
  localizedReadings?: Partial<Record<Locale, string>>;
  translations: DhikrTranslations;
  /** Dil bazında meal inceleme durumu. */
  meaningReview: Partial<Record<Locale, MeaningStatus>>;
  defaultTarget: number;
  targetBasis: TargetBasis;
  /** Ses dosyası yolu (dil içermez; Arapça telaffuz dilden bağımsızdır). */
  audioAsset: string | null;
  audioStatus: AudioStatus;
  sourceType: SourceType;
  /** İnsan incelemesi bekleyen atıf metni; uydurulmuş numara kullanılmaz. */
  sourceReference: string | null;
  sourceStatus: SourceStatus;
  /** Kur'an kaynaklıysa sûre + âyet (dilden bağımsız). */
  quranRef: QuranRef | null;
  /** Metin/meal/kaynak inceleme durumu. */
  reviewStatus: ReviewStatus;
  builtIn: boolean;
};

/** Yerleşik zikir sesleri için planlanan yerel dosya yolu (dil içermez). */
export function plannedAudioPath(id: string) {
  const item = BUILT_IN_DHIKR.find((d) => d.id === id);
  return item?.audioAsset ?? `audio/dhikr/${id.replace(/_/g, "-")}.mp3`;
}

/**
 * Dinleme yalnızca İNCELENMİŞ bir kayıt varsa etkinleşir; aksi hâlde düğme hiç
 * gösterilmez (yapay/TTS ses üretilmez, aday kayıt yayın sesi sayılmaz).
 */
export function reviewedAudioSrc(item: Dhikr): string | null {
  if (item.audioStatus !== "reviewed") return null;
  return item.audioAsset;
}

/** Atıf yalnızca kaynak biliniyorsa gösterilir; yanlış atıf gösterilmez. */
export function displaySource(item: Dhikr): string | null {
  if (item.sourceStatus === "verification_required") return null;
  return item.sourceReference;
}


/**
 * Yerleşik zikirlerin kısa anlamları. Bunlar seçili dilde anlaşılabilir bir
 * açıklama sunmak içindir; Arapça zikir metninin kendisi değiştirilmez.
 * Yeni eklenen dil karşılıkları insan editoryal incelemesi yapılana kadar
 * `review_required` olarak kalır.
 */
/**
 * Günlük kullanım için dillere uygun yaklaşık okunuş yazımları.
 * Arapça özgün metin değişmez; insan telaffuz doğrulaması gereklidir.
 */
const LOCALIZED_DHIKR_READINGS: Record<string, Partial<Record<Locale, string>>> = {
  subhanallah: {
    tr: "Sübhanallah",
    en: "Subhanallah",
    de: "Subhanallah",
    fr: "Soubhanallah",
    ru: "Субханаллах",
    id: "Subhanallah",
    ms: "Subhanallah",
    ur: "سبحان اللہ",
    fa: "سبحان‌الله",
    bn: "সুবহানাল্লাহ",
    hi: "सुब्हानल्लाह",
    "zh-Hans": "苏卜哈纳拉",
  },
  alhamdulillah: {
    tr: "Elhamdülillah",
    en: "Alhamdulillah",
    de: "Alhamdulillah",
    fr: "Alhamdoulillah",
    ru: "Альхамдулиллях",
    id: "Alhamdulillah",
    ms: "Alhamdulillah",
    ur: "الحمد للہ",
    fa: "الحمدلله",
    bn: "আলহামদুলিল্লাহ",
    hi: "अल्हम्दुलिल्लाह",
    "zh-Hans": "阿里罕杜里俩",
  },
  allahuakbar: {
    tr: "Allahu Ekber",
    en: "Allahu Akbar",
    de: "Allahu Akbar",
    fr: "Allahou Akbar",
    ru: "Аллаху акбар",
    id: "Allahu Akbar",
    ms: "Allahu Akbar",
    ur: "اللہ اکبر",
    fa: "الله اکبر",
    bn: "আল্লাহু আকবার",
    hi: "अल्लाहु अकबर",
    "zh-Hans": "安拉胡艾克拜尔",
  },
  tawhid: {
    tr: "Lâ ilâhe illallah",
    en: "La ilaha illallah",
    de: "La ilaha illallah",
    fr: "La ilaha illallah",
    ru: "Ля иляха илляллах",
    id: "La ilaha illallah",
    ms: "La ilaha illallah",
    ur: "لا الٰہ الا اللہ",
    fa: "لا اله الا الله",
    bn: "লা ইলাহা ইল্লাল্লাহ",
    hi: "ला इलाहा इल्लल्लाह",
    "zh-Hans": "俩伊俩海印兰拉",
  },
  istighfar: {
    tr: "Estağfirullah",
    en: "Astaghfirullah",
    de: "Astaghfirullah",
    fr: "Astaghfiroullah",
    ru: "Астагфируллах",
    id: "Astaghfirullah",
    ms: "Astaghfirullah",
    ur: "استغفر اللہ",
    fa: "استغفرالله",
    bn: "আস্তাগফিরুল্লাহ",
    hi: "अस्तग़फ़िरुल्लाह",
    "zh-Hans": "阿斯塔格菲鲁拉",
  },
  salawat: {
    tr: "Allahümme salli alâ Muhammed",
    en: "Allahumma salli 'ala Muhammad",
    de: "Allahumma salli ala Muhammad",
    fr: "Allahoumma salli 'ala Mouhammad",
    ru: "Аллахумма салли аля Мухаммад",
    id: "Allahumma shalli 'ala Muhammad",
    ms: "Allahumma salli 'ala Muhammad",
    ur: "اللّٰہم صلّ علیٰ محمد",
    fa: "اللهم صل علی محمد",
    bn: "আল্লাহুম্মা সাল্লি আলা মুহাম্মদ",
    hi: "अल्लाहुम्मा सल्लि अला मुहम्मद",
    "zh-Hans": "安拉乎麦 萨利 阿拉 穆罕默德",
  },
  tasbih_hamd: {
    tr: "Sübhanallahi ve bihamdihî",
    en: "Subhanallahi wa bihamdihi",
    de: "Subhanallahi wa bihamdihi",
    fr: "Soubhanallahi wa bihamdihi",
    ru: "Субханаллахи ва бихамдихи",
    id: "Subhanallahi wa bihamdihi",
    ms: "Subhanallahi wa bihamdihi",
    ur: "سبحان اللہ وبحمدہ",
    fa: "سبحان‌الله و بحمده",
    bn: "সুবহানাল্লাহি ওয়া বিহামদিহি",
    hi: "सुब्हानल्लाहि व बिहम्दिही",
    "zh-Hans": "苏卜哈纳拉希 瓦 比哈姆迪希",
  },
  hawla: {
    tr: "Lâ havle ve lâ kuvvete illâ billâh",
    en: "La hawla wa la quwwata illa billah",
    de: "La hawla wa la quwwata illa billah",
    fr: "La hawla wa la qouwwata illa billah",
    ru: "Ля хауля ва ля куввата илля биллях",
    id: "La hawla wa la quwwata illa billah",
    ms: "La hawla wa la quwwata illa billah",
    ur: "لا حول ولا قوۃ الا باللہ",
    fa: "لا حول و لا قوة الا بالله",
    bn: "লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ",
    hi: "ला हौला व ला क़ुव्वता इल्ला बिल्लाह",
    "zh-Hans": "俩豪拉 瓦 俩 库瓦塔 印俩 比拉",
  },
  hasbunallah: {
    tr: "Hasbünallahu ve ni'mel vekîl",
    en: "Hasbunallahu wa ni'mal wakeel",
    de: "Hasbunallahu wa ni'mal wakil",
    fr: "Hasbounallahu wa ni'mal wakil",
    ru: "Хасбуналлаху ва ни'маль вакиль",
    id: "Hasbunallahu wa ni'mal wakil",
    ms: "Hasbunallahu wa ni'mal wakil",
    ur: "حسبنا اللہ ونعم الوکیل",
    fa: "حسبنا الله و نعم الوکیل",
    bn: "হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকিল",
    hi: "हस्बुनल्लाहु व नि'मल वकील",
    "zh-Hans": "哈斯布纳拉乎 瓦 尼尔麦勒 瓦基勒",
  },
};

/** Seçili dilde doğal okunuş; yoksa kanonik Latin transliterasyona düşer. */
export function dhikrReading(item: Dhikr, locale: Locale): string {
  return item.localizedReadings?.[locale] ?? item.transliteration;
}

const EXTRA_DHIKR_MEANINGS: Record<string, DhikrTranslations> = {
  subhanallah: {
    ar: "تنزّه الله عن كل نقص.",
    de: "Gepriesen sei Allah.",
    fr: "Gloire à Allah.",
    ru: "Пречист Аллах.",
    id: "Mahasuci Allah.",
    ms: "Maha Suci Allah.",
    ur: "اللہ ہر عیب سے پاک ہے۔",
    fa: "خداوند از هر نقصی پاک و منزّه است.",
    bn: "আল্লাহ সকল অপূর্ণতা থেকে পবিত্র।",
    hi: "अल्लाह हर कमी से पाक है।",
    "zh-Hans": "真主超绝一切缺陷。",
  },
  alhamdulillah: {
    ar: "الحمد كله لله.",
    de: "Alles Lob gebührt Allah.",
    fr: "Toute louange appartient à Allah.",
    ru: "Вся хвала принадлежит Аллаху.",
    id: "Segala puji bagi Allah.",
    ms: "Segala puji bagi Allah.",
    ur: "تمام تعریفیں اللہ کے لیے ہیں۔",
    fa: "همه ستایش‌ها از آنِ خداست.",
    bn: "সমস্ত প্রশংসা আল্লাহর জন্য।",
    hi: "सारी प्रशंसा अल्लाह के लिए है।",
    "zh-Hans": "一切赞颂全归真主。",
  },
  allahuakbar: {
    ar: "الله أعظم.",
    de: "Allah ist der Größte.",
    fr: "Allah est le Plus Grand.",
    ru: "Аллах Велик.",
    id: "Allah Mahabesar.",
    ms: "Allah Maha Besar.",
    ur: "اللہ سب سے بڑا ہے۔",
    fa: "خدا بزرگ‌تر است.",
    bn: "আল্লাহ সর্বশ্রেষ্ঠ।",
    hi: "अल्लाह सबसे महान है।",
    "zh-Hans": "真主至大。",
  },
  tawhid: {
    ar: "لا معبود بحق إلا الله.",
    de: "Niemand ist der Anbetung würdig außer Allah.",
    fr: "Nul n'est digne d'adoration en dehors d'Allah.",
    ru: "Нет никого достойного поклонения, кроме Аллаха.",
    id: "Tidak ada sesembahan yang berhak disembah selain Allah.",
    ms: "Tiada yang berhak disembah selain Allah.",
    ur: "اللہ کے سوا کوئی معبودِ برحق نہیں۔",
    fa: "هیچ معبودِ برحقی جز خدا نیست.",
    bn: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই।",
    hi: "अल्लाह के सिवा कोई सत्य उपास्य नहीं है।",
    "zh-Hans": "除真主外，绝无应受崇拜者。",
  },
  istighfar: {
    ar: "أطلب المغفرة من الله.",
    de: "Ich bitte Allah um Vergebung.",
    fr: "Je demande pardon à Allah.",
    ru: "Я прошу у Аллаха прощения.",
    id: "Aku memohon ampun kepada Allah.",
    ms: "Aku memohon keampunan daripada Allah.",
    ur: "میں اللہ سے بخشش مانگتا ہوں۔",
    fa: "از خدا آمرزش می‌خواهم.",
    bn: "আমি আল্লাহর কাছে ক্ষমা চাই।",
    hi: "मैं अल्लाह से क्षमा माँगता हूँ।",
    "zh-Hans": "我向真主祈求宽恕。",
  },
  salawat: {
    ar: "اللهم صلِّ على محمد.",
    de: "O Allah, segne Muhammad.",
    fr: "Ô Allah, accorde Tes bénédictions à Muhammad.",
    ru: "О Аллах, благослови Мухаммада.",
    id: "Ya Allah, limpahkanlah shalawat kepada Muhammad.",
    ms: "Ya Allah, limpahkan selawat kepada Muhammad.",
    ur: "اے اللہ، محمد ﷺ پر رحمتیں نازل فرما۔",
    fa: "خدایا، بر محمد درود فرست.",
    bn: "হে আল্লাহ, মুহাম্মদের ওপর রহমত ও বরকত বর্ষণ করুন।",
    hi: "ऐ अल्लाह, मुहम्मद पर रहमतें नाज़िल फ़रमा।",
    "zh-Hans": "真主啊，求你赐福穆罕默德。",
  },
  tasbih_hamd: {
    ar: "أنزّه الله وأحمده.",
    de: "Gepriesen sei Allah, und Ihm gebührt Lob.",
    fr: "Gloire à Allah et louange à Lui.",
    ru: "Пречист Аллах, и хвала Ему.",
    id: "Mahasuci Allah dan segala puji bagi-Nya.",
    ms: "Maha Suci Allah dan segala puji bagi-Nya.",
    ur: "اللہ پاک ہے اور تمام تعریف اسی کے لیے ہے۔",
    fa: "خدا پاک و منزّه است و ستایش از آنِ اوست.",
    bn: "আল্লাহ পবিত্র, এবং সকল প্রশংসা তাঁর।",
    hi: "अल्लाह पाक है और सारी प्रशंसा उसी के लिए है।",
    "zh-Hans": "真主超绝万物，一切赞颂归于祂。",
  },
  hawla: {
    ar: "لا قدرة ولا قوة إلا بالله.",
    de: "Es gibt keine Macht und keine Kraft außer durch Allah.",
    fr: "Il n'y a de force ni de puissance qu'en Allah.",
    ru: "Нет мощи и силы ни у кого, кроме как с помощью Аллаха.",
    id: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
    ms: "Tiada daya dan kekuatan melainkan dengan pertolongan Allah.",
    ur: "اللہ کی مدد کے بغیر نہ کوئی طاقت ہے نہ قوت۔",
    fa: "هیچ توان و نیرویی جز به یاری خدا نیست.",
    bn: "আল্লাহর সাহায্য ছাড়া কোনো শক্তি ও সামর্থ্য নেই।",
    hi: "अल्लाह की मदद के बिना कोई शक्ति और सामर्थ्य नहीं।",
    "zh-Hans": "一切能力与力量唯凭真主。",
  },
  hasbunallah: {
    ar: "الله كافينا وهو نعم الوكيل.",
    de: "Allah genügt uns, und Er ist der beste Sachwalter.",
    fr: "Allah nous suffit, et Il est le meilleur Garant.",
    ru: "Нам достаточно Аллаха, и Он — лучший Попечитель.",
    id: "Cukuplah Allah bagi kami; Dia sebaik-baik Pelindung.",
    ms: "Cukuplah Allah bagi kami; Dia sebaik-baik Pelindung.",
    ur: "اللہ ہمارے لیے کافی ہے اور وہ بہترین کارساز ہے۔",
    fa: "خدا برای ما کافی است و او بهترین کارساز است.",
    bn: "আল্লাহই আমাদের জন্য যথেষ্ট; তিনিই সর্বোত্তম কর্মবিধায়ক।",
    hi: "अल्लाह हमारे लिए काफ़ी है और वही सबसे उत्तम संरक्षक है।",
    "zh-Hans": "真主足够我们依靠，祂是最好的托付者。",
  },
};

const RAW_BUILT_IN_DHIKR: Dhikr[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللّٰه",
    transliteration: "Subhan Allah",
    translations: { tr: "Allah her türlü eksiklikten münezzehtir.", en: "Glory be to Allah." },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 33,
    targetBasis: "hadith_specified",
    audioAsset: "audio/dhikr/subhanallah.mp3",
    audioStatus: "missing",
    sourceType: "hadith",
    sourceReference: "Sahih Muslim 596",
    sourceStatus: "cited_pending_review",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "alhamdulillah",
    arabic: "اَلْحَمْدُ لِلّٰه",
    transliteration: "Al-hamdu lillah",
    translations: { tr: "Hamd Allah'a mahsustur.", en: "All praise is due to Allah." },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 33,
    targetBasis: "hadith_specified",
    audioAsset: "audio/dhikr/alhamdulillah.mp3",
    audioStatus: "missing",
    sourceType: "hadith",
    sourceReference: "Sahih Muslim 596",
    sourceStatus: "cited_pending_review",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "allahuakbar",
    arabic: "اَللّٰهُ أَكْبَر",
    transliteration: "Allahu akbar",
    translations: { tr: "Allah en büyüktür.", en: "Allah is the Greatest." },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 34,
    targetBasis: "hadith_specified",
    audioAsset: "audio/dhikr/allahu-akbar.mp3",
    audioStatus: "missing",
    sourceType: "hadith",
    sourceReference: "Sahih Muslim 596",
    sourceStatus: "cited_pending_review",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "tawhid",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰه",
    transliteration: "La ilaha illa Allah",
    translations: { tr: "Allah'tan başka ilah yoktur.", en: "There is no deity but Allah." },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "traditional",
    audioAsset: "audio/dhikr/la-ilaha-illallah.mp3",
    audioStatus: "missing",
    sourceType: "common_dhikr",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "istighfar",
    arabic: "أَسْتَغْفِرُ اللّٰه",
    transliteration: "Astaghfiru Allah",
    translations: { tr: "Allah'tan bağışlanma dilerim.", en: "I seek forgiveness from Allah." },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "traditional",
    audioAsset: "audio/dhikr/astaghfirullah.mp3",
    audioStatus: "missing",
    sourceType: "common_dhikr",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "salawat",
    arabic: "اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّد",
    transliteration: "Allahumma salli ala Muhammad",
    translations: {
      tr: "Allah'ım, Muhammed'e rahmet eyle.",
      en: "O Allah, send blessings upon Muhammad.",
    },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "traditional",
    audioAsset: "audio/dhikr/salawat.mp3",
    audioStatus: "missing",
    sourceType: "established_dua",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "tasbih_hamd",
    arabic: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",
    transliteration: "Subhan Allahi wa bihamdihi",
    translations: {
      tr: "Allah'ı hamd ile tesbih ederim.",
      en: "Glory be to Allah, and praise be to Him.",
    },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "traditional",
    audioAsset: "audio/dhikr/tasbih-hamd.mp3",
    audioStatus: "missing",
    sourceType: "common_dhikr",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "hawla",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰه",
    transliteration: "La hawla wa la quwwata illa billah",
    translations: {
      tr: "Güç ve kuvvet yalnızca Allah'tandır.",
      en: "There is no power nor strength except with Allah.",
    },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "user_preference",
    audioAsset: "audio/dhikr/hawla.mp3",
    audioStatus: "missing",
    sourceType: "common_dhikr",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "review_required",
    builtIn: true,
  },
  {
    id: "hasbunallah",
    arabic: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيل",
    transliteration: "Hasbuna Allahu wa ni'ma al-wakil",
    translations: {
      tr: "Allah bize yeter; O ne güzel vekildir.",
      en: "Allah is sufficient for us, and He is the best disposer of affairs.",
    },
    meaningReview: { tr: "review_required", en: "review_required" },
    defaultTarget: 100,
    targetBasis: "user_preference",
    audioAsset: "audio/dhikr/hasbunallah.mp3",
    audioStatus: "missing",
    sourceType: "quran",
    sourceReference: "Al-Imran 3:173",
    sourceStatus: "cited_pending_review",
    quranRef: { surahLatin: "Al-Imran", surah: 3, ayah: 173 },
    reviewStatus: "review_required",
    builtIn: true,
  },
];

export const BUILT_IN_DHIKR: Dhikr[] = RAW_BUILT_IN_DHIKR.map((item) => {
  const extra = EXTRA_DHIKR_MEANINGS[item.id] ?? {};
  const reviews = Object.fromEntries(
    Object.keys(extra).map((locale) => [locale, "review_required"]),
  ) as Partial<Record<Locale, MeaningStatus>>;
  return {
    ...item,
    localizedReadings: { ...LOCALIZED_DHIKR_READINGS[item.id], ar: item.arabic },
    translations: { ...item.translations, ...extra },
    meaningReview: { ...item.meaningReview, ...reviews },
  };
});

/**
 * Hedef seçenekleri. 33/34/100 gelenekte yaygındır; 99/500/1000 yalnızca
 * kullanıcı tercihidir ve hiçbir dinî hüküm/otorite iddiası taşımaz.
 */
export const TARGET_PRESETS = [33, 34, 99, 100, 500, 1000] as const;

/** Hangi ön ayarın dinî bir dayanak iddiası taşıdığı (yalnızca veri/denetim). */
export const TARGET_PRESET_BASIS: Record<number, TargetBasis> = {
  33: "hadith_specified",
  34: "hadith_specified",
  99: "user_preference",
  100: "traditional",
  500: "user_preference",
  1000: "user_preference",
};

/** Ham meal metni (yedeklerle). Şeffaf gösterim için meaningFor kullanın. */
export function dhikrMeaning(item: Dhikr, locale: Locale): string {
  return item.translations[locale] ?? item.translations.en ?? item.translations.tr ?? "";
}

/**
 * Şeffaf meal gösterimi: seçili dilde meal yoksa metin yedek dilden gelir ve
 * `localized: false` ile hangi dilde olduğu bildirilir (yanlış etiketlenmez).
 */
export function meaningFor(
  item: Dhikr,
  locale: Locale,
): { text: string; language: Locale | null; localized: boolean; status: MeaningStatus } {
  const own = item.translations[locale];
  if (own && own.trim()) {
    return {
      text: own,
      language: locale,
      localized: true,
      status: item.meaningReview[locale] ?? "draft",
    };
  }
  for (const fb of ["en", "tr"] as Locale[]) {
    const text = item.translations[fb];
    if (text && text.trim()) {
      return {
        text,
        language: fb,
        localized: false,
        status: item.meaningReview[fb] ?? "draft",
      };
    }
  }
  return { text: "", language: null, localized: false, status: "missing" };
}

/* ------------------------------- Kalıcı durum ------------------------------ */

const STORE_KEY = "nv:dhikr-v1";

export type DhikrState = {
  /** Zikir kimliği -> hedef (kullanıcı değiştirdiyse). */
  targets: Record<string, number>;
  /** "YYYY-MM-DD" -> zikir kimliği -> sayım. */
  daily: Record<string, Record<string, number>>;
  /** Kullanıcının eklediği zikirler. */
  custom: Dhikr[];
};

export const EMPTY_STATE: DhikrState = { targets: {}, daily: {}, custom: [] };

/**
 * Eski kayıtları (Faz 5D / 5D.1) yeni alanlara taşır. Sayımlar, hedefler ve
 * kullanıcı zikirleri asla kaybolmaz; eksik üstveri güvenli varsayılana çekilir.
 */
function migrateCustom(raw: unknown): Dhikr {
  const c = (raw ?? {}) as Partial<Dhikr> & { audioReviewStatus?: string };
  return {
    id: String(c.id ?? `custom:${Date.now().toString(36)}`),
    arabic: c.arabic ?? "",
    transliteration: c.transliteration ?? "",
    localizedReadings: c.localizedReadings ?? {},
    translations: c.translations ?? {},
    meaningReview: c.meaningReview ?? {},
    defaultTarget: c.defaultTarget ?? 33,
    targetBasis: c.targetBasis ?? "user_preference",
    // Kullanıcı zikirleri için asla telaffuz sesi üretilmez.
    audioAsset: null,
    audioStatus: "missing",
    sourceType: c.sourceType ?? "user_custom",
    sourceReference: c.sourceReference ?? null,
    sourceStatus: c.sourceStatus ?? "verification_required",
    quranRef: c.quranRef ?? null,
    reviewStatus: c.reviewStatus ?? "draft",
    builtIn: false,
  };
}

export function readDhikrState(): DhikrState {
  if (typeof localStorage === "undefined") return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<DhikrState>;
    return {
      targets: parsed.targets ?? {},
      daily: parsed.daily ?? {},
      custom: Array.isArray(parsed.custom) ? parsed.custom.map(migrateCustom) : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function writeDhikrState(state: DhikrState) {
  if (typeof localStorage === "undefined") return;
  try {
    // Yalnızca son 60 günün kaydı tutulur.
    const days = Object.keys(state.daily).sort().slice(-60);
    const daily: DhikrState["daily"] = {};
    for (const d of days) daily[d] = state.daily[d]!;
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, daily }));
  } catch {
    /* kota */
  }
}

export function makeCustomDhikr(input: {
  arabic: string;
  transliteration: string;
  meaning: string;
  target: number;
  locale: Locale;
}): Dhikr {
  return {
    id: `custom:${Date.now().toString(36)}`,
    arabic: input.arabic.trim(),
    transliteration: input.transliteration.trim(),
    translations: { [input.locale]: input.meaning.trim() },
    meaningReview: { [input.locale]: "draft" },
    defaultTarget: Math.max(1, Math.round(input.target)),
    targetBasis: "user_preference",
    // Kullanıcı zikri için telaffuz/ses üretilmez, doğrulanmış izlenimi verilmez.
    audioAsset: null,
    audioStatus: "missing",
    sourceType: "user_custom",
    sourceReference: null,
    sourceStatus: "verification_required",
    quranRef: null,
    reviewStatus: "draft",
    builtIn: false,
  };
}
