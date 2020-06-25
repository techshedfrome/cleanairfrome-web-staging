
/*
UK PM2.5 Index
Band	 Low	Low	   Low	Moderate	Moderate	Moderate	High	High	High	Very High
µgm-3	0-11	12-23	24-35	>36-41	  >42-47	  >48-53  	54-58	59-64	65-70	71 or more

UK PM10 index
Band	 Low  Low	  Low	  Moderate	Moderate	Moderate	High	High	High	  Very High
µg/m³	0-16	17-33	34-50	51-58	    59-66	    67-75	    76-83	84-91	92-100	101 or more
*/

var airQualityClasses = ["aqi-1",
    "aqi-2",
    "aqi-3",
    "aqi-4",
    "aqi-5",
    "aqi-6",
    "aqi-7",
    "aqi-8",
    "aqi-9",
    "aqi-10"];

var staleReadingClass = "has-text-grey-lighter";
const staleDataAgeInHours = 2;

export function latestDustReadingDate(measurements) {
    var dustDates = measurements.filter(x => x.name.startsWith("PM"))
        .map(x => moment(x.readingTaken));
    return moment.max(dustDates).toDate();
}


export function getColourClassForMeasurements(measurements) {
    //use light grey icon if values are stale
    if (readingIsStale(measurements)) return staleReadingClass;

    var aqIndex = getAqIndexForMeasurements(measurements);
    return airQualityClasses[aqIndex - 1];
}

export function readingIsStale(measurements) {
    // work out if data is stale
    var lastReading = moment(latestDustReadingDate(measurements));
    var twoHoursAgo = moment().subtract(staleDataAgeInHours, 'hours');
    return moment(lastReading).isBefore(twoHoursAgo);
}

export function getAqIndexForMeasurements(measurements) {
    var pm10 = measurements.find(x => x.name == 'PM10');
    var pm25 = measurements.find(x => x.name == 'PM2.5');
    return Math.max(pm25ToIndex(pm25.reading), pm10ToIndex(pm10.reading));
}

export function pm25ToIndex(value) {
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