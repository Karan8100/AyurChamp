export type DoshaKey = 'vata' | 'pitta' | 'kapha'

export interface DoshaEducationInfo {
  key: DoshaKey
  name: string
  elements: string
  bioRole: string
  simpleSummary: string
  qualities: string
  governs: string
  balanced: string
  imbalanced: string
  balancingTips: string
  bestFoods: string
  colorBadge: string
  iconColor: string
}

export const DOSHA_EDUCATION_DATA: Record<DoshaKey, DoshaEducationInfo> = {
  vata: {
    key: 'vata',
    name: 'Vata',
    elements: 'Air + Space (Vayu + Akasha)',
    bioRole: 'The Kinetic Force of Movement & Flow',
    simpleSummary: 'Vata acts like the wind in your body — powering all movement, breathing, nerve impulses, heartbeats, and mental creativity.',
    qualities: 'Dry, light, cold, mobile, subtle, and clear',
    governs: 'Nervous system, breathing, blood circulation, cellular movement, joints, and colon elimination',
    balanced: 'Creative, energetic, quick-thinking, adaptable, enthusiastic, and peaceful',
    imbalanced: 'Anxious, scattered mind, insomnia, dry skin, fatigue, bloating, and joint crackling',
    balancingTips: 'Follow a consistent daily rhythm, stay warm, practice oil massage (Abhyanga), and do slow grounding yoga.',
    bestFoods: 'Warm soups, cooked whole grains, cow ghee, root vegetables, warm milk, and sweet mild spices (cinnamon, ginger).',
    colorBadge: 'bg-[#E8F1FB] text-[#2C5282]',
    iconColor: 'text-[#4A5568]',
  },
  pitta: {
    key: 'pitta',
    name: 'Pitta',
    elements: 'Fire + Water (Agni + Jala)',
    bioRole: 'The Transformative Power of Digestion & Metabolism',
    simpleSummary: 'Pitta represents your internal fire — processing everything from the food you eat to thoughts, information, and body temperature.',
    qualities: 'Hot, sharp, light, oily, penetrating, and spreading',
    governs: 'Digestive fire (Agni), liver metabolism, enzyme secretions, body heat, vision, and sharp intellect',
    balanced: 'Sharp intellect, focused, natural leadership, warm digestion, glowing complexion, and decisiveness',
    imbalanced: 'Irritability, acid reflux, heartburn, inflammation, skin redness/acne, and impatience',
    balancingTips: 'Avoid excessive heat/direct sun, take relaxing walks in nature, practice cooling breathwork (Sheetali), and do not skip meals.',
    bestFoods: 'Cooling cucumbers, coconut water, coriander, fennel, sweet juicy fruits, ghee, and basmati rice. Avoid excessive chillies/sour vinegar.',
    colorBadge: 'bg-[#FDF0E1] text-[#9C4221]',
    iconColor: 'text-[#C05621]',
  },
  kapha: {
    key: 'kapha',
    name: 'Kapha',
    elements: 'Earth + Water (Prithvi + Jala)',
    bioRole: 'The Structural Foundation of Strength & Immunity',
    simpleSummary: 'Kapha provides the physical lubrication, structure, and emotional grounding — building your tissues, stamina, and deep immunity (Ojas).',
    qualities: 'Heavy, slow, cool, oily, smooth, dense, and stable',
    governs: 'Physical structure, muscle & bone mass, joint lubrication, fluid balance, lungs, immunity (Ojas), and memory retention',
    balanced: 'Calm, deeply compassionate, loyal, high physical stamina, steady mind, and sound restorative sleep',
    imbalanced: 'Lethargy, morning sluggishness, heavy sinus congestion, water retention, and weight gain',
    balancingTips: 'Wake up before sunrise (Brahma Muhurta), get vigorous daily exercise, take dry sauna/body brushing, and seek new stimulating activities.',
    bestFoods: 'Light warm soups, steamed greens, legumes (moong dal), bitter vegetables, honey, and warming pungent spices (black pepper, ginger, cumin).',
    colorBadge: 'bg-[#EAF3EA] text-[#22543D]',
    iconColor: 'text-[#2F855A]',
  },
}

export const DOSHA_EDUCATION_DATA_HI: Record<DoshaKey, DoshaEducationInfo> = {
  vata: {
    key: 'vata',
    name: 'वात (Vata)',
    elements: 'वायु + आकाश (Air + Space)',
    bioRole: 'गति व संचलन की जैविक ऊर्जा (Kinetic Force)',
    simpleSummary: 'वात शरीर में हवा की तरह काम करता है — यह आपकी सांस, नसों के संकेत, हृदय की धड़कन और मानसिक विचारों को नियंत्रित करता है।',
    qualities: 'रूखा, हल्का, शीतल, चल, सूक्ष्म और विशद (Dry, Light, Cold, Mobile)',
    governs: 'तंत्रिका तंत्र (Nervous System), श्वास गति, रक्त संचार, जोड़ों की गतिशीलता और मल त्याग',
    balanced: 'रचनात्मक, ऊर्जावान, त्वरित विचारक, सहज, उत्साहपूर्ण और मानसिक रूप से शांत',
    imbalanced: 'अति-चिंता, अनिद्रा, सूखापन, जोड़ों में दर्द, गैस/कब्ज और ध्यान भटकना',
    balancingTips: 'नियमित दिनचर्या रखें, ठंड से बचें, गुनगुने तिल के तेल से मालिश (अभ्यंग) करें और शांत व स्थिर वातावरण अपनाएं।',
    bestFoods: 'गर्म सूप, दलिया, घी, पकी हुई सब्जियां, दालें और सौम्य मसाले (इलायची, अदरक, दालचीनी)।',
    colorBadge: 'bg-[#E8F1FB] text-[#2C5282]',
    iconColor: 'text-[#4A5568]',
  },
  pitta: {
    key: 'pitta',
    name: 'पित्त (Pitta)',
    elements: 'अग्नि + जल (Fire + Water)',
    bioRole: 'पाचन, रूपांतरण व ऊर्जा की शक्ति (Metabolic Fire)',
    simpleSummary: 'पित्त आपके शरीर की आंतरिक अग्नि है — जो भोजन के पाचन से लेकर विचारों के विश्लेषण और शरीर के तापमान को नियंत्रित करता है।',
    qualities: 'उष्ण, तीक्ष्ण, हल्का, तैलीय, तीव्र और प्रसरणशील (Hot, Sharp, Light)',
    governs: 'पाचन अग्नि (Agni), चयापचय (Metabolism), शरीर का तापमान, दृष्टि और तीव्र बौद्धिक निर्णय',
    balanced: 'एकाग्र, बुद्धिमान, लक्ष्य-उन्मुख, तेज पाचक शक्ति और प्राकृतिक नेतृत्व क्षमता',
    imbalanced: 'गुस्सा, चिड़चिड़ापन, एसिडिटी (Acidity), सीने में जलन, अल्सर और त्वचा पर लाल दाने',
    balancingTips: 'तेज धूप और अत्यधिक गर्म माहौल से बचें, शीतली प्राणायाम करें, भोजन का समय न छोड़ें और नारियल तेल/चंदन का उपयोग करें।',
    bestFoods: 'ठंडा दूध, नारियल पानी, खीरा, सौंफ, धनिया, ताजे मीठे फल, घी और चावल। अधिक मिर्च-मसालों और खट्टे सिरके से बचें।',
    colorBadge: 'bg-[#FDF0E1] text-[#9C4221]',
    iconColor: 'text-[#C05621]',
  },
  kapha: {
    key: 'kapha',
    name: 'कफ (Kapha)',
    elements: 'पृथ्वी + जल (Earth + Water)',
    bioRole: 'शारीरिक स्थिरता, ओजस व संरचना (Structural Base)',
    simpleSummary: 'कफ शरीर को मजबूती, स्निग्धता और प्रतिरक्षा (Immunity) देता है — यह आपकी हड्डियों, मांसपेशियों और गहरी शांति का आधार है।',
    qualities: 'भारी, मन्द, शीतल, स्निग्ध, स्थिर और चिकना (Heavy, Slow, Cool, Stable)',
    governs: 'शारीरिक ढांचा, जोड़ों में चिकनाई, ओजस (रोग प्रतिरोधक क्षमता), फेफड़ों का संतुलन और गहरी नींद',
    balanced: 'शांत, स्नेही, धैर्यवान, निष्ठावान, उत्कृष्ट शारीरिक सहनशक्ति और भावनात्मक रूप से स्थिर',
    imbalanced: 'आलस्य, अत्यधिक नींद, बलगम/कफ जमना, भारीपन और वजन बढ़ने की प्रवृत्ति',
    balancingTips: 'सूर्योदय से पूर्व जागें, प्रतिदिन स्फूर्तिदायक व्यायाम करें, रूखे पाउडर से उबटन (उद्वर्तन) करें और नई चुनौतियों में मन लगाएं।',
    bestFoods: 'हल्का व गर्म भोजन, मूंग दाल, उबली हरी सब्जियां, पुराना शहद, काली मिर्च, सोंठ और जीरा। अधिक मीठे और तैलीय पदार्थों से बचें।',
    colorBadge: 'bg-[#EAF3EA] text-[#22543D]',
    iconColor: 'text-[#2F855A]',
  },
}

export function getDoshaEducationData(doshaKey: DoshaKey, lang: 'en' | 'hi'): DoshaEducationInfo {
  if (lang === 'hi') {
    return DOSHA_EDUCATION_DATA_HI[doshaKey] || DOSHA_EDUCATION_DATA[doshaKey]
  }
  return DOSHA_EDUCATION_DATA[doshaKey]
}
