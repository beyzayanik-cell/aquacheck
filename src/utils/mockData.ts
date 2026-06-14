import { WaterRecord } from '../types';

export function generateStarterRecords(): WaterRecord[] {
  const records: WaterRecord[] = [];
  const startYear = 2026;
  let idCounter = 1;

  const months = [
    { num: 0, days: 31, name: 'Ocak', targetTotal: 6120 },
    { num: 1, days: 28, name: 'Şubat', targetTotal: 5840 },
    { num: 2, days: 31, name: 'Mart', targetTotal: 6320 },
    { num: 3, days: 30, name: 'Nisan', targetTotal: 5680 },
    { num: 4, days: 31, name: 'Mayıs', targetTotal: 5470 },
    { num: 5, days: 30, name: 'Haziran', targetTotal: 5300 }
  ];

  months.forEach(({ num, days, targetTotal }) => {
    const monthRecords: WaterRecord[] = [];
    let monthlySum = 0;

    for (let day = 1; day <= days; day++) {
      const monthStr = num + 1 < 10 ? '0' + (num + 1) : String(num + 1);
      const dateStr = `2026-${monthStr}-${day < 10 ? '0' + day : day}`;
      const dayOfWeek = new Date(startYear, num, day).getDay();

      // 1. Shower (Every day)
      const showerL = 65 + (day % 15); // ~65-79 L
      monthRecords.push({
        id: `h_${idCounter++}`,
        category: 'shower',
        liters: showerL,
        date: dateStr,
        time: '08:15',
        note: 'Standart konut duş bataryası kullanımı'
      });
      monthlySum += showerL;

      // 2. Kitchen (Every day)
      const kitchenL = 15 + (day % 10); // ~15-24 L
      monthRecords.push({
        id: `h_${idCounter++}`,
        category: 'kitchen',
        liters: kitchenL,
        date: dateStr,
        time: '12:10',
        note: 'Yiyecek yıkama ve pişirme suları'
      });
      monthlySum += kitchenL;

      // 3. Dish (Every day or alternating)
      if (day % 2 === 0) {
        const dishL = 25 + (day % 12); // ~25-36 L
        monthRecords.push({
          id: `h_${idCounter++}`,
          category: 'dish',
          liters: dishL,
          date: dateStr,
          time: '20:30',
          note: 'Mutfak tezgahı tabak durulama ve temizleme'
        });
        monthlySum += dishL;
      }

      // 4. Laundry (Tuesday, Thursday and Saturdays)
      if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
        const laundryL = 50 + (day % 20); // ~50-69 L
        monthRecords.push({
          id: `h_${idCounter++}`,
          category: 'laundry',
          liters: laundryL,
          date: dateStr,
          time: '14:45',
          note: 'Yüksek kapasiteli eko çamaşır yıkama'
        });
        monthlySum += laundryL;
      }

      // 5. Garden watering (Especially in Spring months: April and May)
      if (num >= 3 && day % 2 === 0) {
        const gardenL = 40 + (day % 25); // ~40-64 L
        monthRecords.push({
          id: `h_${idCounter++}`,
          category: 'garden',
          liters: gardenL,
          date: dateStr,
          time: '19:15',
          note: 'Bahçe bitkileri ve çim nemlendirme seansı'
        });
        monthlySum += gardenL;
      }

      // 6. Other tasks / Flushing (Every day)
      const otherL = 22 + (day % 14); // ~22-35 L
      monthRecords.push({
        id: `h_${idCounter++}`,
        category: 'other',
        liters: otherL,
        date: dateStr,
        time: '16:00',
        note: 'Rezervuar deşarjı ve ev hijyen uygulamaları'
      });
      monthlySum += otherL;
    }

    // Adjust record levels precisely to hit exactly the targetTotal!
    const diff = targetTotal - monthlySum;
    if (diff !== 0) {
      const adjustPerRecord = Math.floor(diff / monthRecords.length);
      let runningAdjusted = 0;

      for (let i = 0; i < monthRecords.length; i++) {
        if (i === monthRecords.length - 1) {
          monthRecords[i].liters += (diff - runningAdjusted);
        } else {
          monthRecords[i].liters += adjustPerRecord;
          runningAdjusted += adjustPerRecord;
        }
      }
    }

    // Add them to the final list
    records.push(...monthRecords);
  });

  return records;
}
