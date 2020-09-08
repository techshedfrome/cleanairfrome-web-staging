
export function createInfoBox(boxid, deviceName, description, defraAqi, measurements, latestDustReadingDate) {
    var card = cardWithTitle(deviceName, description, boxid);
    var values = document.createElement("DIV");
    values.classList.add("level-right-tablet", "has-text-centered", "mt-2");
    values.id = `_${boxid}`;
    values.setAttribute("readingDate", moment(latestDustReadingDate).format());

    card.appendChild(values);
    return card;
}

function cardWithTitle(titleText, description, boxid) {
    var card = document.createElement("DIV");
    card.classList.add("reading", "reading-bare", "level", "is-mobile", "is-marginless");
    card.appendChild(cardHeaderWithTitle(titleText, description, boxid));
    return card;
}

function cardHeaderWithTitle(titleText, description, boxid) {
    var header = document.createElement("DIV");
    header.classList.add("level-left-tablet", "has-text-left");

    var inner = document.createElement("DIV");

    var title = document.createElement("DIV");
    title.classList.add("title", "is-size-5", "has-text-left-tablet", "mb-3");
    title.id = `_${boxid}-title-holder`;

    var span = document.createElement("SPAN");
    span.innerText = titleText;
    span.id = `_${boxid}-title`;
    title.appendChild(span);
    inner.appendChild(title);

    var info = document.createElement("DIV");
    info.classList.add("has-text-left-tablet", "has-text-weight-normal", "is-size-6");
    //TODO: set description - create an interim store, or parse from OpenSenseMap description
    info.innerHTML = `${description}<br>1 sensor`;

    inner.appendChild(info);
    header.appendChild(inner);
    var iconSpan = document.createElement("SPAN");
    iconSpan.classList.add("level-item");
    header.appendChild(iconSpan);
    return header;
}


