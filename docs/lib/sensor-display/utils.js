

export function fadeElementInWhenAdding(e, fast) {
    e.classList.add("invisible");
    window.getComputedStyle(e).opacity;
    e.classList.add("make-visible")
    if (fast) e.classList.add("fast");
}


export function printError(error) {
    console.log(error);
}


export function alphaSort(a, b) {
    var nameA = a.toUpperCase(); // ignore upper and lowercase
    var nameB = b.toUpperCase(); // ignore upper and lowercase
    return (nameA === nameB) ? 0 : nameA < nameB ? -1 : 1;
}

export function throwHttpErrors(request) {
    if (!request.ok) {
        console.log(request.Error);
        throw Error(request.status);
    };
    return request;
}