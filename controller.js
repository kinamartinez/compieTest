/**
 * Created by kinamartinez on 5/28/17.
 */
"use strict";


let map;
let places;
let infoWindow;
let markers = [];
let autocomplete;
let countryRestrict = {'country': 'il'};
let MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
let hostnameRegexp = new RegExp('^https?://.+?/');

const branches = [
    {
        "brand": "Rami Levi",
        "name": "Eilat",
        "lat": "29.5577",
        "lng": "34.9519"
    },
    {
        "brand": "Mega",
        "name": "Naharia",
        "lat": "33.008536",
        "lng": "35.098051"
    },
    {
        "brand": "Mega",
        "name": "Raanana",
        "lat": "32.184781",
        "lng": "34.871326"
    },
    {
        "brand": "Mega",
        "name": "Hadera",
        "lat": "32.434046",
        "lng": "34.919652"
    },
    {
        "brand": "Mega",
        "name": "Rishon Lezion",
        "lat": "31.973001",
        "lng": "34.792501"
    },
    {
        "brand": "Rami Levi",
        "name": "Givatayim",
        "lat": "32.072176",
        "lng": "34.808871"
    },
    {
        "brand": "Rami Levi",
        "name": "Florentine",
        "lat": "32.056036",
        "lng": "34.772605"
    },
    {
        "brand": "Rami Levi",
        "name": "Ramat Gan",
        "lat": "32.068424",
        "lng": "34.824785"
    },
    {
        "brand": "Shufersal",
        "name": "Dizengof",
        "lat": "32.085814",
        "lng": "34.774667"
    },
    {
        "brand": "Shufersal",
        "name": "Kfar saba",
        "lat": "32.178195",
        "lng": "34.907610"
    },
    {
        "brand": "Shufersal",
        "name": "Holon",
        "lat": "32.015833",
        "lng": "34.787384"
    },
    {
        "brand": "Shufersal",
        "name": "Azor",
        "lat": "32.029558",
        "lng": "34.799648"
    }

];


const countries = {
    'au': {
        center: {lat: -25.3, lng: 133.8},
        zoom: 5
    },
    'br': {
        center: {lat: -14.2, lng: -51.9},
        zoom: 5
    },
    'ca': {
        center: {lat: 62, lng: -110.0},
        zoom: 5
    },
    'fr': {
        center: {lat: 46.2, lng: 2.2},
        zoom: 5
    },
    'de': {
        center: {lat: 51.2, lng: 10.4},
        zoom: 5
    },
    'mx': {
        center: {lat: 23.6, lng: -102.5},
        zoom: 5
    },
    'nz': {
        center: {lat: -40.9, lng: 174.9},
        zoom: 5
    },
    'il': {
        center: {lat: 32.07, lng: 34.79},
        zoom: 15
    },
    'za': {
        center: {lat: -30.6, lng: 22.9},
        zoom: 5
    },
    'es': {
        center: {lat: 40.5, lng: -3.7},
        zoom: 5
    },
    'pt': {
        center: {lat: 39.4, lng: -8.2},
        zoom: 5
    },
    'us': {
        center: {lat: 37.1, lng: -95.7},
        zoom: 5
    },
    'uk': {
        center: {lat: 54.8, lng: -4.6},
        zoom: 5
    }
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: countries['il'].zoom,
        center: countries['il'].center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
    });

    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });

    // Create the autocomplete object and associate it with the UI input control.
    // Restrict the search to the default country, and to place type "cities".
    autocomplete = new google.maps.places.Autocomplete(
        (
            document.getElementById('autocomplete')), {});
    places = new google.maps.places.PlacesService(map);

    autocomplete.addListener('place_changed', onPlaceChanged);
    document.getElementById('country').addEventListener(
        'change', setAutocompleteCountry);

}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search();
        console.log("latlng ini" + "" + place.geometry.location.lat())
    } else {
        document.getElementById('autocomplete').placeholder = 'Enter a location';
    }


}

// Search for supermarkets in the selected city, within the viewport of the map.
function search() {
    const search = {
        location: map.getCenter(),
        types: ['grocery_or_supermarket'],
        rankBy: google.maps.places.RankBy.DISTANCE

    };

    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            // Create a marker for each supermarket found, and
            // assign a letter of the alphabetic to each marker icon.
            for (let i = 0; i < results.length; i++) {
                const markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                const markerIcon = MARKER_PATH + markerLetter + '.png';
                // Use marker animation to drop the icons incrementally on the map.
                markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon
                });
                // If the user clicks a supermarket marker, show the details of that supermarket
                // in an info window.
                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                setTimeout(dropMarker(i), i * 100);
// console.log(results[i])

                // haversine formula to calculate distances
                const lat1 = search.location.lat();
                const lng1 = search.location.lng();
                const lat2 = results[i].geometry.location.lat();
                const lng2 = results[i].geometry.location.lng();

                const R = 6371000; // Radius of the earth in mts
                const dLat = deg2rad(lat2 - lat1);  // deg2rad below
                const dLon = deg2rad(lng2 - lng1);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;
                const  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c// Distance in mts
                // console.log("soy d" + " " + d)

                addResult(results[i], i, d);

            }
        }
    });
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    markers = [];
}

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
    const country = document.getElementById('country').value;
    if (country == 'all') {
        autocomplete.setComponentRestrictions({'country': []});
        map.setCenter({lat: 15, lng: 0});
        map.setZoom(15);
    } else {
        autocomplete.setComponentRestrictions({'country': country});
        map.setCenter(countries[country].center);
        map.setZoom(countries[country].zoom);
    }
    clearResults();
    clearMarkers();
}

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

function addResult(result, i, d) {
    // console.log(d.toFixed(2))
    const results = document.getElementById('results');
    const markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    const markerIcon = MARKER_PATH + markerLetter + '.png';

    const tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
    tr.onclick = function () {
        google.maps.event.trigger(markers[i], 'click');
    };

    const iconTd = document.createElement('td');
    const nameTd = document.createElement('td');
    const distanceTd = document.createElement('td')
    const icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    const name = document.createTextNode(result.name);
    const distance = document.createTextNode(d + " " + "meters");
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    distanceTd.appendChild(distance);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(distanceTd);
    results.appendChild(tr);


}

function clearResults() {
    const results = document.getElementById('results');
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

// Get the place details for a supermarket. Show the information in an info window,
// anchored on the marker for the supermarket that the user selected.
function showInfoWindow() {
    const marker = this;
    places.getDetails({placeId: marker.placeResult.place_id},
        function (place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }
            infoWindow.open(map, marker);
            buildIWContent(place);
        });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
    document.getElementById('iw-icon').innerHTML = '<img class="supermarketIcon" ' +
        'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
        '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
    } else {
        document.getElementById('iw-phone-row').style.display = 'none';
    }

    // Assign a five-star rating to the supermarket, using a black star ('&#10029;')
    // to indicate the rating the supermarket has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
        let ratingHtml = '';
        for (let i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
            document.getElementById('iw-rating-row').style.display = '';
            document.getElementById('iw-rating').innerHTML = ratingHtml;
        }
    } else {
        document.getElementById('iw-rating-row').style.display = 'none';
    }

    // The regexp isolates the first part of the URL (domain plus subdomain)
    // to give a short URL for displaying in the info window.
    if (place.website) {
        let fullUrl = place.website;
        let website = hostnameRegexp.exec(place.website);
        if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
        }
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
    } else {
        document.getElementById('iw-website-row').style.display = 'none';
    }
}

function calculateFrecuencyOfMainBranches() {
    let latlng1 = map.getCenter();
    let newArrBranches = [];
    let countShufersal = 0;
    let countRamiLevi = 0;
    let countMega = 0;
    let chainFrequencies = 0;

    for (let i = 0; i < branches.length; i++) {


        const lat1 = latlng1.lat();
        const lng1 = latlng1.lng();
        const lat2 = branches[i].lat;
        const lng2 = branches[i].lng;


        const R = 6371000; // Radius of the earth in mts
        const dLat = deg2rad(lat2 - lat1);  // deg2rad above
        const dLon = deg2rad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c// Distance in mts

        if (d <= 50000) {

            newArrBranches.push(branches[i]);
            // console.log(newArrBranches)
            for (let j = 0; j < newArrBranches.length; j++) {
                const currentBranch = newArrBranches[j];
                if (currentBranch.brand == "Shufersal") {
                    countShufersal++
                }
                else if (currentBranch.brand == "Mega") {
                        countMega++
                }
                else if (currentBranch.brand == "Rami Levi") {
                    countRamiLevi++
                }

                // chainFrequencies[currentBranch.brand] += 1;
            }
            // console.log(" countShufersal" + "" + countShufersal)
            // console.log("countRamilevi" + "" + countRamiLevi)
            // console.log(" countMega" + "" + countMega)
        }
    }

    if (countShufersal >= countRamiLevi && countShufersal >= countMega) {
        alert ("The most frecuent Supermarket in your area is Shufersal");
        return "Shufersal"
    } else if (countRamiLevi >= countShufersal && countRamiLevi >= countMega) {
        alert("The most frecuent Supermarket in your area is RamiLevi");
        return "RamiLevi"
    } else if (countMega >= countShufersal && countMega >= countRamiLevi) {
        alert("The most frecuent Supermarket in your area is Mega");
        return "Mega"
    }
}

calculateFrecuencyOfMainBranches()
// const chainFrequencies = {
//     "RamiLevi": 12,
//     "Shufersal": 6,
//     "Mega": 3,
//     // };
//     let mostFrequentChain = null;
//     let highestChainFrequency = 0;
//     for (const chainName of Object.keys(chainFrequencies)) {
//         const chainFrequency = chainFrequencies[chainName];
//
//         if (chainFrequency >= highestChainFrequency) {
//             mostFrequentChain = chainName;
//         }
//
//     }
//     console.log(mostFrequentChain)
//     return mostFrequentChain;
// }
