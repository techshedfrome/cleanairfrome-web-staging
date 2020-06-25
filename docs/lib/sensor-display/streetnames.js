
const streetnameUrl = 'https://nominatim.openstreetmap.org/reverse';
//alternative - https://geocode.xyz/51.22927,-2.33726?json=1

export function loadStreetNames(data, success) {
    data.forEach(device => {
        streetnameFromCoords(
            device.latitude,
            device.longitude,
            (street) => {
                device.streetname = street;
                success(device);
            })
    })
}


var knownLocationStreets = new Map(
    [   ["51.224564,-2.32537", "Rossiter's Road"],
        ["51.22564,-2.32584", "The Butts"],
        ["51.22862,-2.31921", "Christchurch Street East"],
        ["51.23061,-2.32174", "Bath Street"],
        ["51.23264,-2.31054", "Rodden Road"],
        ["51.22927,-2.33726", "Nunney Road"],
        ["51.237461,-2.314287", "Bath Road"]]);
function streetnameFromCoords(lat, lon, success) {
    var locationKey = lat + ',' + lon;
    if (knownLocationStreets.has(locationKey)) {
        success(knownLocationStreets.get(locationKey));
        return;
    }

    console.log("fetching streetname from " + streetnameUrl)
    var url = streetnameUrl + '?format=json&lat=' + lat + '&lon=' + lon
    fetch(url).then(throwHttpErrors)
        .then(res => res.json())
        .then((data) => {
            knownLocationStreets.set(locationKey, data.address.road);
            success(knownLocationStreets.get(locationKey));
        })
        .catch(printError);
}

function throwHttpErrors(request) {
    if (!request.ok) {
        throw Error(request.status);
    }
    return request;
}