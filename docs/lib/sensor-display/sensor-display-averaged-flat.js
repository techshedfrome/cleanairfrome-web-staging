import { loadStreetNames } from "./data/streetnames.js"
import { fetchMeasurements } from "./data/opensensemap.js"
// import { fetchMeasurements } from "./data/fake-opensensemap.js"

import { createInfoBox } from "./components/CardHeaderWithTitle.js"
import { populateSensorReading } from "./components/SensorReadings.js"

import { alphaSort, fadeElementInWhenAdding, printError } from "./utils.js"


const boolSortAsc = (a, b) => (a === b) ? 0 : a ? 1 : -1;

document.addEventListener("DOMContentLoaded", populateLiveView);

function populateLiveView() {
  //TODO: start using a data persistance/caching scheme and/or SPA framework or PWA structure to prevent spamming the API
  fetchMeasurements()
    .then(populateSensorList)
    .catch(printError);
}

function populateSensorList(data) {
  data.sort((a, b) => alphaSort(a.name, b.name));
  data.sort((a, b) => boolSortAsc(a.readingIsStale(), b.readingIsStale()))
  //TODO: move DOM manipulation to own module(s)

  var section = document.querySelector("#itemListContainer");
  section.innerText = '';
  data.forEach(device => {
    var infoBox = createInfoBox(device.boxid, device.name, 
                                device.description,
                                device.defraAqi(),
                                device.measurements,
                                device.latestDustReadingDate());
    infoBox.classList.add("invisible");
    section.appendChild(infoBox);
    fadeElementInWhenAdding(infoBox, true);
  });

  loadStreetNames(data, device => {
    var listItemTitle = document.querySelector("#" + device.name + "-title");
    if (listItemTitle) listItemTitle.innerText = device.streetname;
    var detailTitle = document.querySelector(`#detail-${device.boxid}-title`)
    if (detailTitle) detailTitle.innerText = device.streetname;
  });

  data.forEach(device => addDeviceStats(device.boxid));
}

function addDeviceStats(boxid) {
  populateSensorReading(document.querySelector("#_" + boxid), boxid);
}

