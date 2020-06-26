
const sensorUrl = 'https://api.opensensemap.org/boxes?grouptag=cleanairfrome&full=true';
import { getAqIndexForMeasurements } from "./airquality-index.js"

export function fetchMeasurements() {
    return fetch(sensorUrl).then(throwHttpErrors)
        .then(res => res.json())
        .then(getSimpleDeviceObject)
}
const staleDataAgeInHours = 2;


function getSimpleDeviceObject(opensensemapDevices) {
    return opensensemapDevices.map(x => {
        return {
            name: x.name,
            latitude: x.currentLocation.coordinates[1],
            longitude: x.currentLocation.coordinates[0],
            streetname: "",
            measurements: getMeasurements(x.sensors),
            defraAqi: function () { return getAqIndexForMeasurements(this.measurements) },
            latestDustReadingDate: function () {
                var dustDates = this.measurements.filter(x => x.name.startsWith("PM"))
                    .map(x => moment(x.readingTaken));
                return moment.max(dustDates).toDate();
            },
            readingIsStale: function () { return checkReadingIsStale(this.latestDustReadingDate()) }
        }
    })
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
        throw Error(request.status);
    }
    return request;
}