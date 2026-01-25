// Nepali Date (Bikram Sambat) to AD (Gregorian) Converter
// Based on the Nepali calendar system

// Days in each month for BS years from 2000 to 2090
const BS_CALENDAR_DATA: { [key: number]: number[] } = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

// Reference date: BS 2000-01-01 = AD 1943-04-14
const BS_REFERENCE_DATE = { year: 2000, month: 1, day: 1 };
const AD_REFERENCE_DATE = new Date(1943, 3, 14); // April 14, 1943

/**
 * Parse BS date string in various formats
 * Supports: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
 */
export function parseBSDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  
  // Try different separators
  const separators = ['-', '/', '.'];
  for (const sep of separators) {
    const parts = dateStr.split(sep);
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return { year, month, day };
      }
    }
  }
  
  return null;
}

/**
 * Convert Bikram Sambat (BS) date to Gregorian (AD) date
 */
export function convertBStoAD(bsDate: { year: number; month: number; day: number }): Date | null {
  const { year, month, day } = bsDate;
  
  // Validate year range
  if (year < 2000 || year > 2090) {
    console.warn(`BS year ${year} is out of supported range (2000-2090)`);
    return null;
  }
  
  // Validate month
  if (month < 1 || month > 12) {
    console.warn(`Invalid BS month: ${month}`);
    return null;
  }
  
  // Calculate total days from reference date
  let totalDays = 0;
  
  // Add days for complete years
  for (let y = BS_REFERENCE_DATE.year; y < year; y++) {
    if (BS_CALENDAR_DATA[y]) {
      totalDays += BS_CALENDAR_DATA[y].reduce((sum, days) => sum + days, 0);
    }
  }
  
  // Add days for complete months in the given year
  for (let m = 1; m < month; m++) {
    if (BS_CALENDAR_DATA[year]) {
      totalDays += BS_CALENDAR_DATA[year][m - 1];
    }
  }
  
  // Add remaining days
  totalDays += day - 1;
  
  // Calculate AD date
  const adDate = new Date(AD_REFERENCE_DATE);
  adDate.setDate(adDate.getDate() + totalDays);
  
  return adDate;
}

/**
 * Convert BS date string to AD date string
 */
export function convertBSDateStringToAD(bsDateStr: string, format: 'YYYY-MM-DD' | 'DD-MMMM-YYYY' | 'readable' = 'YYYY-MM-DD'): string {
  const parsed = parseBSDate(bsDateStr);
  if (!parsed) return '';
  
  const adDate = convertBStoAD(parsed);
  if (!adDate) return '';
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const year = adDate.getFullYear();
  const month = adDate.getMonth();
  const day = adDate.getDate();
  
  switch (format) {
    case 'DD-MMMM-YYYY':
      return `${String(day).padStart(2, '0')}-${months[month]}-${year}`;
    case 'readable':
      return `${months[month]} ${day}, ${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}

/**
 * Convert AD date to BS date (approximate - for reference)
 */
export function convertADtoBS(adDate: Date): { year: number; month: number; day: number } | null {
  // Calculate days difference from reference
  const diffTime = adDate.getTime() - AD_REFERENCE_DATE.getTime();
  let daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    console.warn('Date is before the supported range');
    return null;
  }
  
  let bsYear = BS_REFERENCE_DATE.year;
  let bsMonth = 1;
  let bsDay = 1;
  
  // Find the year
  while (daysDiff >= 0 && bsYear <= 2090) {
    const yearData = BS_CALENDAR_DATA[bsYear];
    if (!yearData) break;
    
    const yearDays = yearData.reduce((sum, days) => sum + days, 0);
    
    if (daysDiff < yearDays) {
      // Find the month
      for (let m = 0; m < 12; m++) {
        if (daysDiff < yearData[m]) {
          bsMonth = m + 1;
          bsDay = daysDiff + 1;
          return { year: bsYear, month: bsMonth, day: bsDay };
        }
        daysDiff -= yearData[m];
      }
    }
    
    daysDiff -= yearDays;
    bsYear++;
  }
  
  return null;
}

/**
 * Format BS date to string
 */
export function formatBSDate(bsDate: { year: number; month: number; day: number }): string {
  return `${bsDate.year}-${String(bsDate.month).padStart(2, '0')}-${String(bsDate.day).padStart(2, '0')}`;
}

/**
 * Convert AD date string to BS date string
 */
export function convertADDateStringToBS(adDateStr: string): string {
  const date = new Date(adDateStr);
  if (isNaN(date.getTime())) return '';
  
  const bsDate = convertADtoBS(date);
  if (!bsDate) return '';
  
  return formatBSDate(bsDate);
}
