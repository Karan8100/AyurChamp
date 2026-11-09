"""Static Prakriti question bank. Content only changes here — bump
QUESTION_BANK_VERSION whenever wording/options change so old
AssessmentSession rows stay interpretable against the version they used.
Images are NOT stored here — `image_key` maps to a static asset filename
(frontend/src/assets/prakriti/) that the frontend resolves locally. Only
visually-observable traits carry an image_key; the rest are text-only.
"""

from typing import Optional

QUESTION_BANK_VERSION = "v3"
DOSHAS = ("vata", "pitta", "kapha")

PHASE1_QUESTIONS = [
    {"id": "P1_1", "domain": "physical", "trait": "body_frame",
     "text": "Which best describes your natural body frame and bone structure?",
     "source_note": "CCRAS-PAS physical domain: body build (Sharira Akriti)",
     "options": [
         {"dosha": "vata", "text": "I have a slender, thin frame with prominent joints.", "image_key": "body_frame_vata", "display_label": "Slender & Lean"},
         {"dosha": "pitta", "text": "I have a moderate, well-proportioned frame.", "image_key": "body_frame_pitta", "display_label": "Medium & Athletic"},
         {"dosha": "kapha", "text": "I have a broad, solid, and sturdy frame.", "image_key": "body_frame_kapha", "display_label": "Broad & Solid"},
     ]},
    {"id": "P1_2", "domain": "physical", "trait": "skin_texture",
     "text": "How does your skin typically feel?",
     "source_note": "Charaka Samhita Vimana Sthana: Skin characteristics (Twak)",
     "options": [
         {"dosha": "vata", "text": "Often dry, rough, or feels cool to the touch.", "image_key": "skin_texture_vata", "display_label": "Dry & Cool"},
         {"dosha": "pitta", "text": "Warm, sensitive, and prone to flushing or freckles.", "image_key": "skin_texture_pitta", "display_label": "Warm & Sensitive"},
         {"dosha": "kapha", "text": "Naturally smooth, soft, and somewhat thick or oily.", "image_key": "skin_texture_kapha", "display_label": "Smooth & Oily"},
     ]},
    {"id": "P1_3", "domain": "physical", "trait": "hair_type",
     "text": "What is the natural texture and volume of your hair?",
     "source_note": "ACPI scale: Hair assessment item (Kesha)",
     "options": [
         {"dosha": "vata", "text": "Dry, thin, or tends to be frizzy.", "image_key": "hair_type_vata", "display_label": "Dry & Frizzy"},
         {"dosha": "pitta", "text": "Fine, soft, with a tendency for early thinning or graying.", "image_key": "hair_type_pitta", "display_label": "Fine & Soft"},
         {"dosha": "kapha", "text": "Thick, lustrous, wavy, and abundant.", "image_key": "hair_type_kapha", "display_label": "Thick & Wavy"},
     ]},
    {"id": "P1_4", "domain": "physical", "trait": "eye_appearance",
     "text": "Which description best matches your eyes?",
     "source_note": "CCRAS-PAS physical domain: Eye traits (Netra)",
     "options": [
         {"dosha": "vata", "text": "Small, active, and can easily feel dry.", "image_key": "eye_appearance_vata", "display_label": "Small & Active"},
         {"dosha": "pitta", "text": "Penetrating, bright, and sometimes sensitive to light.", "image_key": "eye_appearance_pitta", "display_label": "Sharp & Bright"},
         {"dosha": "kapha", "text": "Large, calm, and prominent with thick lashes.", "image_key": "eye_appearance_kapha", "display_label": "Large & Calm"},
     ]},
    {"id": "P1_5", "domain": "physiological", "trait": "digestion_appetite",
     "text": "How would you describe your appetite and digestion?",
     "source_note": "Ashtanga Hridaya Sutra Sthana: Digestive fire (Agni)",
     "options": [
         {"dosha": "vata", "text": "Variable; sometimes I am very hungry, other times I forget to eat."},
         {"dosha": "pitta", "text": "Strong and sharp; I need to eat on time and digest food quickly."},
         {"dosha": "kapha", "text": "Steady but slow; I can comfortably delay or skip a meal."},
     ]},
    {"id": "P1_6", "domain": "physiological", "trait": "sleep_pattern",
     "text": "What is your typical sleep pattern like?",
     "source_note": "CCRAS-PAS physiological domain: Sleep (Nidra)",
     "options": [
         {"dosha": "vata", "text": "Light; I wake up easily and sometimes struggle to fall back asleep."},
         {"dosha": "pitta", "text": "Moderate and sound; I sleep well but awaken feeling alert."},
         {"dosha": "kapha", "text": "Deep and prolonged; I love sleeping and struggle to wake up early."},
     ]},
    {"id": "P1_7", "domain": "physiological", "trait": "weather_preference",
     "text": "Which climate or weather do you find most uncomfortable?",
     "source_note": "ACPI scale: Environmental sensitivity",
     "options": [
         {"dosha": "vata", "text": "Cold and dry weather or strong winds."},
         {"dosha": "pitta", "text": "Hot, humid weather or direct, intense sunlight."},
         {"dosha": "kapha", "text": "Cold, damp, or gloomy, overcast weather."},
     ]},
    {"id": "P1_8", "domain": "physiological", "trait": "bowel_habit",
     "text": "How would you describe your typical bowel movements?",
     "source_note": "Charaka Samhita Vimana Sthana: Elimination patterns (Koshtha)",
     "options": [
         {"dosha": "vata", "text": "Irregular, tending toward dry or hard."},
         {"dosha": "pitta", "text": "Frequent, regular, and tending to be soft."},
         {"dosha": "kapha", "text": "Very regular, well-formed, and complete."},
     ]},
    {"id": "P1_9", "domain": "psychological", "trait": "thought_pattern",
     "text": "How does your mind typically operate when at rest?",
     "source_note": "CCRAS-PAS psychological domain: Mental activity (Manas)",
     "options": [
         {"dosha": "vata", "text": "Constantly active with many thoughts jumping around."},
         {"dosha": "pitta", "text": "Focused, analytical, and thinking about goals or solutions."},
         {"dosha": "kapha", "text": "Calm, steady, and unhurried."},
     ]},
    {"id": "P1_10", "domain": "psychological", "trait": "memory_retention",
     "text": "How does your memory generally work?",
     "source_note": "Ashtanga Hridaya Sutra Sthana: Memory characteristics (Smriti)",
     "options": [
         {"dosha": "vata", "text": "I learn things very quickly but also forget them quickly."},
         {"dosha": "pitta", "text": "I have a sharp memory and retain specific details well."},
         {"dosha": "kapha", "text": "I take time to learn new things, but once I do, I never forget."},
     ]},
    {"id": "P1_11", "domain": "psychological", "trait": "stress_response",
     "text": "When faced with unexpected stress, what is your first reaction?",
     "source_note": "ACPI scale: Emotional reactivity",
     "options": [
         {"dosha": "vata", "text": "I tend to feel anxious, worried, or overwhelmed."},
         {"dosha": "pitta", "text": "I tend to feel frustrated, impatient, or irritable."},
         {"dosha": "kapha", "text": "I tend to withdraw, avoid the issue, or remain calm."},
     ]},
    {"id": "P1_12", "domain": "psychological", "trait": "decision_making",
     "text": "What is your approach to making decisions?",
     "source_note": "CCRAS-PAS psychological domain: Decision capability",
     "options": [
         {"dosha": "vata", "text": "I often change my mind or second-guess myself."},
         {"dosha": "pitta", "text": "I gather facts and make quick, confident decisions."},
         {"dosha": "kapha", "text": "I take my time, consult others, and decide slowly."},
     ]},
    {"id": "P1_13", "domain": "behavioural", "trait": "speech_pace",
     "text": "How would others describe your speaking style?",
     "source_note": "CCRAS-PAS behavioural domain: Speech patterns (Vak)",
     "options": [
         {"dosha": "vata", "text": "Fast, talkative, and sometimes changing topics quickly."},
         {"dosha": "pitta", "text": "Clear, articulate, and purposeful."},
         {"dosha": "kapha", "text": "Slow, melodious, and deliberate."},
     ]},
    {"id": "P1_14", "domain": "behavioural", "trait": "activity_level",
     "text": "What is your natural pace of daily activity?",
     "source_note": "Ashtanga Hridaya Sutra Sthana: Physical activity level (Cheshta)",
     "options": [
         {"dosha": "vata", "text": "I am always on the move and like staying busy."},
         {"dosha": "pitta", "text": "I am driven and highly focused on completing tasks efficiently."},
         {"dosha": "kapha", "text": "I prefer a relaxed, leisurely pace and dislike rushing."},
     ]},
    {"id": "P1_15", "domain": "behavioural", "trait": "spending_habit",
     "text": "How do you generally handle your personal finances?",
     "source_note": "ACPI scale: Financial behaviour",
     "options": [
         {"dosha": "vata", "text": "I spend impulsively and find it hard to save money."},
         {"dosha": "pitta", "text": "I spend intentionally, often on quality items or experiences."},
         {"dosha": "kapha", "text": "I am naturally frugal and find saving money easy."},
     ]},
    {"id": "P1_16", "domain": "behavioural", "trait": "social_interaction",
     "text": "What is your preferred style of social interaction?",
     "source_note": "CCRAS-PAS behavioural domain: Social tendencies",
     "options": [
         {"dosha": "vata", "text": "I love meeting new people and having a wide variety of friends."},
         {"dosha": "pitta", "text": "I enjoy leading conversations and having a small, stimulating circle."},
         {"dosha": "kapha", "text": "I prefer deep, long-term relationships and familiar company."},
     ]},
    {"id": "P1_17", "domain": "physical", "trait": "lip_texture",
     "text": "How would you describe the natural texture and appearance of your lips?",
     "source_note": "Charaka Samhita Vimana Sthana: Oshta Lakshana (Lips)",
     "options": [
         {"dosha": "vata", "text": "Dry, thin, and frequently prone to chapping or cracking."},
         {"dosha": "pitta", "text": "Medium, soft, reddish, and sensitive to spicy/hot foods."},
         {"dosha": "kapha", "text": "Full, smooth, moist, and naturally well-lubricated."},
     ]},
    {"id": "P1_18", "domain": "physical", "trait": "touch_temperature",
     "text": "How do your hands and feet typically feel to touch throughout the year?",
     "source_note": "CCRAS-PAS physical domain: Sparsha Pareeksha (Extremity temperature)",
     "options": [
         {"dosha": "vata", "text": "Usually cool, dry, or have low circulation in extremities."},
         {"dosha": "pitta", "text": "Naturally warm, slightly moist, and easily warm up."},
         {"dosha": "kapha", "text": "Cool, pleasant, smooth, and neither too dry nor too warm."},
     ]},
    {"id": "P1_19", "domain": "physiological", "trait": "taste_preference",
     "text": "Which combination of food flavors (Rasas) do you naturally crave and enjoy most?",
     "source_note": "Ashtanga Hridaya: Rasa Satmya / Taste Ruchita",
     "options": [
         {"dosha": "vata", "text": "Sweet, sour, and salty foods with warm, grounding textures."},
         {"dosha": "pitta", "text": "Sweet, bitter, and astringent foods with cool, refreshing qualities."},
         {"dosha": "kapha", "text": "Pungent (spicy), bitter, and astringent foods with light, warm qualities."},
     ]},
    {"id": "P1_20", "domain": "physiological", "trait": "physical_endurance",
     "text": "How would you describe your natural physical stamina and recovery from exertion?",
     "source_note": "Charaka Samhita: Bala & Shrama Sahishnuta (Stamina)",
     "options": [
         {"dosha": "vata", "text": "Low baseline stamina; quick bursts of energy followed by sudden fatigue."},
         {"dosha": "pitta", "text": "Moderate stamina pushed by strong willpower; easily overheated."},
         {"dosha": "kapha", "text": "High natural endurance; takes time to warm up but can sustain effort for hours."},
     ]},
    {"id": "P1_21", "domain": "physiological", "trait": "perspiration_pattern",
     "text": "How easily do you sweat, and how is your body odor when physically active?",
     "source_note": "CCRAS-PAS physiological domain: Sweda (Sweating)",
     "options": [
         {"dosha": "vata", "text": "Scant sweating, minimal body odor, and skin remains dry even when active."},
         {"dosha": "pitta", "text": "Profuse sweating with mild exertion, heat, or spices, with distinct body warmth."},
         {"dosha": "kapha", "text": "Moderate, steady sweating only during heavy exertion, with pleasant/neutral odor."},
     ]},
    {"id": "P1_22", "domain": "psychological", "trait": "emotional_temperament",
     "text": "How quickly do you get irritated or angry, and how long does it take you to cool down?",
     "source_note": "Charaka Samhita: Krodha-Kshamata Lakshana (Anger & Calming)",
     "options": [
         {"dosha": "vata", "text": "I get anxious or irritated quickly, but forget and calm down just as quickly."},
         {"dosha": "pitta", "text": "I get angry or frustrated very quickly, and remain intense until the issue is resolved."},
         {"dosha": "kapha", "text": "I am naturally patient, rarely lose my temper, and forgive easily."},
     ]},
    {"id": "P1_23", "domain": "psychological", "trait": "dream_nature",
     "text": "What visual themes or scenery appear most often in your dreams?",
     "source_note": "CCRAS-PAS psychological domain: Svapna Pareeksha (Classical Dream Analysis)",
     "options": [
         {"dosha": "vata", "text": "Flying, running, heights, wind, sky, or feeling restless/chased."},
         {"dosha": "pitta", "text": "Fire, lightning, bright sun, debates, intense action, or golden light."},
         {"dosha": "kapha", "text": "Water bodies, oceans, rain, blooming lotuses, snow, or peaceful lakes."},
     ]},
    {"id": "P1_24", "domain": "behavioural", "trait": "walking_gait",
     "text": "How would you describe your natural walking rhythm and stride?",
     "source_note": "CCRAS-PAS behavioural domain: Gati (Locomotion & Gait)",
     "options": [
         {"dosha": "vata", "text": "Quick, light-footed, hurried, and changing speed frequently."},
         {"dosha": "pitta", "text": "Purposeful, steady, confident, and direct."},
         {"dosha": "kapha", "text": "Slow, graceful, grounded, and unhurried."},
     ]},
]

TIE_BREAKER_BANKS = {
    "vata_pitta": [
        {"id": "VP_1", "trait": "joint_structure", "text": "When you move, how do your joints generally feel or sound?",
         "source_note": "CCRAS-PAS physical domain: Joints (Sandhi)",
         "options": [
             {"dosha": "vata", "text": "They often pop or crack, and the bones feel prominent."},
             {"dosha": "pitta", "text": "They are relatively flexible, warm, and rarely crack."},
         ]},
        {"id": "VP_2", "trait": "vein_visibility", "text": "How visible are the veins and tendons on your hands and arms?",
         "source_note": "Charaka Samhita Vimana Sthana: Veins and tendons (Sira-Snayu)",
         "options": [
             {"dosha": "vata", "text": "They are highly visible and stand out prominently.", "image_key": "vein_visibility_vata", "display_label": "Highly Visible"},
             {"dosha": "pitta", "text": "They are moderately visible but not overly protruding.", "image_key": "vein_visibility_pitta", "display_label": "Moderately Visible"},
         ]},
        {"id": "VP_3", "trait": "thirst_level", "text": "How would you describe your natural feeling of thirst?",
         "source_note": "Ashtanga Hridaya Sutra Sthana: Thirst (Trishna)",
         "options": [
             {"dosha": "vata", "text": "Variable; I often forget to drink water throughout the day."},
             {"dosha": "pitta", "text": "Strong; I feel thirsty frequently and prefer cool drinks."},
         ]},
        {"id": "VP_4", "trait": "walking_pace", "text": "When you are walking alone, what is your natural pace?",
         "source_note": "ACPI scale: Gait and walking style (Gati)",
         "options": [
             {"dosha": "vata", "text": "Quick, light, and sometimes hurried."},
             {"dosha": "pitta", "text": "Confident, medium-paced, and determined."},
         ]},
        {"id": "VP_5", "trait": "working_style", "text": "How do you prefer to tackle a project?",
         "source_note": "CCRAS-PAS behavioural domain: Task execution",
         "options": [
             {"dosha": "vata", "text": "I like multitasking but sometimes jump between things without finishing."},
             {"dosha": "pitta", "text": "I prefer to organize, plan thoroughly, and execute systematically."},
         ]},
        {"id": "VP_6", "trait": "new_task_approach", "text": "When presented with a completely new challenge, how do you react?",
         "source_note": "ACPI scale: Adaptability",
         "options": [
             {"dosha": "vata", "text": "I start with immense enthusiasm, though it may fade quickly."},
             {"dosha": "pitta", "text": "I immediately look for ways to master it and take control."},
         ]},
        {"id": "VP_7", "trait": "voice_tone", "text": "What is the natural tone and pitch of your voice?",
         "source_note": "Charaka Samhita Vimana Sthana: Voice characteristics (Swara)",
         "options": [
             {"dosha": "vata", "text": "Slightly high-pitched, fast, or variable."},
             {"dosha": "pitta", "text": "Medium-pitched, clear, and commanding."},
         ]},
        {"id": "VP_8", "trait": "dream_patterns", "text": "What kind of dreams do you experience most frequently?",
         "source_note": "CCRAS-PAS psychological domain: Dreams (Svapna)",
         "options": [
             {"dosha": "vata", "text": "Dreams of flying, running, or feeling restless."},
             {"dosha": "pitta", "text": "Colorful, action-oriented, or problem-solving dreams."},
         ]},
        {"id": "VP_9", "trait": "sunlight_tolerance", "text": "How does your body react to staying out under strong direct sunlight or heat?",
         "source_note": "CCRAS-PAS physiological domain: Ushna Sahishnuta (Heat Tolerance)",
         "options": [
             {"dosha": "vata", "text": "I tolerate heat reasonably well, though it can dehydrate my skin."},
             {"dosha": "pitta", "text": "I get sunburned, dizzy, or irritable very quickly in strong heat."},
         ]},
        {"id": "VP_10", "trait": "debate_style", "text": "When a disagreement turns into a heated argument, what is your reaction?",
         "source_note": "CCRAS-PAS behavioural domain: Vada Shaili (Argumentative Style)",
         "options": [
             {"dosha": "vata", "text": "I jump between points and easily feel nervous or scattered."},
             {"dosha": "pitta", "text": "I am sharp, logical, articulate, and argue forcefully to win."},
         ]},
        {"id": "VP_11", "trait": "weight_fasting_reaction", "text": "How does your body react if you miss or delay a meal?",
         "source_note": "Charaka Samhita: Agni Bala & Dhatu stability",
         "options": [
             {"dosha": "vata", "text": "I lose energy quickly, feel dizzy or ungrounded, and lose weight easily."},
             {"dosha": "pitta", "text": "I get severe acidity, intense hunger headache, or extreme irritability."},
         ]},
    ],
    "pitta_kapha": [
        {"id": "PK_1", "trait": "muscle_tone", "text": "How would you describe your natural muscle tone?",
         "source_note": "CCRAS-PAS physical domain: Musculature (Mamsa)",
         "options": [
             {"dosha": "pitta", "text": "Moderate and well-defined, easily toned.", "image_key": "muscle_tone_pitta", "display_label": "Toned & Defined"},
             {"dosha": "kapha", "text": "Solid, dense, and naturally bulky.", "image_key": "muscle_tone_kapha", "display_label": "Solid & Dense"},
         ]},
        {"id": "PK_2", "trait": "sweat_pattern", "text": "How much do you typically sweat during moderate physical activity?",
         "source_note": "Charaka Samhita Vimana Sthana: Sweating (Sweda)",
         "options": [
             {"dosha": "pitta", "text": "I sweat profusely and warm up very quickly."},
             {"dosha": "kapha", "text": "I sweat mildly and it takes a long time for me to warm up."},
         ]},
        {"id": "PK_3", "trait": "complexion_tone", "text": "What is the natural undertone of your skin?",
         "source_note": "ACPI scale: Complexion (Varna)",
         "options": [
             {"dosha": "pitta", "text": "Warm, with reddish or coppery undertones.", "image_key": "complexion_tone_pitta", "display_label": "Warm / Reddish Tone"},
             {"dosha": "kapha", "text": "Cool, pale, or very clear and luminous.", "image_key": "complexion_tone_kapha", "display_label": "Cool & Fair Tone"},
         ]},
        {"id": "PK_4", "trait": "energy_curve", "text": "How does your energy fluctuate throughout the day?",
         "source_note": "Ashtanga Hridaya Sutra Sthana: Energy stamina (Bala)",
         "options": [
             {"dosha": "pitta", "text": "I have intense bursts of energy, especially in the midday."},
             {"dosha": "kapha", "text": "I have a very steady, enduring energy level from morning to night."},
         ]},
        {"id": "PK_5", "trait": "conflict_style", "text": "When a disagreement arises with a friend, how do you handle it?",
         "source_note": "CCRAS-PAS behavioural domain: Interpersonal conflict",
         "options": [
             {"dosha": "pitta", "text": "I address it directly and argue my point to find a logical resolution."},
             {"dosha": "kapha", "text": "I act as a peacemaker and try to accommodate to avoid tension."},
         ]},
        {"id": "PK_6", "trait": "routine_preference", "text": "How do you feel about having a strict daily routine?",
         "source_note": "ACPI scale: Lifestyle preferences",
         "options": [
             {"dosha": "pitta", "text": "I like routines if they make me efficient, but will break them for a goal."},
             {"dosha": "kapha", "text": "I love routines, find them comforting, and dislike sudden schedule changes."},
         ]},
        {"id": "PK_7", "trait": "hunger_tolerance", "text": "How do you react if a meal is delayed by a few hours?",
         "source_note": "Charaka Samhita Vimana Sthana: Digestive capacity (Agni bala)",
         "options": [
             {"dosha": "pitta", "text": "I become very irritable, shaky, or 'hangry'."},
             {"dosha": "kapha", "text": "I can comfortably wait without it affecting my mood much."},
         ]},
        {"id": "PK_8", "trait": "learning_environment", "text": "In a learning or group setting, what environment helps you thrive?",
         "source_note": "CCRAS-PAS psychological domain: Learning style",
         "options": [
             {"dosha": "pitta", "text": "A competitive environment with debates and clear objectives."},
             {"dosha": "kapha", "text": "A supportive, cooperative environment where everyone learns together."},
         ]},
        {"id": "PK_9", "trait": "spicy_food_reaction", "text": "How does your digestive tract react to rich, spicy, or fried meals?",
         "source_note": "CCRAS-PAS physiological domain: Tikshna Rasa Pratikriya",
         "options": [
             {"dosha": "pitta", "text": "It triggers quick heartburn, acidity, flushing, or loose stools."},
             {"dosha": "kapha", "text": "I tolerate and enjoy spicy foods well; they stimulate my digestion."},
         ]},
        {"id": "PK_10", "trait": "morning_state", "text": "How do you feel in the first 30 minutes after waking up in the morning?",
         "source_note": "Charaka Samhita: Prabodha Avastha (Morning Awakening)",
         "options": [
             {"dosha": "pitta", "text": "Alert, clear-minded, and ready to get to work right away."},
             {"dosha": "kapha", "text": "Pleasantly drowsy, slow to get moving, and craving a gentle start."},
         ]},
        {"id": "PK_11", "trait": "leadership_collaboration", "text": "In team projects, what role do you naturally assume?",
         "source_note": "CCRAS-PAS behavioural domain: Sangha Netritva (Leadership & Collaboration)",
         "options": [
             {"dosha": "pitta", "text": "Taking charge, directing decisions, and focusing on high efficiency."},
             {"dosha": "kapha", "text": "Maintaining group harmony, listening patiently, and ensuring steady execution."},
         ]},
    ],
    "vata_kapha": [
        {"id": "VK_1", "trait": "nail_texture", "text": "How would you describe the texture and strength of your nails?",
         "source_note": "Charaka Samhita Vimana Sthana: Nail characteristics (Nakha)",
         "options": [
             {"dosha": "vata", "text": "They tend to be brittle, thin, or have ridges.", "image_key": "nail_texture_vata", "display_label": "Brittle & Ridged"},
             {"dosha": "kapha", "text": "They are naturally strong, thick, and very smooth.", "image_key": "nail_texture_kapha", "display_label": "Strong & Smooth"},
         ]},
        {"id": "VK_2", "trait": "weight_fluctuation", "text": "How does your body typically handle weight management?",
         "source_note": "CCRAS-PAS physical domain: Weight stability",
         "options": [
             {"dosha": "vata", "text": "I find it hard to gain weight and lose it very easily."},
             {"dosha": "kapha", "text": "I gain weight very easily and find it difficult to lose."},
         ]},
        {"id": "VK_3", "trait": "teeth_alignment", "text": "Which best describes the appearance of your teeth?",
         "source_note": "Ashtanga Hridaya Sutra Sthana: Teeth structure (Danta)",
         "options": [
             {"dosha": "vata", "text": "They are somewhat uneven, small, or spaced out.", "image_key": "teeth_alignment_vata", "display_label": "Small & Uneven"},
             {"dosha": "kapha", "text": "They are large, even, and brightly colored.", "image_key": "teeth_alignment_kapha", "display_label": "Large & Even"},
         ]},
        {"id": "VK_4", "trait": "stamina_level", "text": "How would you rate your natural physical stamina?",
         "source_note": "ACPI scale: Physical endurance (Vyayama shakti)",
         "options": [
             {"dosha": "vata", "text": "I have short bursts of energy but exhaust quickly."},
             {"dosha": "kapha", "text": "I have excellent endurance and can sustain physical activity for a long time."},
         ]},
        {"id": "VK_5", "trait": "change_reaction", "text": "When a major life change occurs unexpectedly, how do you adapt?",
         "source_note": "CCRAS-PAS psychological domain: Adaptability to change",
         "options": [
             {"dosha": "vata", "text": "I generally embrace it and enjoy the sense of novelty."},
             {"dosha": "kapha", "text": "I tend to resist it initially because I strongly prefer the familiar."},
         ]},
        {"id": "VK_6", "trait": "friendship_style", "text": "How do you form friendships?",
         "source_note": "ACPI scale: Social bonds",
         "options": [
             {"dosha": "vata", "text": "I make friends very quickly, but we may easily drift apart over time."},
             {"dosha": "kapha", "text": "I take my time warming up to people, but keep friends for a lifetime."},
         ]},
        {"id": "VK_7", "trait": "recall_speed", "text": "When someone asks you a question about a past event, how is your recall?",
         "source_note": "Charaka Samhita Vimana Sthana: Recall speed (Smriti)",
         "options": [
             {"dosha": "vata", "text": "Instantaneous, though I might mix up minor details."},
             {"dosha": "kapha", "text": "It takes me a moment to retrieve the memory, but it is highly accurate."},
         ]},
        {"id": "VK_8", "trait": "pulse_feeling", "text": "If you place your hand on your chest, how does your heart rate generally feel?",
         "source_note": "CCRAS-PAS physiological domain: Pulse rhythm (Nadi proxy)",
         "options": [
             {"dosha": "vata", "text": "It feels fast, light, and sometimes skips a beat when I'm anxious."},
             {"dosha": "kapha", "text": "It feels very calm, slow, and remarkably steady."},
         ]},
        {"id": "VK_9", "trait": "sleep_duration_need", "text": "How much sleep do you naturally need to feel rested?",
         "source_note": "CCRAS-PAS physiological domain: Nidra Pramana (Sleep Duration)",
         "options": [
             {"dosha": "vata", "text": "5–6 hours is usually enough, though my sleep is light and irregular."},
             {"dosha": "kapha", "text": "8–9 hours of deep, unbroken sleep, and I dislike waking up early."},
         ]},
        {"id": "VK_10", "trait": "cold_climate_reaction", "text": "When the weather turns cold and rainy, how does your body react?",
         "source_note": "Charaka Samhita: Sheeta Sahishnuta (Cold Climate Sensitivity)",
         "options": [
             {"dosha": "vata", "text": "I get dry skin, stiff joints, cold extremities, and body shivering."},
             {"dosha": "kapha", "text": "I develop heavy sinus congestion, excessive mucus, and physical sluggishness."},
         ]},
        {"id": "VK_11", "trait": "attachment_possessions", "text": "How do you feel about your old personal belongings and keepsakes?",
         "source_note": "CCRAS-PAS psychological domain: Parigraha (Attachment to Possessions)",
         "options": [
             {"dosha": "vata", "text": "I easily give away or discard old things and do not stay attached."},
             {"dosha": "kapha", "text": "I hold onto old memories, gifts, and belongings with deep emotional attachment."},
         ]},
    ],
}


def find_question(question_id: str) -> Optional[dict]:
    for q in PHASE1_QUESTIONS:
        if q["id"] == question_id:
            return q
    for bank in TIE_BREAKER_BANKS.values():
        for q in bank:
            if q["id"] == question_id:
                return q
    return None
