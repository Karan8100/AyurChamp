import type { Language } from '../lib/translations'

/**
 * Glossary-Constrained Hindi translations for Dinacharya & Lifestyle content.
 * Preserves classical Sanskrit terms (Gandusha, Kavala, Brahma Muhurta, Ushnodaka,
 * Jihwa Nirlekhana, Shatapadi, Pada Abhyanga, Ardha-Shakti, Pranayama)
 * while keeping lifestyle and conversational terms natural.
 */
export const LIFESTYLE_TRANSLATIONS_HI: Record<string, string> = {
  // ── Daily Clock Timeline: Rituals ──
  'Wake during Brahma Muhurta (around dawn) when the atmosphere is clearest':
    'ब्रह्म मुहूर्त (सूर्योदय से पूर्व) में जागें जब वातावरण शांत, स्वच्छ और सात्विक होता है',
  'Drink 1–2 glasses of warm water (Ushnodaka) to stimulate natural peristalsis':
    'पाचन क्रिया और प्राकृतिक मल त्याग को सक्रिय करने के लिए १-२ गिलास गुनगुना पानी (उष्णोदक) पिएं',
  'Tongue scraping (Jihwa Nirlekhana) using a copper or stainless steel scraper':
    'तांबे या स्टेनलेस स्टील के स्क्रैपर से जीभ की सफाई (जिह्वा निर्लेखन) करें ताकि विषाक्त पदार्थ दूर हों',
  'Oral oil care (Gandusha: holding warm sesame oil stationary in the mouth, or Kavala: gentle oil swishing) to strengthen gums and oral tissues':
    'मसूड़ों और दांतों की मजबूती के लिए ओरल ऑयल केयर (गंडूष: तिल का तेल मुंह में भरकर रखना, या कवल: तेल का कुल्ला करना)',
  'Engage in 20–30 minutes of energizing exercise or yoga before breakfast':
    'सुबह के नाश्ते (Breakfast) से पहले २०-३० मिनट ऊर्जावान योग या व्यायाम करें',

  'Eat the most substantial, nutrient-dense meal of the day between 12:00 PM – 1:00 PM':
    'दोपहर १२:०० से १:०० के बीच दिन का सबसे पौष्टिक और मुख्य भोजन (Lunch) करें',
  'Take a gentle 100-step stroll (Shatapadi) after lunch rather than sitting immediately':
    'दोपहर के भोजन के बाद तुरंत बैठने के बजाय १०० कदम की सौम्य चहलकदमी (शतपदी) करें',
  'Tackle high-priority professional tasks requiring sharp decision making and analytical focus':
    'तीव्र एकाग्रता और महत्वपूर्ण निर्णय लेने वाले जरूरी पेशेवर कार्य इस समय निपटाएं',
  'Avoid intense emotional confrontations or high-stress meetings during peak midday heat':
    'दोपहर की भीषण गर्मी के दौरान अत्यधिक मानसिक तनाव या तीखी भावनात्मक बहस से बचें',

  'Channel energy into creative thinking, brainstorming, communication, and synthesis':
    'अपनी मानसिक ऊर्जा को रचनात्मक सोच, नए विचारों के मंथन और संवाद में लगाएं',
  'Enjoy a warm cup of herbal tea (tulsi, ginger, or fennel) around 4:00 PM for grounding hydration':
    'अपराह्न ४:०० बजे के करीब तुलसी, अदरक या सौंफ की गर्म हर्बल चाय लें जो शांति और ताजगी दे',
  'Step away from screens for a 5-minute posture reset and deep diaphragmatic breathing':
    'स्क्रीन से ५ मिनट का विराम लें, रीढ़ सीधी करें और गहरी डायाफ्रामिक सांसें लें',
  'Wind down intense analytical work as 6:00 PM approaches':
    'शाम ६:०० बजते-बजते भारी विश्लेषणात्मक कार्यों को समेटना शुरू करें',

  'Eat a warm, light, freshly cooked dinner before 7:30 PM to allow complete digestion before bed':
    'सोने से पहले पूर्ण पाचन के लिए शाम ७:३० बजे से पहले हल्का, ताजा और गर्म भोजन (Dinner) करें',
  'Practice digital sunset: turn off bright screens and harsh overhead lighting by 9:00 PM':
    'डिजिटल सनसेट: रात ९:०० बजे तक मोबाइल/लैपटॉप स्क्रीन और तेज लाइटें बंद कर दें',
  'Engage in quiet reading, gentle conversation, or 5–10 minutes of calming pranayama':
    'शांत अध्ययन, प्रियजनों से हल्की बातचीत या ५-१० मिनट का सुखद प्राणायाम करें',
  'Retire to bed by 10:00 PM before the midnight Pitta metabolic surge begins':
    'रात १०:०० बजे तक सोने चले जाएं, इससे पहले कि मध्यरात्रि की पित्त ऊर्जा जागृत हो',

  // ── Sleep Temperaments ──
  'Light, variable sleeper prone to waking between 2:00 AM – 4:00 AM if overstimulated or anxious.':
    'हल्की व संवेदनशील नींद, तनाव या अधिक उत्तेजना की स्थिति में रात २:०० से ४:०० के बीच नींद खुलने की संभावना।',
  'Sound, moderate sleeper prone to postponing sleep for late-night problem solving or reading.':
    'गहरी व मध्यम नींद, देर रात तक काम करने, पढ़ाई या विचार-विमर्श के कारण सोने में देरी करने की आदत।',
  'Deep, heavy sleeper prone to morning grogginess and oversleeping past sunrise if not awakened by an alarm.':
    'अत्यधिक गहरी व भारी नींद, सुबह उठने में भारीपन और बिना अलार्म के सूर्योदय के बाद तक सोते रहने की प्रवृत्ति।',

  // ── Bedtime Rituals: Vata ──
  'Dim artificial lights and disconnect from screens by 9:00 PM':
    'रात ९:०० बजे तक कृत्रिम लाइटें धीमी करें और स्क्रीन से दूर हो जाएं',
  'Warm foot massage (Pada Abhyanga) with warm sesame oil before resting':
    'सोने से पहले गुनगुने तिल के तेल से पैरों की मालिश (पाद अभ्यंग) करें',
  'Sip a small cup of warm spiced milk with nutmeg and green cardamom':
    'जायफल और छोटी इलायची वाला एक छोटा कप गुनगुना दूध पिएं',
  'Keep the bedroom comfortably warm, quiet, and protected from drafts':
    'बेडरूम को सुखद रूप से गर्म, शांत और सीधी ठंडी हवा से सुरक्षित रखें',

  // ── Bedtime Rituals: Pitta ──
  'Step away from intense work discussions or bright blue screens by 9:30 PM':
    'रात ९:३० बजे तक गंभीर कार्य चर्चाओं और नीली स्क्रीन से अलग हो जाएं',
  'Keep the bedroom well-ventilated, cool, and dark':
    'बेडरूम को हवादार, शीतल और शांत रखें',
  'Apply a dab of cooling rose water or pure sandalwood oil to the temples and wrists':
    'कनपटी और कलाई पर शीतल गुलाब जल या शुद्ध चंदन का तेल लगाएं',
  'Read calming, contemplative literature rather than stimulating thrillers':
    'उत्तेजक थ्रिलर के बजाय शांत और विचारोत्तेजक साहित्य पढ़ें',

  // ── Bedtime Rituals: Kapha ──
  'Eat an early, light dinner at least 3 hours before sleep to allow full digestion':
    'सोने से कम से कम ३ घंटे पहले हल्का भोजन (Dinner) करें ताकि पूर्ण पाचन हो सके',
  'Rise promptly upon waking without lounging or lingering in bed':
    'सुबह आंख खुलते ही बिना बिस्तर पर पड़े रहे तुरंत उठ जाएं',
  'Avoid sleeping during the daytime (Divaswapna), as it directly creates sluggishness':
    'दिन में सोने (दिवास्वप्न) से बचें, क्योंकि यह सीधे सुस्ती और कफ बढ़ाता है',
  'Keep bedding comfortable but not excessively warm or plush':
    'बिस्तर आरामदायक रखें लेकिन अत्यधिक गर्म या जरूरत से ज्यादा गद्देदार नहीं',

  // ── Exercise Intensity Meanings ──
  'Exercise only up to half of personal capacity; cease when light perspiration appears on forehead and breathing remains rhythmic.':
    'केवल अपनी व्यक्तिगत क्षमता के आधे (अर्ध-शक्ति) तक ही व्यायाम करें; माथे पर हल्का पसीना आने और सांस लयबद्ध रहने तक ही अभ्यास करें।',
  'Avoid pushing to exhaustive burnout or intense aggression; keep movement joyful and physically centered.':
    'थका देने वाली अति या आक्रामकता से बचें; व्यायाम को आनंददायक, शीतल और संतुलित बनाए रखें।',
  'Kapha benefits most from sweat-inducing, stimulating exertion that clears sluggishness and awakens metabolic circulation.':
    'कफ प्रकृति को पसीना लाने वाले, ऊर्जावान व्यायाम से सबसे अधिक लाभ होता है जिससे सुस्ती दूर होती है और मेटाबॉलिज्म सक्रिय होता है।',

  // ── Exercise Modalities: Vata ──
  'Restorative and grounding Hatha Yoga': 'विश्रामदायक व स्थिरता देने वाला हठ योग',
  'Slow, mindful Surya Namaskar (Sun Salutations)': 'धीमा और सचेत सूर्य नमस्कार (Surya Namaskar)',
  'Gentle walking in tranquil nature or parks': 'शांत वातावरण या पार्क में सौम्य टहलना',
  'Joint rotations and gentle stretching (Sukshma Vyayama)': 'जोड़ों की गतिशीलता और सूक्ष्म व्यायाम (Sukshma Vyayama)',

  // ── Exercise Modalities: Pitta ──
  'Cooling Moon Salutations (Chandra Namaskar)': 'शीतलता देने वाला चंद्र नमस्कार (Chandra Namaskar)',
  'Gentle swimming in pleasant, temperate water': 'सुखद तापमान वाले पानी में सौम्य तैराकी',
  'Brisk evening walks in cool twilight or moonlight': 'शाम की ठंडी हवा या चांदनी में तेज चाल से टहलना',
  'Flowing Vinyasa yoga practiced in a well-ventilated, unheated room': 'हवादार कमरे में विन्यास योग का अभ्यास',

  // ── Exercise Modalities: Kapha ──
  'Dynamic, brisk Surya Namaskar (Sun Salutations)': 'गतिशील व ऊर्जावान सूर्य नमस्कार (Surya Namaskar)',
  'Aerobic movement: jogging, cycling, or brisk incline walking': 'एरोबिक व्यायाम: जॉगिंग, साइकिल चलाना या तेज चलना',
  'Dynamic Ashtanga or Power Yoga flows': 'अष्टांग या पावर योग का गतिशील प्रवाह',
  'Rhythmic jumping or skipping to mobilize stagnant lymphatic fluid': 'कफ और सुस्ती दूर करने के लिए रस्सी कूदना या हल्की जंपिंग',

  // ── Optimal Workout Times ──
  'Early morning (7:00 AM – 8:30 AM) or sunset twilight (5:00 PM – 6:00 PM)':
    'प्रातः काल (7:00 AM – 8:30 AM) या सूर्यास्त की वेला (5:00 PM – 6:00 PM)',
  'Early morning before the sun reaches peak heat (6:00 AM – 7:30 AM) or cool dusk':
    'तेज धूप आने से पहले प्रातः काल (6:00 AM – 7:30 AM) या शाम की ठंडी वेला',
  'Morning hours (6:00 AM – 9:00 AM) to break through morning heaviness':
    'सुबह के घंटे (6:00 AM – 9:00 AM) सुबह के भारीपन को दूर करने के लिए',

  // ── Pranayama Descriptions ──
  'A deeply balancing and grounding breathwork practice that harmonizes the right and left brain hemispheres, steadying the nervous system.':
    'एक गहरा संतुलित और स्थिरता देने वाला प्राणायाम जो मस्तिष्क के दोनों गोलार्धों में सामंजस्य लाता है और तंत्रिका तंत्र को शांत करता है।',
  'A classical cooling breathing practice that draws soothing air across the tongue, pacifying internal metabolic heat and calming mental tension.':
    'एक शास्त्रीय शीतलता प्रदायक प्राणायाम जो जीभ से शीतल वायु अंदर खींचकर आंतरिक पाचक गर्मी को शांत करता है और मानसिक तनाव दूर करता है।',
  'An invigorating breathwork practice that generates internal warmth, clears sluggish respiratory channels, and sharpens mental focus.':
    'एक स्फूर्तिदायक प्राणायाम जो आंतरिक ऊर्जा उत्पन्न करता है, श्वास नलियों की रुकावट दूर करता है और मानसिक एकाग्रता को तीव्र करता है।',

  // ── Pranayama Steps: Nadi Shodhana ──
  'Sit comfortably with your spine erect and shoulders relaxed':
    'रीढ़ की हड्डी सीधी और कंधे ढीले रखकर आरामदायक स्थिति में बैठें',
  'Use the right thumb to gently close the right nostril and inhale deeply through the left':
    'दाहिने अंगूठे से दाहिना नथुना बंद करें और बाएं नथुने से धीरे-धीरे गहरी सांस लें',
  'Close the left nostril with your ring finger, release the right, and exhale smoothly':
    'अनामिका उंगली से बायां नथुना बंद करें, दाहिना खोलें और सहजता से सांस बाहर छोड़ें',
  'Inhale through the right nostril, close it, and exhale through the left to complete one round':
    'दाहिने नथुने से सांस अंदर लें, बंद करें और बाएं से बाहर छोड़ें — यह एक चक्र पूरा हुआ',

  // ── Pranayama Steps: Sheetali ──
  'Sit comfortably with your back straight and eyes gently closed':
    'कमर सीधी और आंखें बंद करके आरामदायक मुद्रा में बैठें',
  'Roll the tongue into a tube (or gently separate lips with teeth touching for Sheetkari)':
    'जीभ को नली (Tube) की तरह मोड़ें (या शीतकारी के लिए दांत मिलाकर होंठ खोलें)',
  'Inhale slowly and deeply through the curled tongue, feeling the cool draft':
    'मुड़ी हुई जीभ से ठंडी हवा को महसूस करते हुए धीरे-धीरे गहरी सांस अंदर खींचें',
  'Close the mouth and exhale smoothly through both nostrils':
    'मुंह बंद करें और दोनों नथुनों से धीरे-धीरे सांस बाहर छोड़ें',

  // ── Pranayama Steps: Bhastrika ──
  'Sit upright with spine erect and chest comfortably open':
    'रीढ़ सीधी और छाती खुली रखकर सीधे बैठें',
  'Take a deep breath in, then exhale forcefully through the nostrils while pulling the abdomen inward':
    'गहरी सांस लें, फिर पेट को अंदर खींचते हुए नथुनों से तेजी से सांस छोड़ें',
  'Allow the inhalation to happen passively, followed immediately by rhythmic, active exhalations':
    'सांस स्वाभाविक रूप से अंदर आने दें और तुरंत लयबद्ध तरीके से बाहर छोड़ें',
  'Practice in short cycles of 20–30 breaths, resting with normal breathing between rounds':
    '२०-३० सांसों के छोटे चक्रों में अभ्यास करें, चक्रों के बीच सामान्य सांस लेकर विश्राम करें',

  // ── Pranayama Contraindications ──
  'Avoid during severe cold, winter frost, or if experiencing acute throat infection.':
    'अत्यधिक ठंड, शीत लहर या गले में तीव्र संक्रमण की स्थिति में इस प्राणायाम से बचें।',
  'Avoid vigorous breathing exercises if pregnant, or if you have high blood pressure, vertigo, or a heart condition — consult a healthcare professional first.':
    'गर्भावस्था, उच्च रक्तचाप, चक्कर आने या हृदय रोग की स्थिति में तीव्र श्वास व्यायाम से बचें — पहले चिकित्सक से परामर्श लें।',

  // ── Weekly Vikriti Adaptations: Vata ──
  'Adapted for elevated Vata this week: Prioritizing grounding nervous-system calm, restorative bedtime rituals, and unhurried movement.':
    'इस सप्ताह बढ़े हुए वात के लिए अनुकूलित: तंत्रिका तंत्र को शांति, विश्रामदायक शयन नियम और सहज गति को प्राथमिकता।',
  'Bedtime nervous restlessness elevated: practice warm foot massage (Pada Abhyanga) with warm sesame oil and sip warm spiced milk before bed.':
    'सोते समय बेचैनी अधिक है: सोने से पहले गुनगुने तिल के तेल से पैरों की मालिश (पाद अभ्यंग) करें और गुनगुना दूध पिएं।',
  'Energy easily scattered: temporarily replace high-intensity cardio with slow joint movements, grounding nature walks, and restorative yoga.':
    'ऊर्जा बिखरी हुई महसूस हो रही है: भारी कार्डियो के बजाय जोड़ों के सूक्ष्म व्यायाम, प्रकृति में टहलना और विश्रामदायक योग करें।',
  'Focus on slow, unhurried Nadi Shodhana (Alternate Nostril Breathing) to soothe inner anxiety and ground racing thoughts.':
    'अशांत विचारों और बेचैनी को शांत करने के लिए सहज और धीमे नाड़ी शोधन प्राणायाम पर ध्यान केंद्रित करें।',

  // ── Weekly Vikriti Adaptations: Pitta ──
  'Adapted for elevated Pitta this week: Emphasizing thermal cooling, moderate evening exercise, and soothing nighttime wind-downs.':
    'इस सप्ताह बढ़े हुए पित्त के लिए अनुकूलित: आंतरिक शीतलता, शाम का मध्यम व्यायाम और मन को शांत करने वाले शयन नियम।',
  'Late-night mental heat elevated: ensure bedroom is cool and well-ventilated, disconnect from screens by 9:30 PM, and apply rose water to temples.':
    'देर रात मानसिक गर्मी बढ़ी हुई है: बेडरूम हवादार व ठंडा रखें, ९:३० बजे तक स्क्रीन बंद करें और कनपटी पर गुलाब जल लगाएं।',
  'Body heat running high: avoid hot midday workouts or competitive pressure; favor cooling evening swimming or relaxed moon salutations.':
    'शारीरिक गर्मी अधिक है: दोपहर में कड़े व्यायाम से बचें; शाम को शांत तैराकी या सौम्य चंद्र नमस्कार करें।',
  'Prioritize Sheetali / Sheetkari (Cooling Breath) to disperse excess internal heat and soothe irritability.':
    'अतिरिक्त आंतरिक गर्मी और चिड़चिड़ापन दूर करने के लिए शीतली / शीतकारी प्राणायाम को प्राथमिकता दें।',

  // ── Weekly Vikriti Adaptations: Kapha ──
  'Adapted for elevated Kapha this week: Prioritizing early morning rising, stimulating movement, and active daytime energy.':
    'इस सप्ताह बढ़े हुए कफ के लिए अनुकूलित: प्रातः जल्दी जागना, ऊर्जावान व्यायाम और दिन भर सक्रिय रहने को प्राथमिकता।',
  'Morning sluggishness elevated: set a firm wake-up time by 6:00 AM; strictly avoid daytime naps (Divaswapna) to clear heaviness.':
    'सुबह की सुस्ती अधिक है: सुबह ६:०० बजे तक उठने का पक्का नियम बनाएं; भारीपन मिटाने के लिए दिन में सोने (दिवास्वप्न) से पूरी तरह बचें।',
  'Circulation feels heavy: add an extra 15–20 minutes of dynamic morning Surya Namaskar or brisk cardio to awaken the metabolism.':
    'शरीर में भारीपन लग रहा है: मेटाबॉलिज्म जगाने के लिए सुबह के सूर्य नमस्कार या तेज चलने में १५-२० मिनट अतिरिक्त जोड़ें।',
  'Incorporate gentle stimulating breathwork (Bhastrika / Kapalabhati) in the morning to disperse sluggishness and clear breathing channels.':
    'सुस्ती दूर करने और श्वास नलियां साफ करने के लिए सुबह सौम्य उत्तेजक प्राणायाम (भस्त्रिका / कपालभाति) शामिल करें।',

  // ── Intensity Levels ──
  'Gentle to Moderate (Ardha-Shakti)': 'सौम्य से मध्यम (अर्ध-शक्ति)',
  'Moderate & Non-Competitive (Ardha-Shakti)': 'मध्यम व गैर-प्रतिस्पर्धी (अर्ध-शक्ति)',
  'Active, Dynamic & Energizing': 'सक्रिय, गतिशील व ऊर्जावान (अर्ध-शक्ति)',

  // ── Sleep Durations & Windows ──
  '7.5 – 8.5 Hours': '७.५ – ८.५ घंटे',
  '7.0 – 8.0 Hours': '७.० – ८.० घंटे',
  '6.0 – 7.0 Hours': '६.० – ७.० घंटे',
  '10:00 PM – 6:30 AM': 'रात १०:०० – सुबह ६:३०',
  '10:15 PM – 6:00 AM': 'रात १०:१५ – सुबह ६:००',
  '10:00 PM – 5:30 AM': 'रात १०:०० – सुबह ५:३०',

  // ── Pranayama Durations ──
  '5 to 10 minutes (approx. 10–12 unhurried cycles)': '५ से १० मिनट (लगभग १०–१२ सहज चक्र)',
  '5 to 8 minutes (approx. 12–15 slow cooling breaths)': '५ से ८ मिनट (लगभग १२–१५ धीमी शीतल सांसें)',
  '3 to 5 minutes in short, mindful rounds': '३ से ५ मिनट (छोटे, सचेत चक्रों में)',
}

/**
 * Translates lifestyle text if language is Hindi and a translation exists.
 */
export function translateLifestyleText(text: string | null | undefined, lang: Language): string {
  if (!text) return ''
  if (lang === 'hi') {
    if (LIFESTYLE_TRANSLATIONS_HI[text]) {
      return LIFESTYLE_TRANSLATIONS_HI[text]
    }
    // Dynamic match for seasonal note
    if (text.includes('environmental dampness and humidity encourage staying warm and dry')) {
      return text.replace(
        /^During (.+?) \((.+?)\), environmental dampness and humidity encourage staying warm and dry\. Keep workouts indoors or during clear mornings, dry thoroughly after baths, and avoid cold drafts while sleeping\./,
        '$1 ($2) के दौरान वातावरणीय नमी और सीलन के कारण स्वयं को गर्म और सूखा रखना आवश्यक है। कसरत घर के अंदर या स्वच्छ सुबह में करें, स्नान के बाद शरीर अच्छी तरह सुखाएं और सोते समय ठंडी हवा के झोंकों से बचें।'
      )
    }
    return text
  }
  return text
}
