
import { getColourClassForAqi, indexToPollutionBandFromAqi } from "../data/airquality-index.js"
import { checkReadingIsStale, fetchDeviceStats } from "../data/opensensemap.js"
// import { checkReadingIsStale, fetchDeviceStats } from "./data/fake-opensensemap.js"

import {  fadeElementInWhenAdding } from "../utils.js"

const samplePeriodHours = 1;

export function populateSensorReading(valuesContainer, boxid) {
    var latestDustReadingDate = valuesContainer.getAttribute("readingDate");
    var stale = checkReadingIsStale(latestDustReadingDate);
    var defraAqi;

    if (!stale) {
        fetchDeviceStats(boxid, "PM2.5", "geometricMean", samplePeriodHours)
            .then(pm25 => {
                fetchDeviceStats(boxid, "PM10", "geometricMean", samplePeriodHours)
                    .then(pm10 => {
                        defraAqi = (pm25 && pm10) ? Math.max(pm25.defraAqi, pm10.defraAqi) : "-";
                        valuesContainer.appendChild(sensorReading("", stale ? "-" : defraAqi ?? "-", ["title", "invisible"]));
                        fadeElementInWhenAdding(valuesContainer.querySelector(".value-badge"));
                    });
            });
    }
    else {
        valuesContainer.appendChild(sensorReading("", "-", ["value-badge-outline", "is-size-4"]))
    }
}



function sensorReading(units, reading, valueClasslist) {
    var readingLine = document.createElement("DIV");
    readingLine.classList.add("level-item");

    var inner = document.createElement("DIV");
    var value = document.createElement("DIV");

    var colorClass = getColourClassForAqi(reading);
    value.classList.add("value-badge", "is-size-4", "border", colorClass, ...valueClasslist);
    var valueP = document.createElement("P");
    valueP.innerText = '' + String(!reading || reading == "NaN" ? "-" : reading) + units;
    value.appendChild(valueP);

    var labelDiv = getInfoIconLinkWithText(indexToPollutionBandFromAqi(reading), "element-toggle");
    inner.appendChild(value);
    inner.appendChild(labelDiv);
    readingLine.appendChild(inner);
    return readingLine
}

function getInfoIconLinkWithText(text, forId) {
    var label = document.createElement("LABEL");
    label.htmlFor = forId;

    var a = document.createElement("A");
    a.classList.add("main-link");

    var textSpan = document.createElement("SPAN");
    textSpan.innerText = text;

    var i = document.createElement("I");
    i.classList.add("fas", "fa-info-circle", "has-text-grey", "ml-1");
    i.setAttribute("aria-hidden", "true");

    a.appendChild(textSpan);
    a.appendChild(i);

    label.appendChild(a);
    return label;
}