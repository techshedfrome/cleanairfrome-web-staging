
const sensorUrl = 'https://api.opensensemap.org/boxes?grouptag=cleanairfrome&full=true';

export function fetchMeasurements() {
   return  fetch(sensorUrl).then(throwHttpErrors)
                .then(res => res.json())
                .then(getSimpleDeviceObject)
}

function getSimpleDeviceObject(opensensemapDevices) {
    return  opensensemapDevices.map(x => {
                return   {
                        name : x.name,
                        latitude: x.currentLocation.coordinates[1],
                        longitude: x.currentLocation.coordinates[0],
                        streetname: "",
                        measurements : getMeasurements(x.sensors)
                    }
                })
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