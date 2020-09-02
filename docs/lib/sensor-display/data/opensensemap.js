
const sensorUrl = 'https://api.opensensemap.org/boxes?grouptag=cleanairfrome&full=true';
import { getAqIndexForMeasurements, pm25ToIndex, pm10ToIndex } from "./airquality-index.js"

import { throwHttpErrors } from "../utils.js"

export function fetchMeasurements() {
    return fetch(sensorUrl)
            .then(throwHttpErrors)
            .then(res => res.json())
            .then(getSimpleDeviceObject)
}
const staleDataAgeInHours = 2;

//TODO: add whitelist/initial list cache


const deviceWhitelist = 
[
"5eeba76aee9b25001b3ba5c7", //0
"5ee618b7dc1438001b14eb7f", //1
"5ee63c4adc1438001b233b53", //2
"5eeb8c02ee9b25001b30c6e0", //3
"5eeb9259ee9b25001b334899", //4
"5ee60cf3dc1438001b1036ea", //5
// "5eeba101ee9b25001b391ca0", //6
"5f021451b9d0aa001c3ebb78", //7
"5f06485a987fd4001b20527d", //8
]

function getSimpleDeviceObject(opensensemapDevices) {
    return opensensemapDevices
        .filter(x => deviceWhitelist.includes(x._id))
        .map(x => {
        console.debug(x);
        return {
            boxid: x._id, 
            name: x.name,
            latitude: x.currentLocation.coordinates[1],
            longitude: x.currentLocation.coordinates[0],
            streetname: "",
            description: x.description ?? "",
            lastMeasurementAt: x.lastMeasurement,
            measurements: getMeasurements(x.sensors),
            defraAqi:               function () { return getAqIndexForMeasurements(this.measurements) },
            latestDustReadingDate:  function () { return getLastDustReadingDateFromMeasurements(this.measurements) },
            readingIsStale:         function () { return checkReadingIsStale(this.latestDustReadingDate()) }
        }
    })
}

function getLastDustReadingDateFromMeasurements(measurements) {
    var dustDates = measurements.filter(x => x.name.startsWith("PM"))
        .map(x => moment(x.readingTaken));
    return moment.max(dustDates).toDate();
}

export function fetchDeviceStats(boxid, phenomenon, statisticalOperation, sampleHours) {
    var statsUrl = "https://api.opensensemap.org/statistics/descriptive/?format=json&download=false"
    // fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z
    statsUrl += "&boxid=" + boxid
    statsUrl += "&phenomenon=" + phenomenon
    statsUrl += "&operation=" + statisticalOperation
    statsUrl += "&window=" + sampleHours + "h"

    // columns = [boxId, boxName, exposure, height, lat, lon, phenomenon, sensorType, unit]
    statsUrl += "&columns=unit,sensorType,phenomenon" 

    var toDate = moment();
    var fromDate = toDate.subtract(sampleHours, 'hours');
    statsUrl += "&fromDate=" + fromDate.toISOString();
    statsUrl += "&toDate=" + toDate.toISOString()

    console.debug(statsUrl);
    return fetch(statsUrl)
        .then(throwHttpErrors)
        .then(res => res.json().then(x => {
                // console.log(phenomenon+ " stats:");
                // console.log(x);
                return processValues(x, phenomenon)
            })
        )
}


function processValues(values, phenomenon) {
    if (!values) {
        console.debug("empty response");
        return [0];
    }
    values = values[0];
    var mappedValues = getMappedValues(values);
    //not always a single value, even though sample window is the same ad the filter period
    // so we us a dumb MAX of the values provided (could use latest...?)
    mappedValues.value = Math.max(...mappedValues);
    if (phenomenon === "PM2.5") mappedValues.defraAqi = pm25ToIndex(mappedValues.value);
    if (phenomenon === "PM10")  mappedValues.defraAqi = pm10ToIndex(mappedValues.value);
    return mappedValues;
}

function getMappedValues(values) {
    //values are keyed by datetime, and not contained in a values array, so we have to find properties that are valid dates...
    if (!values) {
        console.debug("no data");
        return [0];
    }
    var valueFields = Object.keys(values).filter(y => moment(y).isValid());
    if (!valueFields || valueFields.length == 0) {
        console.debug("no values");
        return [];
    }
    console.debug("values: " + valueFields);
    var mappedValues = valueFields?.map(x => values[x]);
    return mappedValues;
}

export function checkReadingIsStale(latestDustReadingDate) {
    var freshnessLimit = moment().subtract(staleDataAgeInHours, 'hours');
    return moment(latestDustReadingDate).isBefore(freshnessLimit);
}

function getMeasurements(sensors) {
    return sensors.map(y => {
        return {
            name: y.title,
            type: y.sensorType,
            units: y.unit,
            reading: y.lastMeasurement.value,
            readingTaken: y.lastMeasurement.createdAt,
        }
    });
}


// Example box: https://opensensemap.org/explore/5eeba76aee9b25001b3ba5c7
//  Bulk download
//      https://docs.opensensemap.org/#api-Measurements-getData
//
//  smoothing data
//   https://docs.opensensemap.org/#api-Statistics-descriptive
//   Docs say [to-date] [optional]	[RFC3339Date]
//     validation says toDate is required & rejects RFC3339Date - UTC date works

//  https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-20T11:33:28Z&toDate=2020-06-27T11:33:28Z&window=1h&operation=arithmeticMean&format=json
//  https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-20T11:33:28Z&toDate=2020-06-27T11:33:28Z&window=10m&operation=harmonicMean&format=json
//      "No senseBoxes found"
//          phenomenon is case sensitive


/*
    We're aiming for a 1, 2 or 3 hr moving average

    Operations available:
        arithmeticMean, geometricMean, harmonicMean, max, median, min, mode, rootMeanSquare, standardDeviation, sum, variance


    
    https://api.opensensemap.org/statistics/descriptive/?
    boxid=5eeba76aee9b25001b3ba5c7
    &phenomenon=PM2.5
    &fromDate=2020-06-27T13:00:00Z
    &toDate=2020-06-27T14:00:00Z
    &window=1h
    &operation=harmonicMean
    &format=json

    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-27T13:00:00Z&toDate=2020-06-27T14:00:00Z&window=1h&operation=harmonicMean&format=json

    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T13:00:00.000Z": 0.9500000000000001
        }
    ]

    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-27T11:00:00Z&toDate=2020-06-27T14:00:00Z&window=1h&operation=harmonicMean&format=json
[
    {
        "sensorId": "5eeba76aee9b25001b3ba5ca",
        "2020-06-27T11:00:00.000Z": 1.1617650581410062,
        "2020-06-27T12:00:00.000Z": 0.8167551291309599,
        "2020-06-27T13:00:00.000Z": 0.8330249110320286
    }
]

    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-27T11:00:00Z&toDate=2020-06-27T14:00:00Z&window=3h&operation=harmonicMean&format=json
    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T09:00:00.000Z": 0.7194981705796314,
            "2020-06-27T12:00:00.000Z": 0.8194224813473212
        }
    ]
    
    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&fromDate=2020-06-27T11:00:00Z&toDate=2020-06-27T14:00:00Z&window=110m&operation=harmonicMean&format=json
    
    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z&window=3h&operation=harmonicMean&format=json
    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z&window=3h&operation=arithmeticMean&format=json
    
    https://api.opensensemap.org/statistics/descriptive/?
    boxid=5eeba76aee9b25001b3ba5c7&
    phenomenon=PM2.5&
    fromDate=2020-06-27T14:54:00Z&
    toDate=2020-06-27T14:54:00Z&
    window=3h&
    operation=harmonicMean&
    format=json



    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z&window=1h&operation=harmonicMean&format=json&download=false
    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z&window=1h&operation=arithmeticMean&format=json&download=false
    https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T14:54:00Z&toDate=2020-06-27T14:54:00Z&window=1h&operation=geometricMean&format=json&download=false



    harmonic mean
    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T14:00:00.000Z": 1.2816240943398634
        }
    ]
    arithmetic mean
    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T14:00:00.000Z": 1.31
        }
    ]
    geometric mean
    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T14:00:00.000Z": 1.357849848222598
        }
    ]


   https://api.opensensemap.org/statistics/descriptive/?boxid=5eeba76aee9b25001b3ba5c7&phenomenon=PM2.5&&fromDate=2020-06-27T13:54:00Z&toDate=2020-06-27T14:54:00Z&window=1m&operation=arithmeticMean&format=json
   values in period
   [
       {
           "sensorId": "5eeba76aee9b25001b3ba5ca",
           "2020-06-27T13:56:00.000Z": 1,
           "2020-06-27T14:00:00.000Z": 1,
           "2020-06-27T14:04:00.000Z": 1.3,
           "2020-06-27T14:12:00.000Z": 1.3,
           "2020-06-27T14:20:00.000Z": 1.3,
           "2020-06-27T14:16:00.000Z": 1.37,
           "2020-06-27T14:08:00.000Z": 1.58,
           "2020-06-27T14:24:00.000Z": 1.62
        }
    ]
    


result structure is annoying:
    [
        {
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "2020-06-27T14:00:00.000Z": 1.357849848222598
        }
    ]

should be:

            "sensorId": "5eeba76aee9b25001b3ba5ca",
            [
                {
                "date": "2020-06-27T14:00:00.000Z"
                "value": 1.357849848222598
                }
            ]
or at the very least:
            "sensorId": "5eeba76aee9b25001b3ba5ca",
            "values": [
                "2020-06-27T14:00:00.000Z": 1.357849848222598
            ]


bulk data fetch
?boxid=5eeba76aee9b25001b3ba5c7&
https://api.opensensemap.org/boxes/5ee63c4adc1438001b233b53/data/5ee63c4adc1438001b233b57?from-date=2020-06-27T13:54:00Z&to-date=2020-06-27T14:54:00Z&download=true&format=json
https://api.opensensemap.org/boxes/5ee63c4adc1438001b233b53/data/5ee63c4adc1438001b233b56?from-date=2020-06-27T13:54:00Z&to-date=2020-06-27T14:54:00Z&download=true&format=json



Seems very fast to download 3000 records for a week's worth of data.
Data is always a delimited file - default CSV
Multiple boxes can be included in boxid, comma separated
https://api.opensensemap.org/boxes/data?boxId=5ee63c4adc1438001b233b53&from-date=2020-06-27T13:54:00Z&to-date=2020-08-27T14:54:00Z&phenomenon=PM2.5
https://api.opensensemap.org/boxes/data?boxId=5ee63c4adc1438001b233b53&from-date=2020-06-27T13:54:00Z&to-date=2020-08-27T14:54:00Z&phenomenon=PM10

Can limit data going over the wire by selecting only the columns we need:
https://api.opensensemap.org/boxes/data?boxId=5ee63c4adc1438001b233b53&from-date=2020-06-27T13:54:00Z&to-date=2020-08-27T14:54:00Z&phenomenon=PM2.5&columns=createdAt,value

        */