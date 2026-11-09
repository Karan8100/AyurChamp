import type { Language } from '../lib/translations'

/**
 * Glossary-Constrained Hindi translations for Ritucharya content across all 6 seasons.
 * Preserves classical terms (Visarga Kala, Adana Kala, Agni, Manda, Tikshna, Sama,
 * Panchakarma, Udvartana, Abhyanga, Divaswapna, Ritu Sandhi, Shad Rasa).
 */
export const RITUCHARYA_TRANSLATIONS_HI: Record<string, string> = {
  // ── Varsha (Monsoon) ──
  'The lunar, nourishing cycle begins. Cooling rain and clouds restore environmental moisture, and bodily vitality begins its slow upward rebuilding.':
    'चंद्र, पोषणकारी चक्र (विसर्ग काल) प्रारंभ होता है। शीतल वर्षा और मेघ वातावरण में नमी लौटाते हैं, और शारीरिक शक्ति का धीरे-धीरे पुनर्निर्माण शुरू होता है।',
  'Manda (Weakened by moisture & environmental dampness)':
    'मन्द अग्नि (नमी व वातावरण की सीलन से दुर्बल हुई पाचक अग्नि)',
  'With the arrival of rains, the cold dampness and earth vapours naturally tend to aggravate Vata dosha, while Pitta begins its gradual accumulation. Because humidity weakens digestive fire (Agni), mealtimes are kept light, warm, and freshly cooked.':
    'वर्षा के आगमन के साथ, ठंडी नमी और भू-वाष्प स्वाभाविक रूप से वात दोष को प्रकुपित करते हैं, जबकि पित्त का संचय शुरू होता है। चूंकि आर्द्रता पाचक अग्नि (Agni) को कमजोर करती है, इसलिए भोजन हल्का, गर्म और ताजा पका होना चाहिए।',
  'Drink water that has been thoroughly boiled and allowed to cool naturally. Adding a slice of fresh ginger supports gentle digestion.':
    'अच्छी तरह उबाला गया और स्वाभाविक रूप से ठंडा हुआ पानी पिएं। ताजे अदरक का एक टुकड़ा मिलाने से पाचन को सहारा मिलता है।',
  'Preserving internal digestive warmth and avoiding prolonged exposure to wet clothes or damp breezes.':
    'आंतरिक पाचक अग्नि की रक्षा करना और भीगे कपड़ों या ठंडी सीलन भरी हवा के लंबे संपर्क से बचना।',
  'Warm water baths are recommended. Rubbing the skin with dry herbal powders (Udvartana) helps dispel dampness.':
    'गुनगुने पानी से स्नान अनुशंसित है। त्वचा पर सूखे हर्बल चूर्ण से मालिश (उद्वर्तन) सीलन और चिपचिपाहट दूर करने में मदद करती है।',
  'Dry, clean, and light garments that keep the torso warm. A gentle natural incense (dhoop) can be used to keep living spaces dry.':
    'सूखे, स्वच्छ और हल्के वस्त्र जो शरीर को गर्म रखें। कमरों में नमी दूर रखने के लिए प्राकृतिक धूप/अगरबत्ती का प्रयोग किया जा सकता है।',
  'Daytime sleep (Divaswapna) is discouraged as it increases sluggishness and moisture in the channels. Maintain regular nighttime sleep.':
    'दिन में सोना (दिवास्वप्न) वर्जित है क्योंकि यह सुस्ती और स्रोतों में अवरोध बढ़ाता है। रात की नियमित नींद बनाए रखें।',
  'Gentle to moderate indoor yoga and stretching. Avoid heavy exertion or getting soaked in cold rain.':
    'घर के भीतर सौम्य से मध्यम योग और स्ट्रेचिंग। अत्यधिक कड़े व्यायाम या ठंडी बारिश में भीगने से बचें।',
  'Ritu Sandhi (the 14-day junction period between seasons) requires gently tapering the cooling summer routine and introducing warm, cooked foods gradually.':
    'ऋतु संधि (दो ऋतुओं के बीच का १४ दिवसीय संक्रांति काल) के दौरान ग्रीष्म के शीतल नियमों को धीरे-धीरे कम करते हुए गर्म व पके आहार को अपनाएं।',
  'Classically, this season is considered favorable for Panchakarma (therapeutic detox procedures) — these should only be undertaken under the guidance of a qualified Ayurvedic physician, never self-administered.':
    'शास्त्रीय रूप से यह ऋतु पंचकर्म (शोधन प्रक्रियाओं) के लिए उपयुक्त मानी जाती है — इन्हें केवल योग्य आयुर्वेदिक चिकित्सक के मार्गदर्शन में ही कराएं, कभी भी स्वयं न करें।',

  // ── Sharad (Autumn) ──
  'The sun re-emerges after clouds clear, while lunar energy continues to nourish the earth and moderate human vitality.':
    'बादल छंटने के बाद सूर्य पुनः प्रकाशित होता है, जबकि चंद्र ऊर्जा पृथ्वी को पोषण देती रहती है और जीवन शक्ति को संतुलित रखती है।',
  'Gradually Rekindling (Recovering from monsoon dampness)':
    'क्रमशः प्रदीप्त होती अग्नि (वर्षा ऋतु की दुर्बलता से उबरती हुई)',
  'As the monsoon clouds part, sudden exposure to the clear autumn sun heats the body, causing the Pitta that accumulated during the rainy season to naturally flare up, while Vata calms down. Sweet and bitter flavors help keep inner heat balanced.':
    'जैसे ही बादल छंटते हैं, शरद ऋतु की तीखी धूप शरीर को गर्म करती है, जिससे वर्षा में संचित पित्त प्रकुपित हो जाता है, जबकि वात शांत होता है। मधुर और तिक्त (कड़वे) रस आंतरिक गर्मी को संतुलित रखते हैं।',
  'Water purified naturally by sunlight during the day and moonlight at night (classically referred to as Hamsodaka) is considered soothing and clear.':
    'दिन में सूर्य की किरणों और रात में चंद्रमा की चांदनी से प्राकृतिक रूप से शुद्ध हुआ जल (शास्त्रीय रूप से हंसोदक) अमृत समान और शीतल माना जाता है।',
  'Cooling the mind and body naturally without suppressing digestion.':
    'पाचन को कमजोर किए बिना शरीर और मन को स्वाभाविक रूप से शीतलता प्रदान करना।',
  'Lukewarm or gently cool baths. Applying sandalwood paste or vetiver (khus) water provides soothing comfort.':
    'ताजे या हल्के शीतल जल से स्नान। चंदन का लेप या खस का जल लगाने से सुखद ठंडक मिलती है।',
  'Light, breathable white or pastel cotton clothing that does not trap excess body heat.':
    'हल्के, हवादार सफेद या हल्के रंग के सूती वस्त्र जो शरीर की गर्मी को रोककर न रखें।',
  'Rest under gentle moonlight (Chandrika) in early evening is classically encouraged for its calming lunar effect. Avoid daytime naps.':
    'शाम को सुखद चांदनी (चंद्रिका) में बैठना शीतलता और मानसिक शांति के लिए शास्त्रीय रूप से प्रशंसित है। दिन में सोने से बचें।',
  'Moderate exercise, preferably in the cooler morning or evening hours. Gentle Moon Salutations (Chandra Namaskar) and cooling Sheetali pranayama.':
    'मध्यम व्यायाम, विशेषकर सुबह या शाम के ठंडे समय। सौम्य चंद्र नमस्कार और शीतली प्राणायाम का अभ्यास करें।',
  'During Ritu Sandhi, reduce heavy monsoon spices and smoothly introduce naturally sweet and bitter foods over 14 days.':
    'ऋतु संधि में वर्षा के भारी मसालों को घटाते हुए १४ दिनों में प्राकृतिक रूप से मीठे और तिक्त आहार को शामिल करें।',

  // ── Hemant (Early Winter) ──
  'Peak lunar strength period. The environment is cool, and the human body attains its highest natural physical vitality and endurance.':
    'परम विसर्ग काल। वातावरण शीतल होता है, और मानव शरीर अपनी स्वाभाविक उच्चतम शारीरिक शक्ति व सहनशक्ति (उत्तम बल) प्राप्त करता है।',
  'Peak / Highest (Uttama Bala)': 'उत्तम बल (सर्वोच्च शारीरिक शक्ति)',
  'Tikshna (Strong & Robust Digestive Fire)': 'तीक्ष्ण अग्नि (अत्यंत सुदृढ़ और तीव्र पाचक अग्नि)',
  'Cold external temperatures cause internal heat to concentrate in the digestive tract, making Agni robust and efficient. With the digestive fire at its peak, the body can easily process rich, nourishing foods to build physical resilience.':
    'बाहर की ठंडक आंतरिक गर्मी को जठराग्नि में केंद्रित कर देती है, जिससे पाचक अग्नि अत्यंत तीव्र हो जाती है। अग्नि के शिखर पर होने से शरीर पौष्टिक और भारी आहार को भी आसानी से पचाकर धातु पोषण करता है।',
  'Sip warm or hot water throughout the day. It supports continuous digestion and keeps the throat comfortable.':
    'दिन भर गुनगुना या गर्म पानी पिएं। यह निरंतर पाचन को सहारा देता है और गले को आराम पहुंचाता है।',
  'Nourishing tissues, regular exercise, and daily warm oil self-massage.':
    'सप्त धातुओं का पोषण, नियमित व्यायाम और गुनगुने तेल से नित्य अभ्यंग।',
  'Warm, comfortable baths following a full-body self-massage (Abhyanga) with warm sesame oil.':
    'गुनगुने तिल के तेल से पूरे शरीर की मालिश (अभ्यंग) के बाद सुखद गर्म पानी से स्नान।',
  'Warm woolen fabrics, thermal layers, and head coverings when venturing into chilly outdoor winds.':
    'गर्म ऊनी वस्त्र और ठंडी हवाओं में बाहर निकलते समय सिर व कानों को ढक कर रखना।',
  'Nights are long; retiring early and rising slightly before dawn keeps the mind refreshed.':
    'रातें लंबी होती हैं; समय पर सोना और सूर्योदय से थोड़ा पहले उठना मन को ताजगी देता है।',
  'Ideal season for vigorous physical training and stamina building up to half of one\'s full capacity (Ardha-Shakti).':
    'शारीरिक शक्ति और सहनशक्ति बढ़ाने के लिए अपनी आधी क्षमता (अर्ध-शक्ति) तक कड़े व्यायाम का सर्वश्रेष्ठ समय।',
  'Transitioning into Hemant allows a gradual step-up in meal richness and workout intensity across 14 days.':
    'हेमंत में प्रवेश करते समय १४ दिनों में भोजन की पौष्टिकता और व्यायाम की तीव्रता को धीरे-धीरे बढ़ाया जा सकता है।',

  // ── Shishir (Late Winter) ──
  'The sun begins its northward trajectory. Solar warmth gradually begins drawing moisture and energy from the physical world.':
    'सूर्य की उत्तरायण यात्रा प्रारंभ होती है। सौर ताप धीरे-धीरे वातावरण से स्निग्धता और ऊर्जा का अवशोषण शुरू करता है।',
  'Good to Moderate (Gradually declining from winter peak)':
    'अच्छा से मध्यम (शीतकालीन शिखर से धीरे-धीरे कम होता हुआ बल)',
  'Sama to Tikshna (Well-sustained Digestive Fire)':
    'सम से तीक्ष्ण (सुव्यवस्थित और तीव्र पाचक अग्नि)',
  'Intense dry cold and biting winds characterize late winter. While digestive power remains strong, environmental dryness begins accumulating Kapha inside the body. Warm, nourishing foods and active lifestyle prevent heaviness.':
    'तीव्र शुष्क ठंड और बर्फीली हवाएं शिशिर की पहचान हैं। पाचन शक्ति मजबूत रहती है, लेकिन वातावरण की रूक्षता शरीर में कफ का संचय शुरू करती है। गर्म, स्निग्ध आहार और सक्रिय दिनचर्या भारीपन को रोकती है।',
  'Warm water remains essential. Lukewarm water with a drop of honey in the morning helps clear sluggish mucus.':
    'गुनगुना पानी आवश्यक है। सुबह हल्के गुनगुने पानी में थोड़ा शहद मिलाकर पीने से कफ का संचय दूर होता है।',
  'Staying protected from harsh frost while keeping the body physically active.':
    'कड़ाके की ठंड से सुरक्षित रहना और साथ ही शरीर को शारीरिक रूप से सक्रिय बनाए रखना।',
  'Warm water bathing; warm oil massage (Abhyanga) remains a premier protective daily ritual.':
    'गर्म पानी से स्नान; गुनगुने तेल से मालिश (अभ्यंग) त्वचा की रक्षा का प्रमुख दैनिक नियम बना रहता है।',
  'Thick, warm garments that protect the ears, neck, and feet from cold drafts.':
    'मोटे, गर्म कपड़े जो कानों, गर्दन और पैरों को ठंडी हवाओं से बचाएं।',
  'Sleep in warm, draft-free rooms. Avoid sleeping during the daytime.':
    'हवा के सीधे झोंकों से मुक्त गर्म कमरे में सोएं। दिन में सोने से बचें।',
  'Energetic morning workouts, Surya Namaskar, and brisk walking in morning sunshine.':
    'सुबह की धूप में ऊर्जावान व्यायाम, सूर्य नमस्कार और तेज चलना।',
  'During Ritu Sandhi leading toward Spring, gradually introduce slightly lighter grains to prepare for Kapha liquefaction.':
    'वसंत की ओर बढ़ने वाले ऋतु संधि काल में वसंतकालीन कफ पिघलने से पहले हल्के अनाज अपनाना शुरू करें।',

  // ── Vasant (Spring) ──
  'The sun\'s strength rises. Environmental warmth melts winter snow and awakens nature, while bodily strength enters a moderate phase.':
    'सूर्य का तेज बढ़ता है। वातावरण की गर्मी शीतकाल के जमे कफ को पिघलाती है और प्रकृति जागती है; शारीरिक बल मध्यम अवस्था में आता है।',
  'Moderate (Declining toward summer)': 'मध्यम (ग्रीष्म की ओर घटता हुआ बल)',
  'Manda (Dampened by melting Kapha)': 'मन्द अग्नि (पिघलते हुए कफ के कारण मंद पड़ी पाचक अग्नि)',
  'The warmth of spring melts the Kapha that accumulated during winter, flooding the body\'s channels. This dampens digestive fire and often presents as seasonal heaviness, allergies, or morning sluggishness. Light, warming, and bitter tastes restore balance.':
    'वसंत की गर्मी सर्दियों में संचित कफ को पिघलाकर स्रोतों में फैला देती है। इससे पाचक अग्नि मंद पड़ जाती है और सुस्ती, एलर्जी या भारीपन होता है। हल्का, गर्म और तिक्त आहार संतुलन लौटाता है।',
  'Drink warm water infused with ginger or boiled with dried coriander seeds to assist the digestive fire.':
    'अग्नि को प्रदीप्त करने के लिए सोंठ या सूखे धनिए के बीजों के साथ उबाला गया गुनगुना पानी पिएं।',
  'Dispersing stagnant heaviness, waking early, and engaging in active movement.':
    'शरीर की सुस्ती और भारीपन को दूर करना, जल्दी जागना और सक्रिय शारीरिक गतिविधियों में लगना।',
  'Warm water baths preceded by vigorous dry herbal powder massage (Udvartana) to improve circulation.':
    'रक्तसंचार बेहतर करने के लिए सूखे हर्बल चूर्ण से मालिश (उद्वर्तन) के बाद गुनगुने पानी से स्नान।',
  'Light, comfortable layers suited to changing weather; avoid overly heavy winter coats.':
    'बदलते मौसम के अनुकूल हल्के व आरामदायक कपड़े; भारी शीतकालीन कोटों से बचें।',
  'Strictly avoid daytime naps (Divaswapna), which directly provoke Kapha and sinus congestion. Rise early at sunrise.':
    'दिन में सोने (दिवास्वप्न) से पूरी तरह बचें, जो कफ और जकड़न को बढ़ाता है। सूर्योदय के समय जल्दी उठें।',
  'Active, sweat-inducing exercise such as dynamic yoga, jogging, or cycling to mobilize accumulated winter stores.':
    'पसीना लाने वाले सक्रिय व्यायाम जैसे गतिशील योग, जॉगिंग या साइकिल चलाना ताकि जमा हुआ कफ पिघल सके।',
  'In Ritu Sandhi, taper off winter\'s heavy fats and introduce light, stimulating bitter foods over a two-week period.':
    'ऋतु संधि में सर्दियों के भारी घी-तेलों को घटाते हुए दो सप्ताह में हल्का और पाचक आहार शुरू करें।',

  // ── Grishma (Summer) ──
  'Peak solar intensity. The blazing sun and scorching winds absorb moisture from vegetation and human physiology, reducing physical strength.':
    'परम आदान काल। प्रखर सूर्य और लू वनस्पतियों और मानव शरीर की स्निग्धता सोख लेते हैं, जिससे शारीरिक बल न्यूनतम हो जाता है।',
  'Low (Alpa Bala)': 'अल्प बल (कम शारीरिक शक्ति)',
  'Manda / Variable (Depleted by extreme ambient heat)':
    'मन्द / विषम (अत्यधिक बाहरी गर्मी के कारण क्षीण हुई पाचक अग्नि)',
  'Intense heat draws out natural fluids and depletes strength, while Vata begins its subtle accumulation and Kapha calms. The body requires cooling, hydrating, sweet, and naturally unctuous foods to maintain hydration and calm inner heat.':
    'प्रचंड गर्मी शरीर के तरल पदार्थों को सुखाकर दुर्बलता लाती है, जिससे वात का संचय शुरू होता है और कफ शांत होता है। शरीर को शीतलता, जलयोजन और शांति देने वाले मधुर व स्निग्ध आहार की आवश्यकता होती है।',
  'Drink water cooled in traditional terracotta pots (matka). Adding vetiver roots (khus) gives a gentle, cooling aroma.':
    'पारंपरिक मिट्टी के घड़े (मटके) में ठंडा हुआ जल पिएं। खस की जड़ें डालने से जल सुगंधित और सुखद शीतल बनता है।',
  'Staying cool, avoiding direct midday sun, and preserving physical energy.':
    'शीतलता बनाए रखना, दोपहर की सीधी धूप से बचना और शारीरिक ऊर्जा का संरक्षण करना।',
  'Pleasant lukewarm or cool water baths. Gentle application of rose water or sandalwood paste.':
    'सुखद ताजे पानी से स्नान। त्वचा पर गुलाब जल या चंदन का लेप लगाना।',
  'Loose, ultra-light white cotton or linen fabrics that allow heat dissipation.':
    'ढीले, अत्यंत हल्के सफेद सूती या खादी के कपड़े जो शरीर की गर्मी को आसानी से बाहर निकलने दें।',
  'Summer is the only season where a short afternoon rest in a cool, shaded room is classically permitted to replenish lost fluids.':
    'ग्रीष्म एकमात्र ऐसी ऋतु है जहां खोए हुए तरलों की भरपाई के लिए ठंडे, छायादार कमरे में दोपहर की छोटी झपकी शास्त्रीय रूप से अनुमत है।',
  'Light, non-strenuous movement in early morning or late evening. Avoid exhausting mid-day workouts.':
    'सुबह जल्दी या देर शाम हल्का व्यायाम। थका देने वाले कड़े वर्कआउट से पूरी तरह बचें।',
  'Ritu Sandhi between summer and monsoon requires switching from cooling liquids to warm, light cooked meals to protect digestion.':
    'ग्रीष्म और वर्षा के बीच की ऋतु संधि में ठंडे पेयों से हटकर गर्म व सुपाच्य भोजन की ओर बढ़ें ताकि अग्नि सुरक्षित रहे।',

  // ── Common Food Items Across All Seasons ──
  'Old barley, wheat, and aged rice': 'पुराना जौ, गेहूं और पुराना चावल',
  'Warm moong dal with cumin and asafoetida (hing)': 'जीरा और हींग के साथ पकी गर्म मूंग दाल',
  'Small amounts of cow\'s ghee to protect digestion': 'पाचन की रक्षा के लिए सीमित मात्रा में देसी गाय का घी',
  'Boiled and cooled water, sometimes with a touch of honey': 'उबला व ठंडा पानी, कभी-कभी हल्का शहद मिलाकर',
  'Warming herbal infusions (ginger, tulsi, black pepper)': 'गर्म हर्बल पेय (अदरक, तुलसी, काली मिर्च)',
  'Raw salads and uncooked sprouts': 'कच्चा सलाद और बिना पके अंकुरित अनाज',
  'Heavy, oily, or deep-fried snacks': 'भारी, तैलीय या तले-भुने पकवान',
  'Daytime cold milk and unpasteurized curd': 'दिन में ठंडा दूध और खट्टा दही',
  'River water and unboiled rainwater': 'नदी का पानी या बिना उबला वर्षा जल',
  'Stale or leftover food from previous days': 'बासी या पिछले दिन का बचा हुआ भोजन',

  'Cooling sweet fruits (pomegranate, sweet grapes, amla)': 'शीतल मीठे फल (अनार, मीठे अंगूर, आंवला)',
  'Ghee and clarified butter in moderation': 'सीमित मात्रा में शुद्ध घी',
  'Light basmati rice, barley, and mung dal': 'हल्का बासमती चावल, जौ और मूंग दाल',
  'Boiled cow\'s milk infused with cardamom and saffron': 'इलायची और केसर युक्त उबला हुआ गाय का दूध',
  'Bitter leafy greens and tender cucumbers': 'तिक्त पत्तेदार सब्जियां और ताजा खीरा',
  'Pungent chilis, hot mustard, and raw garlic': 'तीखी लाल मिर्च, सरसों और कच्चा लहसुन',
  'Sour curds and heavily fermented items': 'खट्टा दही और अत्यधिक किण्वित (Fermented) खाद्य पदार्थ',
  'Excessive salt and heavily fried savories': 'अत्यधिक नमक और तली हुई नमकीन',
  'Heavy sesame oil and spicy pickles': 'भारी तिल का तेल और तीखा अचार',

  'Rich, warm stews and freshly harvested grains (new rice, wheat)': 'गर्म सूप और नए अनाज (नया चावल, गेहूं)',
  'Black gram (urad dal) and wholesome pulses': 'उड़द की दाल और पौष्टिक दालें',
  'Sesame seeds, jaggery, nuts, and dry fruits': 'तिल, गुड़, मेवे और सूखे फल',
  'Warm spiced milk with nutmeg and cinnamon': 'जायफल और दालचीनी वाला गर्म दूध',
  'Generous use of pure cow\'s ghee and sesame oil': 'शुद्ध गाय के घी और तिल के तेल का यथेष्ट प्रयोग',
  'Fasting or skipping meals (empty stomach allows strong Agni to irritate tissues)': 'उपवास या भोजन छोड़ना (खाली पेट तीव्र अग्नि को विकृत करता है)',
  'Cold drinks, raw salads, and iced desserts': 'ठंडे पेय, कच्चा सलाद और आइसक्रीम/बर्फ वाले व्यंजन',
  'Excessively light or airy dry crackers': 'अत्यधिक सूखे, रूखे या हवादार स्नैक्स',
  'Excess pungent or bitter foods in place of nourishing meals': 'पौष्टिक भोजन के स्थान पर अत्यधिक तीखा या कड़वा खाना',

  'Hearty grain bowls (wheat, oats, unpolished rice)': 'पौष्टिक साबुत अनाज (गेहूं, ओट्स, अनपॉलिश चावल)',
  'Sesame sweets, flax seeds, and warming nuts': 'तिल की मिठाई, अलसी और गर्म तासीर वाले मेवे',
  'Root vegetables, carrots, and beetroot': 'जड़ वाली सब्जियां, गाजर और चुकंदर',
  'Ginger-honey water and herbal broths': 'अदरक-शहद का पानी और गर्म हर्बल सूप',
  'Cow\'s ghee and nutrient-dense dals': 'गाय का घी और पोषण से भरपूर दालें',
  'Cold beverages and refrigerated leftover food': 'ठंडे पेय और फ्रिज में रखा बासी भोजन',
  'Light, drying salads with zero healthy fats': 'बिना घी-तेल वाले रूखे और सूखे सलाद',
  'Excessive astringent or bitter teas on an empty stomach': 'खाली पेट अत्यधिक कषाय या कड़वी चाय',

  'Barley, roasted chickpeas, and aged wheat': 'जौ, भुने हुए चने और पुराना गेहूं',
  'Moong dal, red lentils, and bitter gourd (karela)': 'मूंग दाल, मसूर दाल और करेला',
  'Warming spices: dry ginger, black pepper, and long pepper (Trikatu)': 'पाचक मसाले: सोंठ, काली मिर्च और पिप्पली (त्रिकटु)',
  'Raw honey in small amounts (never heated)': 'सीमित मात्रा में कच्चा शहद (कभी गर्म न करें)',
  'Warm herbal teas (tulsi, fennel, dry ginger)': 'गर्म हर्बल चाय (तुलसी, सौंफ, सोंठ)',
  'Heavy sweets, pastries, and ice creams': 'भारी मिठाइयां, पेस्ट्री और आइसक्रीम',
  'Cold whole milk, paneer, and rich curds': 'ठंडा गाढ़ा दूध, पनीर और भारी दही',
  'Deep-fried snacks and excessively oily foods': 'तले-भुने स्नैक्स और अत्यधिक तैलीय भोजन',
  'Excessive sweet and sour tastes that increase mucus': 'अत्यधिक मीठे और खट्टे स्वाद जो कफ बढ़ाते हैं',

  'Naturally sweet and hydrating fruits: watermelon, melons, sweet mangoes': 'प्राकृतिक मीठे व रसीले फल: तरबूज, खरबूजा, मीठा आम',
  'Fresh coconut water, buttermilk with roasted cumin, and cooling sattu': 'ताजा नारियल पानी, भुने जीरे वाली छाछ और ठंडा सत्तू',
  'Basmati rice, barley water, and light mung dal soup': 'बासमती चावल, जौ का पानी और मूंग दाल का हल्का सूप',
  'Cow\'s milk boiled with a pinch of cardamom and sugar candy': 'इलायची और मिश्री के साथ उबला हुआ गाय का दूध',
  'Cucumber, mint, coriander, and bottle gourd': 'खीरा, पुदीना, धनिया और लौकी',
  'Pungent red chilis, raw onions, and fiery spices': 'तीखी लाल मिर्च, कच्चा प्याज और गर्म मसाले',
  'Excessively salty snacks that dehydrate cells': 'अत्यधिक नमकीन स्नैक्स जो शरीर में पानी की कमी करते हैं',
  'Sour fermented foods and alcohol': 'खट्टे किण्वित खाद्य पदार्थ और नशीले पेय',
  'Hot, dry, or hard-to-digest heavy meats': 'गर्म, रूखा और पचने में भारी भोजन',
}

/**
 * Translates ritucharya text if language is Hindi and a translation exists.
 */
export function translateRitucharyaText(text: string | null | undefined, lang: Language): string {
  if (!text) return ''
  if (lang === 'hi') {
    return RITUCHARYA_TRANSLATIONS_HI[text] || text
  }
  return text
}
