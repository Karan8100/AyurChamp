/**
 * Dynamic Ayurvedic Imagery & Atmosphere Resolver
 *
 * Provides diurnal (time-of-day) meal atmosphere visuals and
 * 6-season classical Ritucharya background artwork.
 * Images serve as general mindful lifestyle aesthetics, accompanied
 * by explicit transparency badges to avoid prescriptive meal confusion.
 */

export interface MealAtmosphereInfo {
  imageSrc: string
  timingTag: string
  hindiTimingTag: string
  phaseLabel: string
  hindiPhaseLabel: string
}

export function getMealAtmosphere(hour: number): MealAtmosphereInfo {
  // Morning: 06:00 to 11:00
  if (hour >= 6 && hour < 11) {
    return {
      imageSrc: '/images/meals/breakfast.jpg',
      timingTag: 'Morning Awakening • Prana Fuel (06:00 – 11:00)',
      hindiTimingTag: 'प्रातः अल्पाहार • प्राण ऊर्जा (०६:०० – ११:००)',
      phaseLabel: 'Morning Prana Table',
      hindiPhaseLabel: 'प्रातःकालीन सात्विक वातावरण',
    }
  }

  // Midday: 11:00 to 16:00 (Peak Digestive Agni)
  if (hour >= 11 && hour < 16) {
    return {
      imageSrc: '/images/meals/lunch.jpg',
      timingTag: 'Midday Agni Peak • Core Nourishment (11:00 – 16:00)',
      hindiTimingTag: 'मध्याह्न मुख्य भोजन • तीव्र अग्नि (११:०० – १६:००)',
      phaseLabel: 'Midday Feast Atmosphere',
      hindiPhaseLabel: 'मध्याह्न पोषण वातावरण',
    }
  }

  // Evening: 16:00 to 19:30 (Sunset Digestive Wind-down)
  if (hour >= 16 && hour < 19.5) {
    return {
      imageSrc: '/images/meals/evening_tonic.jpg',
      timingTag: 'Evening Digestive Tonic • Golden Hour (16:00 – 19:30)',
      hindiTimingTag: 'सायं पाचक पेय • संध्या शांति (१६:०० – १९:३०)',
      phaseLabel: 'Evening Restoration',
      hindiPhaseLabel: 'सायंकालीन सौम्य पेय',
    }
  }

  // Night / Rest: 19:30 to 06:00
  return {
    imageSrc: '/images/meals/dinner.jpg',
    timingTag: 'Night Tranquility • Light Nourishment (19:30 – 06:00)',
    hindiTimingTag: 'रात्रि विश्राम • सुपाच्य लघु आहार (१९:३० – ०६:००)',
    phaseLabel: 'Nighttime Serenity',
    hindiPhaseLabel: 'रात्रि शांति व लघु आहार',
  }
}

export function getSeasonAtmosphere(seasonId?: string): string {
  const normalized = (seasonId || '').trim().toLowerCase()
  const validSeasons = ['varsha', 'sharad', 'hemant', 'shishir', 'vasant', 'grishma']
  if (validSeasons.includes(normalized)) {
    return `/images/seasons/${normalized}.jpg`
  }
  return '/images/seasons/sharad.jpg'
}
