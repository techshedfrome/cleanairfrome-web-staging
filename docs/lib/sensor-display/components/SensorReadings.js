
import { getColourClassForAqi, indexToPollutionBandFromAqi } from "../data/airquality-index.js"
import { checkReadingIsStale, fetchDeviceStats } from "../data/opensensemap.js"
// import { checkReadingIsStale, fetchDeviceStats } from "./data/fake-opensensemap.js"

import {  fadeElementInWhenAdding } from "../utils.js"

const samplePeriodHours = 1;

export function populateSensorReading(valuesContainer, boxid) {
    console.log('populateSensorReading');
    var latestDustReadingDate = valuesContainer.getAttribute("readingDate");
    var stale = checkReadingIsStale(latestDustReadingDate);
    // device_id="1" pm2_5_value="47.6" pm10_value="86.4"
    valuesContainer.setAttribute("device_id", boxid);
    valuesContainer.setAttribute("last_seen", latestDustReadingDate);

    if (!stale) {
        fetchDeviceStats(boxid, "PM2.5", "geometricMean", samplePeriodHours)
            .then(pm25 => {
                fetchDeviceStats(boxid, "PM10", "geometricMean", samplePeriodHours)
                    .then(pm10 => {

                        valuesContainer.setAttribute("pm2_5_value", pm25);
                        valuesContainer.setAttribute("pm10_value", pm10);
                        
                        var defraAqi = (pm25 && pm10) ? Math.max(pm25.defraAqi, pm10.defraAqi) : "-";
                        valuesContainer.appendChild(sensorReading(stale, "", stale ? "-" : defraAqi ?? "-", ["title", "invisible"], "detail-toggle"));
                        fadeElementInWhenAdding(valuesContainer.querySelector(".value-badge"));

                        showModalOnClick(valuesContainer, boxid, latestDustReadingDate, pm25, pm10);
                    });;
            });
    }
    else {
        valuesContainer.appendChild(sensorReading(stale, "", "-", ["value-badge-outline", "is-size-4"], "detail-toggle"))
        fadeElementInWhenAdding(valuesContainer.querySelector(".value-badge"));
        showModalOnClick(valuesContainer, boxid, latestDustReadingDate, '0', '0');
    }
}




function showModalOnClick(valuesContainer, boxid, latestDustReadingDate, pm25, pm10) {
    valuesContainer.addEventListener("click", showModal);
    var chevron = document.querySelector(`#_${boxid}-chevron`);
    chevron?.addEventListener("click", showModal);

    function showModal() {
            console.log('click');
            var view = document.createElement("device-sensor-view-selector");
            view.setAttribute("device_id", boxid);
            view.setAttribute("last_seen_string", latestDustReadingDate);
            view.setAttribute("pm2_5_value", (pm25.value ?? 0).toFixed(2));
            view.setAttribute("pm10_value", (pm10.value ?? 0).toFixed(2));

            var title = document.querySelector(`#_${boxid}-title`);
            if (title) view.setAttribute("name", title.innerText);
            removeChildrenForSelector(valuesContainer, "device-sensor-view-selector");

            var modal = document.querySelector("#sensorDetailPlaceholder");
            if (modal) {
                modal.innerHTML = "";
                modal.appendChild(view);
            }
    }
}

function removeChildrenForSelector(valuesContainer, childSelector) {
    valuesContainer.querySelectorAll(childSelector)
                   ?.forEach((x) => x.parentNode.removeChild(x));
}

function sensorReading(stale, units, reading, valueClasslist, modalControlCheckboxId) {
    var readingLine = document.createElement("DIV");
    readingLine.classList.add("level-item");

    var inner = document.createElement("DIV");
    var value = document.createElement("DIV");

    var colorClass = getColourClassForAqi(reading, stale);
    value.classList.add("value-badge", "is-size-4", "border", colorClass, ...valueClasslist);
    var valueP = document.createElement("P");
    valueP.innerText = '' + String(!reading || reading == "NaN" || reading == -Infinity ? "0" : reading) + units;
    value.appendChild(valueP);

    var labelDiv = getInfoIconLinkWithText(indexToPollutionBandFromAqi(reading), modalControlCheckboxId);
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

    a.appendChild(textSpan);
    label.appendChild(a);
    return label;
}