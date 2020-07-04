
const sensorUrl = 'https://api.opensensemap.org/boxes?grouptag=cleanairfrome';
import { getAqIndexForMeasurements, pm25ToIndex, pm10ToIndex } from "./airquality-index.js"

export function fetchMeasurements() {
    return new Promise((resolve) => {
        var devices = [
            createFakeDevice("FAKE-1", 51.224564, -2.32537),
            createFakeDevice("FAKE-2", 51.22564, -2.32584),
            createFakeDevice("FAKE-3", 51.22862, -2.31921),
            createFakeDevice("FAKE-4", 51.23061, -2.32174),
            createFakeDevice("FAKE-5", 51.23264, -2.31054),
            createFakeDevice("FAKE-6", 51.22927, -2.33726),
            createFakeDevice("FAKE-7", 51.237461, -2.314287)
        ];
        resolve(getSimpleDeviceObject(devices));
        return;
    })
}
const staleDataAgeInHours = 2;

function createFakeDevice(name, lat, lon) {
    var now = moment();
    var boxid = generateRandom(1, 50000);
    //make 1 in 5 appear offline
    var measurementDate = generateRandom(1, 5) != 1 ? now : now.subtract(staleDataAgeInHours + 1, "hours");
    return {
        createdAt: "2020-06-14T11:41:39.358Z",
        currentLocation: { timestamp: "2020-06-14T11:41:39.353Z", coordinates: [lon, lat], type: "Point" },
        description: name + " - description",
        exposure: "outdoor",
        grouptag: "cleanairfrome",
        lastMeasurementAt: measurementDate.format(),
        model: "luftdaten_sds011_dht22",
        name: name,
        updatedAt: "2020-06-27T11:41:30.957Z",
        _id: name + "5ee60cf3dc1438001b1036ea"
    };
}

function getSimpleDeviceObject(opensensemapDevices) {
    return opensensemapDevices.map(x => {
        return {
            boxid: x._id,
            name: x.name,
            latitude: x.currentLocation.coordinates[1],
            longitude: x.currentLocation.coordinates[0],
            streetname: "",
            description: x.description ?? "",
            lastMeasurementAt: x.lastMeasurementAt,
            defraAqi: function () { return getAqIndexForMeasurements(this.measurements) },
            latestDustReadingDate: function () { return this.lastMeasurementAt },
            readingIsStale: function () { return checkReadingIsStale(this.latestDustReadingDate()) }
        }
    })
}

export function fetchDeviceStats(boxid, phenomenon, statisticalOperation, sampleHours) {

    return new Promise((resolve) => {
        // random number between -20 and 110 to enable failed readings
        var value = generateRandom(0,110);
        if(value<0) value = '-';
        resolve(processValues([createFakeStat(boxid, phenomenon, value)], phenomenon));
        return;
    })

    // return fetch(statsUrl)
    //     .then(throwHttpErrors)
    //     .then(res => res.json().then(x => processValues(x, phenomenon))
    //     )
}

function generateRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function processValues(values, phenomenon) {
    values = values[0];
    //values are keyed by datetime, and not contained in a values array, so we have to find properties that are valid dates...
    var valueFields = Object.keys(values).filter(y => moment(y).isValid());
    var values = valueFields.map(x => values[x]);
    //not always a single value, even though sample window is the same ad the filter period
    // so we us a dumb MAX of the values provided (could use latest...?)
    values.value = Math.max(...values);
    if (phenomenon === "PM2.5")  values.defraAqi = pm25ToIndex(values.value);
    if (phenomenon === "PM10")   values.defraAqi = pm10ToIndex(values.value);
    return values;
}


function createFakeStat(sensorId, phenomenon , fakeValue) {
    return {
        "2020-06-30T15:00:00.000Z": fakeValue/2,
        "2020-06-30T18:00:00.000Z": fakeValue,
        defraAqi: '-',
        phenomenon: phenomenon,
        sensorId: sensorId,
        sensorType: "FAKE",
        unit: "µg/m³"
    };
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

function throwHttpErrors(request) {
    if (!request.ok) {
        console.log(request.Error);
        throw Error(request.status);
    };
    return request;
}
function printError(error) {
    console.log(error);
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


*/