
export function createInfoBox(boxid, deviceName, description, defraAqi, measurements, latestDustReadingDate) {
    // var card = cardWithTitle(deviceName, description, boxid);

    var card = document.createElement("DIV");
    card.classList.add("reading", "reading-bare", "level", "is-mobile", "is-marginless");

    var values = document.createElement("DIV");
    values.classList.add("level-left-tablet", "has-text-centered", "mt-2");
    values.id = `_${boxid}`;
    values.setAttribute("readingDate", moment(latestDustReadingDate).format());

    card.appendChild(values);
    card.appendChild(cardHeaderWithTitle(deviceName, description, boxid));

    // var chevron = document.createElement("LABEL");
    // chevron.className = "chevron";
    // chevron.id = `_${boxid}-chevron`;
    // chevron.setAttribute("for", "detail-toggle");
    // card.appendChild(chevron);

    var label = document.createElement("LABEL");
    label.style.marginRight="-18px";
    var img = document.createElement("IMG");
    img.src = "assets/icons/line-chart.png";
    img.classList.add("ml-2");
    img.style.width = "20px";
    label.setAttribute("for", "detail-toggle");
    label.id = `_${boxid}-chevron`;
    var text = document.createElement("DIV");
    text.innerHTML = "<div>View<br>Chart</div>";
    text.classList.add("is-size-7", "view-chart", "button", "px-2", "py-5",  "is-borderless");
    text.appendChild(img);
    label.appendChild(text);
    card.appendChild(label);
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
    header.classList.add("level-right-tablet", "has-text-left", "ml-5");
    header.style.marginRight = "auto";

    var inner = document.createElement("DIV");

    var title = document.createElement("DIV");
    title.classList.add("title", "is-size-5", "has-text-left-tablet", "mb-3");
    title.id = `_${boxid}-title-holder`;

    var span = createElementWithInnerText("SPAN", titleText);
    span.id = `_${boxid}-title`;
    title.appendChild(span);
    inner.appendChild(title);

    var info = document.createElement("DIV");
    info.classList.add("has-text-left-tablet", "has-text-weight-normal", "is-size-6", "card-info");

    //TODO: set description - create an interim store, or parse from OpenSenseMap description
    info.appendChild(createElementWithInnerText("SPAN", description));
    info.appendChild(document.createElement("BR"));
    info.appendChild(createElementWithClass("SPAN", 'map-link-slot'));
    info.appendChild(createElementWithInnerText("SPAN", '1 sensor'));

    inner.appendChild(info);
    header.appendChild(inner);
    var iconSpan = document.createElement("SPAN");
    iconSpan.classList.add("level-item");
    header.appendChild(iconSpan);
    return header;
}

function createElementWithInnerText(elementType, innerText) {
    var element = document.createElement(elementType);
    element.innerText = innerText;
    return element;
}

function createElementWithClass(elementType, className) {
    var element = document.createElement(elementType);
    element.classList.add(className);
    return element;
}

