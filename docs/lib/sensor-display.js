/*
Provisional vanilla JS to populate sensor readings direcly from OpenMapSense API
Expects itemListContainer to exist - injects DOM objects inside of that

Experiments and custom CSS here:
    https://codepen.io/Formidablr/pen/WNrGGLW?editors=0110

Needs CSS classes for AQI ratings 1-10
*/


var sensorUrl = 'https://api.opensensemap.org/boxes?grouptag=cleanairfrome&full=true';
var streetnameUrl = 'https://nominatim.openstreetmap.org/reverse';
//alternative - https://geocode.xyz/51.22927,-2.33726?json=1

// var fetchbtn = document.querySelector("#fetch");
// fetchbtn.addEventListener("click", populateLiveView);

document.addEventListener("DOMContentLoaded", populateLiveView);

function populateLiveView() {
    fetch(sensorUrl).then(throwHttpErrors)
        .then(res => res.json())
        .then(updateReadings)
        .catch(printError);
}

function updateReadings(data) {
    var section = document.querySelector("#itemListContainer");
    section.innerText = '';
    data.sort(alphaSort);
    data.forEach(device => section.appendChild(
                        createInfoBox(device.name,
                                        getMeasurements(device.sensors)
                                    )                   
                            )
                )
    loadStreetNames(data);
}

function loadStreetNames(data) {
    data.forEach(device => {
        streetnameFromCoords(
            device.currentLocation.coordinates[1],
            device.currentLocation.coordinates[0],
            (street) => {
                var card = document.querySelector("#" + device.name + "-title");
                card.innerText = street;
            })
    })
}


var knownLocationStreets = new Map(
    [["51.224564,-2.32537", "Rossiter's Road"],
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

function getMeasurements(sensors) {
    return sensors.map(y => {
        return {
            name: y.title,
            type: y.sensorType,
            units: y.unit,
            reading: y.lastMeasurement.value,
            readingTaken: y.lastMeasurement.createdAt
        }
    });
}


function createInfoBox(deviceName, measurements) {
    var colorClass = getColourClassForMeasurements(measurements);
    var card = cardWithTitle(deviceName, colorClass);
    var values = document.createElement("DIV");
    values.classList.add("card-content");
    values.id = deviceName;
    measurements.forEach(measurement =>
        values.appendChild(sensorReading(...Object.values(measurement))));
    card.appendChild(values);
    card.appendChild(footerWithTextItems(["Sensor", "Values"]));
    return card;
}

/*
UK PM2.5 Index
Band	 Low	Low	   Low	Moderate	Moderate	Moderate	High	High	High	Very High
µgm-3	0-11	12-23	24-35	>36-41	  >42-47	  >48-53  	54-58	59-64	65-70	71 or more

UK PM10 index
Band	 Low  Low	  Low	  Moderate	Moderate	Moderate	High	High	High	  Very High
µg/m³	0-16	17-33	34-50	51-58	    59-66	    67-75	    76-83	84-91	92-100	101 or more
*/

// var airQualityClasses = ["aqi-1", 
//                          "aqi-2", 
//                          "aqi-3", 
//                          "aqi-4", 
//                          "aqi-5", 
//                          "aqi-6", 
//                          "aqi-7", 
//                          "aqi-8", 
//                          "aqi-9", 
//                          "aqi-10"];

var airQualityClasses = ["has-text-success",
    "has-text-success-dark",
    "has-text-primary",
    "has-text-primary-dark",
    "has-text-info",
    "has-text-link",
    "has-text-warning",
    "has-text-warning-dark",
    "has-text-danger",
    "has-text-danger-dark"];

var staleReadingClass = "has-text-grey-lighter";


function getColourClassForMeasurements(measurements) {
    //use light grey icon if values are stale
    if (readingIsStale(measurements)) return staleReadingClass;

    var aqIndex = getAqIndexForMeasurements(measurements);
    return airQualityClasses[aqIndex - 1];
}

function readingIsStale(measurements) {
    //TODO: work out if data is stale
    return false;
}

function getAqIndexForMeasurements(measurements) {
    var pm10 = measurements.find(x => x.name == 'PM10');
    var pm25 = measurements.find(x => x.name == 'PM2.5');
    return Math.max(pm25ToIndex(pm25.reading), pm10ToIndex(pm10.reading));
}

function pm25ToIndex(value) {
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
function pm10ToIndex(value) {
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

function cardWithTitle(titleText, iconColorClass) {
    var card = document.createElement("DIV");
    card.classList.add("card");
    card.appendChild(cardHeaderWithTitle(titleText, iconColorClass));
    card.appendChild(document.createElement("BR"));
    return card;
}

function cardHeaderWithTitle(titleText, iconColorClass) {
    var header = document.createElement("DIV");
    header.classList.add("card-header");

    var title = document.createElement("LABEL");
    title.classList.add("card-header-title");
    title.id = titleText + '-title';
    title.innerText = titleText;

    header.appendChild(title);
    var iconSpan = document.createElement("SPAN");
    iconSpan.classList.add("card-header-icon");
    var icon = document.createElement("I");
    icon.classList.add("fas", "fa-leaf", iconColorClass);
    iconSpan.appendChild(icon);
    header.appendChild(iconSpan);
    return header;
}

function footerWithTextItems(items) {
    var footer = document.createElement("DIV");
    footer.classList.add("card-footer");
    items.forEach(x => footer.appendChild(footerItemWithText(x)));
    return footer;
}

function footerItemWithText(text) {
    var footerContent = document.createElement("SPAN");
    footerContent.classList.add("card-footer-item");
    footerContent.innerText = text;
    return footerContent;
}

function sensorReading(name, type, units, reading, readingTaken) {
    var divReading = document.createElement("DIV");
    divReading.classList.add("level", "mx-4", "mb-5");
    var label = document.createElement("LABEL");
    var valueSpan = document.createElement("SPAN");
    label.innerText = name + ' - ' + type + ': ';
    valueSpan.innerText = reading + units;
    divReading.appendChild(label);
    divReading.appendChild(valueSpan);
    return divReading
}

function printError(error) {
    console.log(error);
}

function throwHttpErrors(request) {
    if (!request.ok) {
        throw Error(request.status);
    }
    return request;
}

function alphaSort(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // names must be equal
    return 0;
}