// Hovervariable
let polygonIsBroughtUpToFront = false;
let isCursorOverPolygon = false;
let searchCat = 'Position';
let currentAerodrome;
let currentAirspace;

//current acft variables
let currentTrack;


// Event-Listener, um zu überprüfen, ob der Cursor über keinem Polygon schwebt
function checkCursorOverPolygon() {
    if (!isCursorOverPolygon) {
        polygonIsBroughtUpToFront = false;
    } else {
        polygonIsBroughtUpToFront = true;
    }
}

document.addEventListener('mousemove', () => {
    // Überprüfen, ob der Cursor über keinem Polygon schwebt
    checkCursorOverPolygon();  // Hier die Instanz des EdrAirspace verwenden
});

let weatherPath;
let rainviewerWeather;
let rainviewerClouds;

// Karte initialisieren und auf einen Standardort setzen
var map = L.map('map', {
}).setView([50.505, 12], 9);


// OpenStreetMap-Kacheln hinzufügen
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


// Aktuelle Hintergrundkarte speichern
var currentTileLayer; // Standard ist OSM

// Add a polygon that covers the entire world with no pointer events
var worldPolygon = L.polygon([
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180]
], {
    className: 'no-pointer-events', // Assign the custom class
    color: 'white', // Set the border color to white
    fillColor: 'white', // Set the fill color to white
    fillOpacity: 0 // Set the fill opacity to 0.4 (standard value)
}).addTo(map).bringToBack();


// Add event listener for the slider
var slider = document.getElementById('opacity-slider');
var sliderValue = document.getElementById('slider-value');

slider.addEventListener('input', setOpacity);

function setOpacity() {
    var opacityValue = slider.value / 100; // Convert to a value between 0 and 1
    worldPolygon.setStyle({ fillOpacity: opacityValue });
    sliderValue.textContent = slider.value + '%'; // Update the displayed value
}


// OpenStreetMap Layer
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OpenFlightMaps Layer
let openFlightMaps = L.tileLayer('https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=2503/aero/latest', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openflightmaps.org/">OpenFlightMaps</a>'
});

// OpenAIP Layer
let openAIP = L.tileLayer('https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=75acf00ad8bb52144424ce0655147c55', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openaip.net/">OpenAIP</a>'
});

// ICAO Card Layer
let icaoCard = L.tileLayer('https://ais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.dfs.de">Deutsche Flugsicherung</a>'
});

// OpenTopoMap Layer
var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Stadia Maps Layers
var stadiaAlidadeSmooth = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var stadiaAlidadeSmoothDark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// TopPlus Open Layers
let topPlusOpen = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenGrey = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenLight = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

let topPlusOpenLightGray = L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
    minZoom: 4,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.bkg.bund.de">BKG</a>'
});

// Google Satellite Layer
let googleSatelite = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl={language}', {
    subdomains: '0123',
    minZoom: 4,
    maxZoom: 22,
    language: 'de',
    attribution: '&copy; Google Maps'
});

// DWD Weather Layer
let dwdWeather = L.tileLayer.wms('https://maps.dwd.de/geoserver/wms', {
    layers: 'dwd:Niederschlagsradar',
    format: 'image/png',
    transparent: true,
    version: '1.3.0',
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.dwd.de">Deutscher Wetterdienst</a>'
});



const mapStates = {
    backgroundMaps: {
        osm: { layer: osm, isHidden: false, opacity: 0 },
        openTopoMap: { layer: openTopoMap, isHidden: true, opacity: 0 },
        stadiaAlidadeSmooth: { layer: stadiaAlidadeSmooth, isHidden: true, opacity: 0 },
        stadiaAlidadeSmoothDark: { layer: stadiaAlidadeSmoothDark, isHidden: true, opacity: 0 },
        topPlusOpen: { layer: topPlusOpen, isHidden: true, opacity: 0.5 },
        topPlusOpenGrey: { layer: topPlusOpenGrey, isHidden: true, opacity: 0 },
        topPlusOpenLight: { layer: topPlusOpenLight, isHidden: true, opacity: 0.5 },
        topPlusOpenLightGray: { layer: topPlusOpenLightGray, isHidden: true, opacity: 0 },
        googleSatelite: { layer: googleSatelite, isHidden: true, opacity: 0 }
    },
    additionalLayers: {
        openFlightMaps: { layer: openFlightMaps, isHidden: true, opacity: 0 },
        openAIP: { layer: openAIP, isHidden: true, opacity: 0 },
        icaoCard: { layer: icaoCard, isHidden: true, opacity: 0 },

    },
    weatherLayers: {
        dwdWeather: { layer: dwdWeather, isHidden: true, opacity: 0 },
        rainviewerWeather: { layer: null, isHidden: true, opacity: 0 },
        rainviewerClouds: { layer: null, isHidden: true, opacity: 0 }
    }
};

toggleMap('topPlusOpen', 'backgroundMaps'); // Standardkarte setzen

// OSM Buildings Layer
var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');

function toggleMap(mapKey, category) {
    const categoryStates = mapStates[category];
    const mapState = categoryStates[mapKey];

    // Wenn die Karte bereits sichtbar ist und es sich um eine Hintergrundkarte handelt
    // dann nicht ausblenden (früher Return)
    if (!mapState.isHidden && category === 'backgroundMaps') {
        return;
    }

    toggleActBtn(mapKey);

    if (mapState.isHidden) {
        // Wenn es sich um additionalLayers oder backgroundMaps handelt, andere Layer dieser Kategorie ausblenden
        if (category === 'additionalLayers' || category === 'backgroundMaps') {
            Object.keys(categoryStates).forEach(key => {
                const otherMapState = categoryStates[key];
                if (!otherMapState.isHidden && otherMapState.layer) {
                    map.removeLayer(otherMapState.layer);
                    otherMapState.isHidden = true;
                    const otherMapBtn = document.getElementById(key);
                    if (otherMapBtn) {
                        otherMapBtn.classList.remove('bgMapButtonActive');
                    }
                }
            });
        }

        if (mapState.layer) {
            mapState.layer.addTo(map);
            if (category === 'backgroundMaps' || mapKey === 'icaoCard') {
                slider.value = mapState.opacity * 100;
                setOpacity();
            }
            currentTileLayer = mapState.layer;
        }

        mapState.isHidden = false;

        if (category === 'backgroundMaps') {
            updateAdditionalLayerOrder();
        }
    } else {
        // Nur ausblenden wenn es KEINE Hintergrundkarte ist
        if (category !== 'backgroundMaps') {
            if (mapState.layer) {
                map.removeLayer(mapState.layer);
            }
            mapState.isHidden = true;

            // Wenn eine ICAO-Karte entfernt wird, stelle die Opacity der Hintergrundkarte wieder her
            if (mapKey === 'icaoCard') {
                // Finde die aktive Hintergrundkarte
                const activeBackgroundMap = Object.entries(mapStates.backgroundMaps).find(
                    ([_, state]) => !state.isHidden
                );

                if (activeBackgroundMap) {
                    const [_, bgMapState] = activeBackgroundMap;
                    if (bgMapState.opacity !== undefined) {
                        slider.value = bgMapState.opacity * 100;
                        setOpacity();
                    }
                }
            }
        }
    }
}


// Zusatzlayer aktualisieren
function updateAdditionalLayerOrder() {
    const additionalLayers = mapStates.additionalLayers;
    Object.keys(additionalLayers).forEach(key => {
        const layerState = additionalLayers[key];
        if (!layerState.isHidden && layerState.layer) {
            map.removeLayer(layerState.layer); // Entferne den Layer
            layerState.layer.addTo(map); // Füge ihn wieder hinzu
        }
    });
}



async function getWeather(weatherType) {
    try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Setze den korrekten Pfad je nach Wettertyp
        if (weatherType === 'weather') {
            weatherPath = data.radar.past[data.radar.past.length - 1].path;
        } else if (weatherType === 'clouds') {
            weatherPath = data.satellite.infrared[data.satellite.infrared.length - 1].path;
        }

        // Layer für Weather oder Clouds erstellen
        if (weatherType === 'weather' && !rainviewerWeather) {
            rainviewerWeather = L.tileLayer('https://tilecache.rainviewer.com' + weatherPath + '/512/{z}/{x}/{y}/2/1_1.png', {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.weatherLayers.rainviewerWeather.layer = rainviewerWeather;
        } else if (weatherType === 'clouds' && !rainviewerClouds) {
            rainviewerClouds = L.tileLayer('https://tilecache.rainviewer.com' + weatherPath + '/256/{z}/{x}/{y}/0/1_0.png', {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png',
            });

            // Layer in mapStates aktualisieren
            mapStates.weatherLayers.rainviewerClouds.layer = rainviewerClouds;
        } else {
            // Aktualisiere die URL des bestehenden Layers, falls nötig
            if (weatherType === 'weather') {
                rainviewerWeather.setUrl('https://tilecache.rainviewer.com' + weatherPath + '/512/{z}/{x}/{y}/2/1_1.png');
            } else if (weatherType === 'clouds') {
                rainviewerClouds.setUrl('https://tilecache.rainviewer.com' + weatherPath + '/256/{z}/{x}/{y}/0/1_0.png');
            }
        }
        toggleMap((weatherType === 'weather' ? 'rainviewerWeather' : 'rainviewerClouds'), 'weatherLayers');
    } catch (error) {
        console.error(`Fehler: ${error.message}`);
    }
}


function toggleActBtn(id) {
    let button = document.getElementById(id);
    button.classList.toggle('bgMapButtonActive');
}

function toggleActBtnRadar() {
    let button = document.getElementById('radar');
    button.classList.toggle('radarBtnActive');
}


