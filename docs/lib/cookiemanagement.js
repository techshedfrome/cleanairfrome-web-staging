

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
            var consented = this.hasConsented()
            console.log(consented ? 'enable cookies' : 'disable cookies');
            console.log('Google Analytics disabled? - ' + window['ga-disable-UA-171048144-1']);
            //toggle GA status to match new selection on change
            window['ga-disable-UA-171048144-1'] = !consented;
            //reload page if newly consented to record page load in GA  (not sure if this is needed - will test)
            // if (this.hasConsented()) window.location = window.location;
            initialiseGAnalytics();
        },
        onInitialise: function (status) {
            var consented = this.hasConsented()
            console.log(consented ? 'enable cookies' : 'disable cookies');
            //toggle GA status to match existing cookie on page load
            window['ga-disable-UA-171048144-1'] = !consented;
            console.log('Google Analytics disabled? - ' + window['ga-disable-UA-171048144-1']);
            initialiseGAnalytics();
        },
    });
});


function initialiseGAnalytics(){
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-171048144-1');
}
/*
Uses Osano open source Cookie Consent:
* https://www.osano.com/cookieconsent/documentation/javascript-api/
* https://www.osano.com/cookieconsent/download/
* https://github.com/osano/cookieconsent
Had to wrap in the load event to get it working - thanks to https://codepen.io/j_holtslander/pen/zmyMwR

Google opt-out instructions: https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out


*/