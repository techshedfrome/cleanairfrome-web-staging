
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
    label.style.marginRight="-10px";
    var img = document.createElement("IMG");
    img.src = "assets/icons/line-chart.png";
    img.style.width = "58px";
    label.setAttribute("for", "detail-toggle");
    label.id = `_${boxid}-chevron`;
    // label.appendChild(img);
    var text = document.createElement("DIV");
    text.innerHTML = "View<br>Chart";
    text.classList.add("is-size-7", "view-chart", "button", "px-2", "py-5", "has-background-link-light", "is-borderless");
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
    header.classList.add("level-right-tablet", "has-text-left", "ml-4");
    header.style.marginRight = "auto";

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


