
/*
UK PM2.5 Index
Band	 Low	Low	   Low	Moderate	Moderate	Moderate	High	High	High	Very High
µgm-3	0-11	12-23	24-35	>36-41	  >42-47	  >48-53  	54-58	59-64	65-70	71 or more

UK PM10 index
Band	 Low  Low	  Low	  Moderate	Moderate	Moderate	High	High	High	  Very High
µg/m³	0-16	17-33	34-50	51-58	    59-66	    67-75	    76-83	84-91	92-100	101 or more
*/

const airQualityClasses = ["aqi-1",
    "aqi-2",
    "aqi-3",
    "aqi-4",
    "aqi-5",
    "aqi-6",
    "aqi-7",
    "aqi-8",
    "aqi-9",
    "aqi-10"];

const staleReadingClass = "has-text-grey-lighter";

export function getColourClassForAqi(defraAqi, readingIsStale) {
    //use light grey icon if values are stale
    if (readingIsStale) return staleReadingClass;
    return airQualityClasses[defraAqi - 1];
}
export function getAqIndexForMeasurements(measurements) {
    if (!measurements) return '-'
    var pm25 = measurements.find(x => x.name == 'PM2.5');
    var pm10 = measurements.find(x => x.name == 'PM10');
    return getAqIndexForValues(pm25, pm10);
}

export function getAqIndexForValues(pm2_5_value, pm10_value) {
    if (isNaN(pm2_5_value) || pm2_5_value < 0) pm2_5_value = 0;
    if (isNaN(pm10_value)  || pm10_value  < 0) pm10_value  = 0;
    if (pm2_5_value + pm10_value == 0) return '-'
    return Math.max(pm25ToIndex(pm2_5_value), pm10ToIndex(pm10_value));
}

export function pm25ToIndex(value) {
    if (!value || value == "-") return '-';
    if (value <= 11) return 1;
    if (value <= 23) return 2;
    if (value <= 35) return 3;
    if (value <= 41) return 4;
    if (value <= 47) return 5;
    if (value <= 53) return 6;
    if (value <= 58) return 7;
    if (value <= 64) return 8;
    if (value <= 70) return 9;
    return 10;
}
export function pm10ToIndex(value) {
    if (!value || value == "-") return '-';
    if (value <= 16) return 1;
    if (value <= 33) return 2;
    if (value <= 50) return 3;
    if (value <= 58) return 4;
    if (value <= 66) return 5;
    if (value <= 75) return 6;
    if (value <= 83) return 7;
    if (value <= 91) return 8;
    if (value <= 100) return 9;
    return 10;
}



const pollutionBandClasses = [
    "aqi-band-low",
    "aqi-band-moderate",
    "aqi-band-high",
    "aqi-band-very-high",
];

export function getColourClassForPollutionBandFromAqi(defraAqi, readingIsStale) {
    //use light grey icon if values are stale
    if (readingIsStale) return staleReadingClass;
    return pollutionBandClasses[indexToPollutionBandNumberFromAqi(defraAqi) - 1];
}


const pollutionBandText = [
    "Low",
    "Moderate",
    "High",
    "Very High",
];

export function indexToPollutionBandFromAqi(index) {
    if (!index || index == "-") return 'Coming soon';
    var band = indexToPollutionBandNumberFromAqi(index);
    if (!band || band == "-") return 'Coming soon';
    return pollutionBandText[band - 1];
}

function indexToPollutionBandNumberFromAqi(index) {
    if (!index || index == "-") return '-';
    if (index <= 3) return 1;
    if (index <= 6) return 2;
    if (index <= 9) return 3;
    return 4;
}
