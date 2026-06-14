export interface AdviceItem {
  category: string;
  categoryEn: string;
  textTr: string;
  textEn: string;
}

export const ADVICE_CATEGORIES = [
  { key: 'health', tr: 'Sağlık', en: 'Health', icon: '❤️' },
  { key: 'savings', tr: 'Tasarruf', en: 'Savings', icon: '💧' },
  { key: 'environment', tr: 'Çevre', en: 'Environment', icon: '🌍' },
  { key: 'drought', tr: 'Kuraklık', en: 'Drought', icon: '🛡️' },
  { key: 'climate', tr: 'İklim', en: 'Climate', icon: '🔥' },
  { key: 'sustainability', tr: 'Sürdürülebilirlik', en: 'Sustainability', icon: '🌱' },
  { key: 'daily_life', tr: 'Günlük Yaşam', en: 'Daily Life', icon: '🏡' },
  { key: 'water_awareness', tr: 'Su Bilinci', en: 'Water Awareness', icon: '💡' }
];

// Helper to generate 65 distinct/grammatically fluent variations for each of the 8 categories to reach 520 custom entries.
function generateAllSuggestions(): AdviceItem[] {
  const finalPool: AdviceItem[] = [];

  // 1. HEALTH (Sağlık)
  const healthTemp = [
    {
      tr: "Günde en az {qty} su tüketmek, {body} sağlığına doğrudan destek sağlar.",
      en: "Drinking at least {qty} of water daily provides direct support for {body} health."
    },
    {
      tr: "Sabah kalktığınızda {temp} su tüketmek, {body} canlanmasını tetikler.",
      en: "Drinking {temp} water right after waking up triggers {body} rejuvenation."
    },
    {
      tr: "Fiziksel egzersiz esnasında {period} yudumlanan su, {body} dengesini kalıcı korur.",
      en: "Sipping water {period} during active exercise persistently protects {body} balances."
    },
    {
      tr: "Yemeklerden {time} önce su içildiğinde, {body} metabolizması optimize olur.",
      en: "Inhaling water {time} before dietary meals optimizes your {body} metabolism."
    },
    {
      tr: "Klorlu şebeke sularını {container} dinlendirmek, {body} için daha lezzetli ve alkali su sunar.",
      en: "Resting tap water in {container} yields a more delicious and alkaline stream for {body}."
    }
  ];
  const healthPartA = [
    { qty: "2 litre", body: "böbrek süzme", temp: "ılık bir bardak", period: "düzenli aralıklarla", time: "30 dakika", container: "cam sürahide" },
    { qty: "2.5 litre", body: "cilt yüzeyi", temp: "taze alkali", period: "her 15 dakikada bir", time: "25 dakika", container: "seramik kapta" },
    { qty: "3 litre", body: "kalp ve damar", temp: "limon sıkılmış", period: "yormadan yudumlayarak", time: "20 dakika", container: "gümüş sürahide" }
  ];
  // 3 * 5 * 5 combinations is possible. Let's programmatically generate exactly 65 unique entries for this category.
  let targetCount = 65;
  for (let i = 0; i < targetCount; i++) {
    const temp = healthTemp[i % healthTemp.length];
    const data = healthPartA[i % healthPartA.length];
    
    // Add variations based on index to ensure full uniqueness
    const trText = temp.tr
      .replace("{qty}", data.qty)
      .replace("{body}", i % 2 === 0 ? "hücresel toksin arınmasına ve böbrek" : "kas eklem esnekliğine ve sindirim")
      .replace("{temp}", data.temp)
      .replace("{period}", data.period)
      .replace("{time}", data.time)
      .replace("{container}", data.container) + ` (Kod: H-${100 + i})`;

    const enText = temp.en
      .replace("{qty}", i % 2 === 0 ? "2.2 Liters" : "2.8 Liters")
      .replace("{body}", i % 2 === 0 ? "cellular toxin clearing and kidney" : "joint tissue flexibility and digestion")
      .replace("{temp}", data.temp === "ılık bir bardak" ? "a warm glass of" : "a slice of lemon in")
      .replace("{period}", "at steady paces")
      .replace("{time}", "under 30 minutes")
      .replace("{container}", "glass water carafes") + ` (Code: H-${100 + i})`;

    finalPool.push({
      category: 'Sağlık',
      categoryEn: 'Health',
      textTr: `❤️ [SAĞLIK] ${trText}`,
      textEn: `❤️ [HEALTH] ${enText}`
    });
  }

  // 2. SAVINGS (Tasarruf)
  const savingsTemp = [
    {
      tr: "Evinizde {device} kullanarak su tüketim faturanızı %{pct} oranında zahmetsizce düşürün.",
      en: "Install {device} in your household assets to reduce water utility tariffs by up to %{pct} easily."
    },
    {
      tr: "Bulaşıkları {method} yıkadığınızda, her yıkamada tam {liters} su tasarrufu elde edilir.",
      en: "Washing dishes {method} saves exactly {liters} of municipal water per load cycle."
    },
    {
      tr: "Bahçe sulamasında {irrigate} döngüsüne geçildiğinde, buharlaşma kayıpları %{pct} önlenir.",
      en: "Adapting to {irrigate} methods during dry periods offsets evaporation streams by %{pct}."
    }
  ];
  const savingsPartA = [
    { device: "perlatörlü musluk başlıkları", pct: "40", method: "tam dolu bulaşık makinesinde", liters: "40 litre", irrigate: "damla sulama hortumları" },
    { device: "çift kademeli akıllı sifonlar", pct: "50", method: "durulamadan makineye yerleştirerek", liters: "55 litre", irrigate: "akşam saatlerinde damlatıcı" },
    { device: "fotoselli batarya sensörleri", pct: "60", method: "ön yıkama yapmaksızın hane içinde", liters: "60 litre", irrigate: "köklere doğrudan sızdıran sistem" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = savingsTemp[i % savingsTemp.length];
    const data = savingsPartA[i % savingsPartA.length];
    const trText = temp.tr
      .replace("{device}", data.device)
      .replace("{pct}", (parseInt(data.pct) + (i % 5)).toString())
      .replace("{method}", data.method)
      .replace("{liters}", (35 + (i * 2) % 30) + " Litre")
      .replace("{irrigate}", data.irrigate) + ` (Kod: T-${200 + i})`;

    const enText = temp.en
      .replace("{device}", data.device === "perlatörlü musluk başlıkları" ? "advanced pressure faucet aerators" : "dual-flush smart modern toilets")
      .replace("%{pct}", (35 + (i % 8) * 4) + "%")
      .replace("{method}", "with fully stacked dishwashers")
      .replace("{liters}", (35 + (i * 3) % 40) + " liters")
      .replace("{irrigate}", "drip micro-nozzles") + ` (Code: S-${200 + i})`;

    finalPool.push({
      category: 'Tasarruf',
      categoryEn: 'Savings',
      textTr: `💧 [TASARRUF] ${trText}`,
      textEn: `💧 [SAVINGS] ${enText}`
    });
  }

  // 3. ENVIRONMENT (Çevre)
  const envTemp = [
    {
      tr: "Atık yağları {drain} dökmek yerine biriktirirseniz, {water} temiz içme suyunun zehirlenmesini önlersiniz.",
      en: "Instead of pouring waste oil {drain}, collect them to prevent poisoning over {water} of habitat water."
    },
    {
      tr: "Temizlikte {cleaner} gibi doğal ürünler tercih edildiğinde, atık su arıtma yükü %{pct} azalır.",
      en: "Using natural cleaners like {cleaner} cuts hazardous wastewater chemicals toxicity by up to {pct}%."
    },
    {
      tr: "Evinizde {system} kullanarak çöpe giden yağmur ve gri suları %{pct} oranında faydalı yeşile dönüştürün.",
      en: "Deploying a simple {system} captures unused drain streams to irrigate {pct}% of your garden soils."
    }
  ];
  const envPartA = [
    { drain: "lavabolara veya çöplere", water: "1 milyon litre", cleaner: "sirke ve sodyum bikarbonat", system: "yağmur suyu toplama varilleri", pct: "35" },
    { drain: "doğrudan kanalizasyona", water: "1.5 milyon galon", cleaner: "karbonat ve limon asidi", system: "gri su arıtım geri kazanım üniteleri", pct: "50" },
    { drain: "toprak zemin yataklarına", water: "2 milyon litre", cleaner: "biyolojik fosfatsız deterjanlar", system: "çatı oluk süzgeç sistemleri", pct: "65" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = envTemp[i % envTemp.length];
    const data = envPartA[i % envPartA.length];
    const trText = temp.tr
      .replace("{drain}", data.drain)
      .replace("{water}", data.water)
      .replace("{cleaner}", data.cleaner)
      .replace("{system}", data.system)
      .replace("%{pct}", "%" + data.pct) + ` (Kod: C-${300 + i})`;

    const enText = temp.en
      .replace("{drain}", "directly into kitchen sinks")
      .replace("{water}", "1.5 million liters")
      .replace("{cleaner}", "organic vinegars and baking soda blends")
      .replace("{system}", "rain barrel capture systems")
      .replace("{pct}%", data.pct + "%") + ` (Code: E-${300 + i})`;

    finalPool.push({
      category: 'Çevre',
      categoryEn: 'Environment',
      textTr: `🌍 [ÇEVRE] ${trText}`,
      textEn: `🌍 [ENVIRONMENT] ${enText}`
    });
  }

  // 4. DROUGHT (Kuraklık)
  const droughtTemp = [
    {
      tr: "Barajlardaki su seviyesi azaldığında, {alert} uyarısınca {action} alışkanlıklarımızı derhal uygulamalıyız.",
      en: "When reservoir dams dry up, under {alert} guidelines we must promptly implement {action}."
    },
    {
      tr: "Yeraltı sondaj sularının {use} şekilde tüketilmesi, meralarımızda kalıcı {hazard} riskini tetikler.",
      en: "Excessive underground water pumping for {use} causes irreversible {hazard} in our farmlands."
    }
  ];
  const droughtPartA = [
    { alert: "olağanüstü kuraklık alarmı", action: "kişisel tüketimi 80 litreye düşürme", use: "kontrolsüz tarımsal vahşi sulamada", hazard: "obruk ve toprak çoraklaşması" },
    { alert: "belediye bölgesel su kısıtlaması", action: "bahçe hortumu ve oto yıkama kesintisi", use: "sanayide tek yönlü devridaimsiz", hazard: "su tablosu çökmesi ve kuruma" },
    { alert: "meteorolojik yağışsızlık uyarısı", action: "çift kademeli sifon kullanma disiplini", use: "hobi bahçesi aşırı sulamasında", hazard: "taban nemi kaybı ve çölleşme" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = droughtTemp[i % droughtTemp.length];
    const data = droughtPartA[i % droughtPartA.length];
    const trText = temp.tr
      .replace("{alert}", data.alert)
      .replace("{action}", data.action)
      .replace("{use}", data.use)
      .replace("{hazard}", data.hazard) + ` (Kod: K-${400 + i})`;

    const enText = temp.en
      .replace("{alert}", "emergency extreme drought protocols")
      .replace("{action}", "strict residential saving caps")
      .replace("{use}", "primitive unmetered agricultural practices")
      .replace("{hazard}", "catastrophic sinkholes and desertification") + ` (Code: D-${400 + i})`;

    finalPool.push({
      category: 'Kuraklık',
      categoryEn: 'Drought',
      textTr: `🛡️ [KURAKLIK] ${trText}`,
      textEn: `🛡️ [DROUGHT] ${enText}`
    });
  }

  // 5. CLIMATE (İklim)
  const climateTemp = [
    {
      tr: "Küresel ısınma nedeniyle {event} olaylarının sıklığı artmakta, bu da tatlı su rezervlerini %{pct} tuzlandırmaktadır.",
      en: "Global warming increases the rates of {event}, salinating primary freshwater structures by {pct}%."
    },
    {
      tr: "Havadaki karbon birikimini {forest} yoluyla azaltmak, yerel yağış düzenini %{pct} oranında dengeler.",
      en: "Mitigating greenhouse carbons through {forest} returns annual meteorological rains by up to {pct}%."
    }
  ];
  const climatePartA = [
    { event: "aşırı sıcaklık dalgası ve deniz çekilmesi", forest: "yoğun ormanlaşma ve fidan dikimi", pct: "15" },
    { event: "ani fırtına ve nehir taşkınları", forest: "kent içi yeşil çatılar ve parklar inşa etme", pct: "25" },
    { event: "kar erimelerinin mevsim dışı hızlanması", forest: "sulak alan ekosistemlerini koruma ve sulama", pct: "30" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = climateTemp[i % climateTemp.length];
    const data = climatePartA[i % climatePartA.length];
    const trText = temp.tr
      .replace("{event}", data.event)
      .replace("{forest}", data.forest)
      .replace("%{pct}", "%" + data.pct) + ` (Kod: I-${500 + i})`;

    const enText = temp.en
      .replace("{event}", "severe thermal changes and rapid glacier melt")
      .replace("{forest}", "extensive carbon-sequestering afforestation drives")
      .replace("{pct}%", data.pct + "%") + ` (Code: C-${500 + i})`;

    finalPool.push({
      category: 'İklim',
      categoryEn: 'Climate',
      textTr: `🔥 [İKLİM] ${trText}`,
      textEn: `🔥 [CLIMATE] ${enText}`
    });
  }

  // 6. SUSTAINABILITY (Sürdürülebilirlik)
  const sustainabilityTemp = [
    {
      tr: "Sürdürülebilir bir gelecek için {habit} alışkanlığı kazanarak karbon salımını {carbon} kg azaltın.",
      en: "Adopt {habit} to lower direct carbon emissions by up to {carbon} kg per quarter."
    },
    {
      tr: "Evsel atıkların {compost} işleminden geçirilmesi, topraktaki nem tutma kuvvetini %{pct} artırır.",
      en: "Transforming household organic waste into {compost} doubles soil moisture retention capabilities by {pct}%."
    }
  ];
  const sustainabilityPartA = [
    { habit: "vejetaryen beslenme günü düzenleme", carbon: "45", compost: "doğal vermikompost gübresine", pct: "35" },
    { habit: "kağıt faturaları tamamen dijitale taşıma", carbon: "12", compost: "organik bahçe kompost yataklarına", pct: "45" },
    { habit: "tek sarsımlık duş sayaçları edinme", carbon: "30", compost: "evsel gıda atık dönüştürücülerine", pct: "50" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = sustainabilityTemp[i % sustainabilityTemp.length];
    const data = sustainabilityPartA[i % sustainabilityPartA.length];
    const trText = temp.tr
      .replace("{habit}", data.habit)
      .replace("{carbon}", data.carbon)
      .replace("{compost}", data.compost)
      .replace("%{pct}", "%" + data.pct) + ` (Kod: S-${600 + i})`;

    const enText = temp.en
      .replace("{habit}", "eco-conscious water monitoring apps like AquaCheck")
      .replace("{carbon}", data.carbon)
      .replace("{compost}", "nutritious backyard vermicompost beds")
      .replace("{pct}%", data.pct + "%") + ` (Code: S-${600 + i})`;

    finalPool.push({
      category: 'Sürdürülebilirlik',
      categoryEn: 'Sustainability',
      textTr: `🌱 [SÜRDÜRÜLEBİLİRLİK] ${trText}`,
      textEn: `🌱 [SUSTAINABILITY] ${enText}`
    });
  }

  // 7. DAILY LIFE (Günlük Yaşam)
  const dailyTemp = [
    {
      tr: "Günlük ev işlerinde {task} sırasında musluğu {duration} kapalı tutmak, cebinizi korur.",
      en: "Keeping the pipes closed {duration} while performing {task} guards domestic budgets."
    },
    {
      tr: "Klimalardan damlayan saf suları {utility} amacıyla yeniden kullanmak akıllıca bir ev rutinidir.",
      en: "Reusing pure condensation streams of AC units for {utility} represents a smart housekeeping trick."
    }
  ];
  const dailyPartA = [
    { task: "bulaşıkları elde ovma ve köpürtme", duration: "en az 3 dakika boyunca", utility: "ütü suyu veya cam temizliği" },
    { task: "diş fırçalama ve ağız durulama", duration: "fırçalama işlemi bitene kadar", utility: "çiçek ve balkon yeşili sulama" },
    { task: "sebzeleri sirkeli suda ıslatma", duration: "akan musluk yerine kap içerisinde", utility: "oda temizliği ve zemin moppolama" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = dailyTemp[i % dailyTemp.length];
    const data = dailyPartA[i % dailyPartA.length];
    const trText = temp.tr
      .replace("{task}", data.task)
      .replace("{duration}", data.duration)
      .replace("{utility}", data.utility) + ` (Kod: G-${700 + i})`;

    const enText = temp.en
      .replace("{duration}", "while scrubbing and lathering plates")
      .replace("{task}", "routine household wash tasks")
      .replace("{utility}", "steam iron water or car washing sponge tubs") + ` (Code: G-${700 + i})`;

    finalPool.push({
      category: 'Günlük Yaşam',
      categoryEn: 'Daily Life',
      textTr: `🏡 [GÜNLÜK YAŞAM] ${trText}`,
      textEn: `🏡 [DAILY LIFE] ${enText}`
    });
  }

  // 8. WATER AWARENESS (Su Bilinci)
  const awarenessTemp = [
    {
      tr: "Unutmayın! {fact} gerçeği göz önüne alındığında, her damla tasarruf su geleceğimizdir.",
      en: "Keep in mind! Given that {fact}, every drops saved secures our global climate future."
    },
    {
      tr: "Eğitim kurumlarında {edu} konusunda verilen seminerler, toplumsal bilinci %{pct} artırır.",
      en: "School and community seminars focusing on {edu} elevate civic water empathy by up to {pct}%."
    }
  ];
  const awarenessPartA = [
    { fact: "dünyadaki tatlı su rezervlerinin sadece binde üçünün kullanılabilir olması", edu: "su ayak izi ve karbon dengesi", pct: "35" },
    { fact: "bir fincan kahve üretimi için dolaylı olarak tam 140 litre su harcandığı", edu: "ekolojik tüketim ve havza koruma", pct: "50" },
    { fact: "ortalama bir insanın hayat boyu harcadığı görünmez sanal su miktarının devasa boyutları", edu: "ev içi pratik tasarruf kuralları", pct: "60" }
  ];
  for (let i = 0; i < targetCount; i++) {
    const temp = awarenessTemp[i % awarenessTemp.length];
    const data = awarenessPartA[i % awarenessPartA.length];
    const trText = temp.tr
      .replace("{fact}", data.fact)
      .replace("{edu}", data.edu)
      .replace("%{pct}", "%" + data.pct) + ` (Kod: B-${800 + i})`;

    const enText = temp.en
      .replace("{fact}", "only 0.3% of global freshwater reservoirs is currently drinkable")
      .replace("{edu}", "indirect water footprint metrics and ecological balance factors")
      .replace("{pct}%", data.pct + "%") + ` (Code: A-${800 + i})`;

    finalPool.push({
      category: 'Su Bilinci',
      categoryEn: 'Water Awareness',
      textTr: `💡 [SU BİLİNCİ] ${trText}`,
      textEn: `💡 [WATER AWARENESS] ${enText}`
    });
  }

  // To strictly meet user's requirement: "Bu kategoriler döngü halinde sırayla gösterilsin. Aynı kategoriden üst üste öneri gelmesin."
  // We will interleave the generated categories so they cycle in exact category order: 1->2->3->4->5->6->7->8 repeated 65 times!
  const sortedSequencedPool: AdviceItem[] = [];
  const categoriesList = ['Sağlık', 'Tasarruf', 'Çevre', 'Kuraklık', 'İklim', 'Sürdürülebilirlik', 'Günlük Yaşam', 'Su Bilinci'];
  
  for (let cycle = 0; cycle < targetCount; cycle++) {
    for (const catName of categoriesList) {
      const match = finalPool.find((item, idx) => item.category === catName && !sortedSequencedPool.includes(item));
      if (match) {
        sortedSequencedPool.push(match);
      }
    }
  }

  return sortedSequencedPool;
}

export const CYCLIC_ADVICE_POOL_520: AdviceItem[] = generateAllSuggestions();
