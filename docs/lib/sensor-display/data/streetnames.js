
const streetnameUrl = 'https://nominatim.openstreetmap.org/reverse';
//alternative - https://geocode.xyz/51.22927,-2.33726?json=1

import { printError, throwHttpErrors } from "../utils.js"

export function loadStreetNames(data, success) {
    //TODO: should probably simplify the input to coords only
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
        ["51.237461,-2.314287", "Bath Road"],
        ["51.231351,-2.321146", "Market Place"],
        ["51.229655,-2.306153", "Hillside Drive"],

        ["51.2334,-2.3092", "Beechwood Avenue"],
        ["51.2302,-2.3041", "Styles Close"],
        ["51.2411,-2.3122", "Bath Road"],
        ["51.362,-2.384", "Frome Road"], 
        ["51.2248,-2.327", "The Butts"],
        ["51.227,-2.3218", "Keyford"],
]);
function streetnameFromCoords(lat, lon, success) {
    var locationKey = lat + ',' + lon;
    if (knownLocationStreets.has(locationKey)) {
        success(knownLocationStreets.get(locationKey));
        return;
    }

    var url = streetnameUrl + '?format=json&lat=' + lat + '&lon=' + lon
    console.debug("fetching streetname from " + url)

    fetch(url).then(throwHttpErrors)
        .then(res => res.json())
        .then((data) => {
            console.debug("result from " + url)
            console.debug(data)
            if (data.error) throw Error(data.error)
            knownLocationStreets.set(locationKey, data.address.road);
            console.debug(`"${locationKey}", "${data.address.road}"`);
            success(knownLocationStreets.get(locationKey));
        })
        .catch(printError);
}
