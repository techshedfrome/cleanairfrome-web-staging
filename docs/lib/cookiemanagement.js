

//disable GA
window['ga-disable-UA-171048144-1'] = true;

window.addEventListener("load", () => {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#E0EFF1"
            },
            "button": {
                "background": "#FFDD57"
            }
        },
        "theme": "edgeless",
        "type": "opt-out",
        //disable unnecessary lookup of user's IP geolocation
        location: false,
        "content": {
            "message": "This website uses cookies to check how the site's being used &amp; to help improve the project. ",
            "href": "https://www.frometowncouncil.gov.uk/cookie-policy/"
        },
        onStatusChange: function (status) {
            console.log(this.hasConsented() ? 'enable cookies' : 'disable cookies');
            console.log('Google Analytics disabled? - ' + window['ga-disable-UA-171048144-1']);
            //toggle GA status to match new selection on change
            window['ga-disable-UA-171048144-1'] = !this.hasConsented();
            //reload page if newly consented to record page load in GA  (not sure if this is needed - will test)
            // if (this.hasConsented()) window.location = window.location;
        },
        onInitialise: function (status) {
            console.log(this.hasConsented() ? 'enable cookies' : 'disable cookies');
            //toggle GA status to match existing cookie on page load
            window['ga-disable-UA-171048144-1'] = !this.hasConsented();
            console.log('Google Analytics disabled? - ' + window['ga-disable-UA-171048144-1']);
        },
    });
});