import { TURKEY_PROVINCES_DAMS, DamDetail } from '../constants/provincesDams';

export interface WeatherDetail {
  temp: number;
  felt: number;
  humidity: number;
  wind: number;
  rainProb: number;
  uv: number;
  sunrise: string;
  sunset: string;
  aqi: number;
  aqiText: string;
  dLevel: 'safe' | 'risky' | 'watch' | 'critical';
  advice: string;
  savingScore: number;
  forecast: {
    day: string;
    minTemp: number;
    maxTemp: number;
    rainProb: number;
    icon: string;
    condition: string;
  }[];
}

export const PLATE_TO_REGION_MAP: Record<string, string> = {
  '34': 'Marmara', '16': 'Marmara', '41': 'Marmara', '54': 'Marmara', '59': 'Marmara', '10': 'Marmara', '17': 'Marmara', '22': 'Marmara', '39': 'Marmara', '77': 'Marmara', '11': 'Marmara',
  '35': 'Ege', '09': 'Ege', '48': 'Ege', '45': 'Ege', '20': 'Ege', '43': 'Ege', '64': 'Ege', '03': 'Ege',
  '01': 'Akdeniz', '07': 'Akdeniz', '33': 'Akdeniz', '31': 'Akdeniz', '46': 'Akdeniz', '80': 'Akdeniz', '15': 'Akdeniz', '32': 'Akdeniz', '79': 'Akdeniz',
  '06': 'İç Anadolu', '26': 'İç Anadolu', '42': 'İç Anadolu', '38': 'İç Anadolu', '50': 'İç Anadolu', '51': 'İç Anadolu', '40': 'İç Anadolu', '66': 'İç Anadolu', '58': 'İç Anadolu', '71': 'İç Anadolu', '18': 'İç Anadolu', '68': 'İç Anadolu', '70': 'İç Anadolu',
  '55': 'Karadeniz', '61': 'Karadeniz', '53': 'Karadeniz', '52': 'Karadeniz', '28': 'Karadeniz', '67': 'Karadeniz', '57': 'Karadeniz', '74': 'Karadeniz', '78': 'Karadeniz', '37': 'Karadeniz', '14': 'Karadeniz', '81': 'Karadeniz', '19': 'Karadeniz', '05': 'Karadeniz', '60': 'Karadeniz', '29': 'Karadeniz', '69': 'Karadeniz', '08': 'Karadeniz',
  '25': 'Doğu Anadolu', '44': 'Doğu Anadolu', '23': 'Doğu Anadolu', '65': 'Doğu Anadolu', '36': 'Doğu Anadolu', '04': 'Doğu Anadolu', '30': 'Doğu Anadolu', '12': 'Doğu Anadolu', '13': 'Doğu Anadolu', '49': 'Doğu Anadolu', '24': 'Doğu Anadolu', '62': 'Doğu Anadolu', '75': 'Doğu Anadolu', '76': 'Doğu Anadolu',
  '21': 'Güneydoğu Anadolu', '27': 'Güneydoğu Anadolu', '63': 'Güneydoğu Anadolu', '47': 'Güneydoğu Anadolu', '72': 'Güneydoğu Anadolu', '73': 'Güneydoğu Anadolu', '02': 'Güneydoğu Anadolu'
};

export const REGS_LIST = [
  { id: 'all', tr: 'Tüm Bölgeler', en: 'All Regions' },
  { id: 'Marmara', tr: 'Marmara', en: 'Marmara' },
  { id: 'Ege', tr: 'Ege', en: 'Aegean' },
  { id: 'Akdeniz', tr: 'Akdeniz', en: 'Mediterranean' },
  { id: 'İç Anadolu', tr: 'İç Anadolu', en: 'Central Anatolia' },
  { id: 'Karadeniz', tr: 'Karadeniz', en: 'Black Sea' },
  { id: 'Doğu Anadolu', tr: 'Doğu Anadolu', en: 'Eastern Anatolia' },
  { id: 'Güneydoğu Anadolu', tr: 'Güneydoğu Anadolu', en: 'Southeastern Anatolia' }
];

export function generateWeatherForCity(id: string, fullness: number, customDLevel?: 'safe' | 'risky' | 'watch' | 'critical'): WeatherDetail {
  const plateNum = parseInt(id) || 34;
  
  // Base temperature based on geography/plate code
  // plateNum impacts temp deterministically
  let baseTemp = 18 + (plateNum % 14);
  if (['07', '01', '33', '35', '48'].includes(id)) { // Antalya, Adana, Mersin, Izmir, Mugla
    baseTemp += 6; // Warmer
  } else if (['25', '36', '04', '30', '13'].includes(id)) { // Erzurum, Kars, Agri, Hakkari, Bitlis
    baseTemp -= 8; // Cooler
  }
  
  const temp = Math.round(baseTemp);
  const felt = Math.round(baseTemp + (plateNum % 4) - 1.5);
  const humidity = Math.min(95, Math.max(15, 30 + ((plateNum * 7) % 55))); // 30% to 85%
  const wind = 5 + ((plateNum * 3) % 25); // 5km/h to 30km/h
  const rainProb = (plateNum % 3 === 0) ? 70 : (plateNum % 5 === 0) ? 25 : 5; // deterministic rain chance
  const uv = Math.max(1, Math.min(10, Math.round(3 + (temp / 5) - (rainProb / 20))));
  
  // Sunrise & Sunset based on plate number
  const sunriseHour = 5 + (plateNum % 2);
  const sunriseMin = (plateNum * 4) % 60;
  const sunrise = `${String(sunriseHour).padStart(2, '0')}:${String(sunriseMin).padStart(2, '0')}`;
  
  const sunsetHour = 19 + (plateNum % 2);
  const sunsetMin = (plateNum * 2) % 60;
  const sunset = `${String(sunsetHour).padStart(2, '0')}:${String(sunsetMin).padStart(2, '0')}`;
  
  // AQI
  const aqi = 25 + ((plateNum * 11) % 115); // 25 to 140 AQI
  let aqiText = 'İyi (Good)';
  if (aqi > 100) aqiText = 'Hassas Gruplar İçin Sağlıksız';
  else if (aqi > 50) aqiText = 'Orta (Moderate)';
  
  // Determine drought risk
  let dLevel: 'safe' | 'risky' | 'watch' | 'critical' = 'safe';
  if (fullness <= 20) dLevel = 'critical';
  else if (fullness <= 40) dLevel = 'watch';
  else if (fullness <= 60) dLevel = 'risky';
  
  if (customDLevel) {
    dLevel = customDLevel;
  }
  
  // Agricultural advice
  let advice = 'Sulama periyodu normal: Haftada 2 kez sabah saatlerinde can suyu verilmelidir.';
  if (dLevel === 'critical' || temp >= 32) {
    advice = '⚠️ Kritik kuraklık ve aşırı sıcaklık nedeniyle sulamayı her gün gün batımı sonrasında yapın.';
  } else if (dLevel === 'watch' || temp > 27) {
    advice = 'Akşam serinliğinde veya sabah erken saatlerde süzme yapacak şekilde 2 günde bir sulama.';
  } else if (rainProb > 50) {
    advice = '🌧️ Bugün yüksek yağış beklendiği için bahçenizi sulamanıza gerek yoktur.';
  }
  
  // Savings Score: deterministic saving score for each city
  const savingScore = 45 + ((plateNum * 9) % 50) + (fullness > 50 ? 5 : 0);
  
  // 7-day prediction
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const forecast = days.map((day, idx) => {
    // slight variation from base values
    const daySeed = plateNum + idx;
    const minTemp = temp - 4 - (daySeed % 4);
    const maxTemp = temp + 2 + (daySeed % 5);
    const dayRainProb = (daySeed % 4 === 0) ? 80 : (daySeed % 7 === 0) ? 35 : 5;
    
    let icon = '☀️';
    let condition = 'Güneşli';
    if (dayRainProb > 60) {
      icon = '🌧️';
      condition = 'Yağmurlu';
    } else if (dayRainProb > 25) {
      icon = '🌤️';
      condition = 'Parçalı Bulutlu';
    }
    
    return {
      day,
      minTemp,
      maxTemp,
      rainProb: dayRainProb,
      icon,
      condition
    };
  });
  
  return {
    temp,
    felt,
    humidity,
    wind,
    rainProb,
    uv,
    sunrise,
    sunset,
    aqi,
    aqiText,
    dLevel,
    advice,
    forecast,
    savingScore
  };
}
