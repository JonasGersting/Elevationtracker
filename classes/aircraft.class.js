class Aircraft {
    constructor(aircraftData, map, aircraftLayer) {
        this.map = map;
        this.aircraftLayer = aircraftLayer;
        this.initBaseProps(aircraftData);
        this.initMovementProps(aircraftData);
        this.initInternalState();
        this.createAndAddMarker();
    }

    initBaseProps(data) {
        let { lat, lon, t, alt_baro, hex, flight, r, lastPosition } = data;
        if (!lat || !lon) {
            if (lastPosition && lastPosition.lat && lastPosition.lon) {
                lat = lastPosition.lat || 0;
                lon = lastPosition.lon || 0;
            }
        }
        this.position = [lat, lon];
        this.type = t;
        this.altitude = alt_baro;
        this.hex = hex;
        this.callsign = flight;
        this.registration = r;
    }

    initMovementProps(data) {
        let { ias, true_heading, track, gs, seen_pos, lastPosition } = data;
        if (!seen_pos && lastPosition) {
            seen_pos = lastPosition.seen_pos;
        }
        this.speed = ias;
        this.heading = true_heading;
        this.track = track;
        this.groundSpeed = gs;
        this.lastPos = seen_pos;
    }

    initInternalState() {
        this.isTracked = false;
        this.marker = null;
        this.trackLine = null;
    }

    getMarkerIconConfig() {
        const rotation = this.heading || this.track;
        const color = this.isTracked ? '#FF961B' : this.getAltitudeColor();
        return L.divIcon({
            html: this.getSvgForType(rotation, color),
            className: 'planeIcon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    }

    getMarkerTooltipContent() {
        return `
            <div>
                <strong>Callsign:</strong> ${this.callsign || 'Unknown'}<br>
                <strong>Registration:</strong> ${this.registration || 'N/A'}<br>
                <strong>Altitude:</strong> ${this.altitude || 'N/A'} ft<br>
            </div>
        `;
    }

    getMarkerTooltipOptions() {
        return {
            direction: 'top',
            offset: [0, -15]
        };
    }

    createAndAddMarker() {
        if (!this.position || typeof this.position[0] !== 'number' || typeof this.position[1] !== 'number') {
            console.warn(`Flugzeug ${this.hex || 'N/A'} hat keine gültige Position und wird nicht zur Karte hinzugefügt.`);
            return;
        }
        const iconConfig = this.getMarkerIconConfig();
        const tooltipContent = this.getMarkerTooltipContent();
        const tooltipOptions = this.getMarkerTooltipOptions();

        this.marker = L.marker(this.position, { icon: iconConfig });
        this.marker.bindTooltip(tooltipContent, tooltipOptions);
        this.marker.on('click', () => this.handleClick());
        this.aircraftLayer.addLayer(this.marker);
    }

    handleExistingTrackedAircraftOnClick() {
        if (trackedAcft && trackedAcft === this) {
            this.untrackAircraft();
            return true;
        }
        if (trackedAcft && trackedAcft !== this) {
            trackedAcft.untrackAircraft();
        }
        return false;
    }

    startTrackingThisAircraft() {
        trackedAcft = this;
        this.isTracked = true;
        this.updateMarkerStyle();
    }

    async fetchAndSetAircraftImageDetails() {
        const imageData = await this.getImage();
        if (imageData && typeof imageData === 'object' && imageData.thumbnail) {
            trackedAcftImg = imageData.thumbnail.src;
            trackedAcftImgLink = imageData.link;
            trackedAcftImgPhotographer = `Photo © ${imageData.photographer}`;
            trackedAcftImgJSON = imageData;
        } else {
            trackedAcftImg = 'img/acftWhite.png';
            trackedAcftImgLink = '';
            trackedAcftImgPhotographer = '';
            trackedAcftImgJSON = null;
        }
    }

    async handleClick() {
        if (this.handleExistingTrackedAircraftOnClick()) return;

        this.startTrackingThisAircraft();
        await this.fetchAndSetAircraftImageDetails();
        await this.showDetails();
        await this.fetchInitialTrack();
    }

    clearTrackedAircraftDOM() {
        const trackedAcftDiv = document.getElementById('trackedAcft');
        if (!trackedAcftDiv) return;
        trackedAcftDiv.classList.add('hiddenTrackedAcft');
        const idsToClear = ['trackedCallsign', 'trackedReg', 'trackedAltitude',
            'trackedPos', 'trackedType', 'trackedIas',
            'trackedHeading', 'trackedTrack', 'lastPos', 'ETA'];
        idsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        const imgEl = document.getElementById('trackedImg');
        if (imgEl) imgEl.src = 'img/acftWhite.png';
    }

    clearMapTrackingLayers() {
        if (currentTrackLine) {
            this.map.removeLayer(currentTrackLine);
            currentTrackLine = null;
        }
        if (flightDistLine) {
            this.map.removeLayer(flightDistLine);
            flightDistLine = null;
        }
    }

    resetGlobalTrackingState() {
        const icaoDestInput = document.getElementById('icaoDest');
        if (icaoDestInput) icaoDestInput.value = '';

        trackedIcaoDest = null;
        trackedEta = '';
        trackedAcft = null;
        trackedAcftImgJSON = null;
        trackCoordinates = [];
    }

    untrackAircraft() {
        if (!trackedAcft || trackedAcft !== this) return;

        this.isTracked = false;
        this.updateMarkerStyle();
        this.clearTrackedAircraftDOM();
        this.clearMapTrackingLayers();
        this.resetGlobalTrackingState();
    }

    updateMarkerStyle() {
        const rotation = this.heading || this.track;
        const acftImgColor = this.isTracked ? 'rgb(181 117 33)' : this.getAltitudeColor();
        const icon = L.divIcon({
            html: this.getSvgForType(rotation, acftImgColor),
            className: 'planeIcon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        this.marker.setIcon(icon);
    }

    updateTrackedInfoInDOM() {
        document.getElementById('trackedCallsign').innerHTML = this.callsign || 'N/A';
        document.getElementById('trackedReg').innerHTML = this.registration || 'N/A';
        document.getElementById('trackedImg').src = trackedAcftImg;
        document.getElementById('photoLink').href = trackedAcftImgLink;
        document.getElementById('photoLink').innerHTML = trackedAcftImgPhotographer;
        document.getElementById('trackedAltitude').innerHTML = `${this.altitude || 'N/A'}FT`;
        document.getElementById('trackedPos').innerHTML =
            `${this.position[0].toFixed(2)}N, ${this.position[1].toFixed(2)}E`;
        document.getElementById('trackedType').innerHTML = this.type || 'N/A';
        document.getElementById('trackedIas').innerHTML = `${this.groundSpeed || 'N/A'}kt`;
        document.getElementById('trackedHeading').innerHTML = `${this.heading || 'N/A'}°`;
        document.getElementById('trackedTrack').innerHTML = `${this.track || 'N/A'}°`;
    }

    async showDetails() {
        const trackedAcftDiv = document.getElementById('trackedAcft');
        if (trackedAcftDiv) trackedAcftDiv.classList.remove('hiddenTrackedAcft');
        this.updateTrackedInfoInDOM();
        this.checkLastPos();
    }

    checkLastPos() {
        const lastPosElement = document.getElementById('lastPos');
        if (this.lastPos > 10) {
            lastPosElement.style.color = 'rgb(181, 117, 33)';
            lastPosElement.style.fontWeight = 'bolder';
        } else {
            lastPosElement.style.color = '';
            lastPosElement.style.fontWeight = 'normal';
        }
        lastPosElement.innerHTML = `${this.lastPos.toFixed(2)}s`;
        document.getElementById('ETA').innerHTML = `${trackedEta}min`;
    }

    async getImage() {
        try {
            const response = await fetch(
                `https://api.planespotters.net/pub/photos//hex/${this.hex}`
            );
            if (!response.ok) return 'img/acftWhite.png';
            const data = await response.json();
            return data.photos && data.photos.length > 0 ? data.photos[0] : 'img/acftWhite.png';
        } catch (error) {
            return 'img/acftWhite.png';
        }
    }

    getInitialTrackUrl() {
        const corsProxy = 'https://proxy.corsfix.com/?';
        const hexSuffix = this.hex.slice(-2);
        return `${corsProxy}https://globe.airplanes.live/data/traces/${hexSuffix}/trace_full_${this.hex}.json`;
    }

    findLastGroundIndexInTrack(fetchedTrackData) {
        for (let i = fetchedTrackData.length - 1; i >= 0; i--) {
            const pointData = fetchedTrackData[i];
            if (pointData && pointData.length > 3 &&
                (pointData[3] === "ground" || pointData[3] <= 0)) {
                return i;
            }
        }
        return -1;
    }

    extractLastFlightLeg(fetchedTrackData, lastGroundIndex) {
        if (lastGroundIndex !== -1 && lastGroundIndex < fetchedTrackData.length - 1) {
            return fetchedTrackData.slice(lastGroundIndex + 1);
        }
        if (fetchedTrackData.length > 0) {
            const firstPoint = fetchedTrackData[0];
            if (firstPoint && firstPoint.length > 4 && firstPoint[4] !== "ground") {
                return fetchedTrackData;
            }
        }
        return [];
    }

    parseTrackData(rawData) {
        const fetchedTrackData = rawData.trace || rawData.path || [];
        if (!fetchedTrackData.length) return [];
        const lastGroundIndex = this.findLastGroundIndexInTrack(fetchedTrackData);
        return this.extractLastFlightLeg(fetchedTrackData, lastGroundIndex);
    }

    setTrackLoaderVisibility(isLoading) {
        const loader = document.getElementById('trackedAcftLoader');
        if (loader) {
            isLoading ? loader.classList.remove('d-none') : loader.classList.add('d-none');
        }
    }

    async fetchInitialTrack() {
        this.setTrackLoaderVisibility(true);
        const url = this.getInitialTrackUrl();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Track data fetch failed: ${response.status}`);
            const data = await response.json();
            const lastLegData = this.parseTrackData(data);
            trackCoordinates = lastLegData.map(item => [item[1], item[2]]);
        } catch (e) {
            showErrorBanner(`Fehler beim Abrufen der Flugstrecke. ${e} `);
            trackCoordinates = [];
        } finally {
            this.updateAndDrawTrack();
            this.setTrackLoaderVisibility(false);
        }
    }

    updateAndDrawTrack() {
        const currentPosCoords = [this.position[0], this.position[1]];
        if (trackCoordinates.length === 0 ||
            trackCoordinates[trackCoordinates.length - 1][0] !== currentPosCoords[0] ||
            trackCoordinates[trackCoordinates.length - 1][1] !== currentPosCoords[1]) {
            trackCoordinates.push(currentPosCoords);
        }
        this.drawTrack();
    }

    drawTrack() {
        if (currentTrackLine) {
            this.map.removeLayer(currentTrackLine);
        }
        if (trackCoordinates.length === 0) {
            trackCoordinates.push([this.position[0], this.position[1]]);
        }
        currentTrackLine = L.polyline(trackCoordinates, {
            color: 'green',
            weight: 3,
            opacity: 1
        }).addTo(this.map);
    }

    calcEta(destination) {
        trackedIcaoDest = destination;
        for (let i = 0; i < aerodromes.length; i++) {
            const ad = aerodromes[i];
            if (trackedIcaoDest == ad.icaoCode) {
                const distMeters = calcDistance(ad.geometry.coordinates, this.position);
                const distNm = distMeters / 1852;
                const flightTimeHours = this.groundSpeed > 0 ? distNm / this.groundSpeed : Infinity;
                trackedEta = isFinite(flightTimeHours) ? (flightTimeHours * 60).toFixed(0) : 'N/A';
                return;
            }
        }
        trackedEta = 'N/A';
    }

    updateMarkerPosition() {
        if (this.marker) {
            this.marker.setLatLng(this.position);
        }
    }

    handleTrackedStateUpdates() {
        if (!this.isTracked) return;
        this.showDetails();
        this.updateAndDrawTrack();
    }

    handleEtaUpdates() {
        if (!trackedIcaoDest) return;
        this.calcEta(trackedIcaoDest);
        const etaEl = document.getElementById('ETA');
        if (etaEl) etaEl.innerHTML = `${trackedEta}min`;
    }

    handleUntrackedStateUpdates() {
        if (this.isTracked) return;
        this.updateMarkerStyle();
    }

    async updateData() {
        this.updateMarkerPosition();
        this.handleTrackedStateUpdates();
        this.handleEtaUpdates();
        this.handleUntrackedStateUpdates();
    }

    getAltitudeColor() {
        if (this.altitude === 'ground') return '#454545';
        if (this.altitude <= 10000) return '#90B712';
        return '#0F5AD2';
    }

    getHelicopterSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation - 90}deg);">
           <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="24pt" width="24pt" viewBox="0 0 129 97" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M10.641,51.985l-7.247,-0c-1.608,-0 -2.914,-1.583 -2.914,-3.532c-0,-1.949 1.306,-3.531 2.914,-3.531l7.247,0l-0,-11.939l-2.222,-3.862l10.382,-0l-0,15.801l29.212,0c3.128,-4.619 12.252,-8.389 24.205,-10.161l-23.317,-28.254c-1.137,-1.378 -1.137,-3.615 0,-4.994c1.138,-1.378 2.984,-1.378 4.121,0l26.761,32.428c2.543,-0.18 5.169,-0.275 7.856,-0.275c2.686,0 5.313,0.095 7.855,0.275l26.761,-32.428c1.137,-1.378 2.984,-1.378 4.121,0c1.137,1.379 1.137,3.616 0,4.994l-23.316,28.254c14.881,2.206 25.377,7.509 25.377,13.692c-0,6.184 -10.496,11.486 -25.377,13.693l23.316,28.253c1.137,1.379 1.137,3.616 0,4.994c-1.137,1.378 -2.984,1.378 -4.121,0l-26.761,-32.427c-2.542,0.18 -5.169,0.274 -7.855,0.274c-2.687,0 -5.313,-0.094 -7.856,-0.274l-26.761,32.427c-1.137,1.378 -2.983,1.378 -4.121,0c-1.137,-1.378 -1.137,-3.615 0,-4.994l23.317,-28.253c-11.953,-1.772 -21.077,-5.542 -24.205,-10.161l-29.212,-0l-0,15.801l-10.609,0l2.449,-3.882l-0,-11.919Z" style="fill:${color};stroke:#000;stroke-width:8px;"/></svg>
            </div>`;
    }
    getGliderSvg(rotation, color) {
        return `
             <div style="transform: rotate(${rotation - 180}deg);">
                      <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="36pt" height="36pt" viewBox="0 0 418 418" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M200.127,251.163c-37.011,-0.018 -189.276,-4.03 -194.597,-6.686c-1.528,-0.763 -0.744,-12.164 -0.744,-12.164c64.114,-6.037 129.804,-7.871 196.058,-8.202c0.943,-26.525 2.726,-69.856 4.793,-95.774c-7.588,-0.894 -26.208,-3.231 -30.692,-5.125c-1.348,-0.569 -0.714,-8.808 -0.714,-8.808l33.137,-2.611c0.498,-3.193 1.004,-4.994 1.509,-4.994c0.508,0 0.989,1.782 1.451,4.994l33.144,2.611c0,-0 0.634,8.239 -0.714,8.808c-4.523,1.911 -23.433,4.272 -30.89,5.149c1.765,25.918 3.044,69.226 3.692,95.744c66.712,0.312 132.859,2.13 197.409,8.208c-0,0 0.784,11.401 -0.744,12.164c-5.401,2.696 -162.195,6.789 -196.186,6.684l-0,24.824c-0,4.391 -2.771,34.971 -7.162,34.971c-4.39,-0 -8.75,-30.58 -8.75,-34.971l0,-24.822Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="417.755" height="417.755" style="fill:none;"/></svg>
            </div>`;
    }
    getBusinessAcftSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation}deg);">
             <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 344 344" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M154.91,200.479l-42.092,8.469l-106.729,46.327c-0,-0 -1.083,-15.428 1.162,-17.192c1.957,-1.538 57.124,-36.405 95.786,-61.975c11.126,-7.359 36.039,-27.192 51.873,-42.014l0,-60.961c0.416,-74.74 33.668,-76.238 33.244,-0l-0,60.977c15.835,14.82 40.758,34.644 51.876,41.998c38.663,25.57 93.829,60.437 95.787,61.975c2.244,1.764 1.162,17.192 1.162,17.192l-106.729,-46.327l-42.096,-8.464l-0,21.361c1.254,-3.172 4.226,-5.318 7.579,-5.127l2.413,0.138c4.301,0.245 7.61,4.243 7.385,8.922l-1.569,32.551c-0.059,1.232 -1.265,0.822 -3.05,0.112l-1.732,5.557l-8.423,-0.481l-1.229,-5.918c-0.516,0.14 -0.995,0.273 -1.424,0.375c-0.403,3.144 -3.239,8.131 -6.372,11.254c14.588,11.024 47.275,35.817 49.16,38.062c1.338,1.593 0.641,19.263 0.641,19.263l-55.039,-24.819c-0.625,4.385 -2.611,12.316 -4.96,12.316c-2.302,0 -4.254,-7.611 -4.921,-12.044l-54.436,24.547c0,-0 -0.696,-17.67 0.641,-19.263c1.87,-2.227 34.038,-26.633 48.798,-37.788c-3.23,-3.086 -6.215,-8.247 -6.651,-11.487c-0.473,-0.105 -1.014,-0.256 -1.602,-0.416l-1.23,5.918l-8.422,0.481l-1.732,-5.557c-1.786,0.71 -2.992,1.12 -3.051,-0.112l-1.568,-32.551c-0.226,-4.679 3.083,-8.677 7.384,-8.922l2.413,-0.138c3.519,-0.2 6.619,2.173 7.753,5.606l0,-21.845Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="-0" width="343.068" height="343.068" style="fill:none;"/></svg>
            </div>`;
    }
    getPistonAcftSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation + 90}deg);">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 375 375" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M59.724,188.988l-3.537,-0.97l3.535,-0.969c0.006,-27.991 2.095,-50.692 4.668,-50.692c2.493,-0 4.532,21.331 4.661,48.134l3.149,-0.863l0,-8.239l40.291,-6.337l8.621,0l0,-69.706l5.796,-88.053c0,0 0.611,-5.314 6.809,-5.83c8.604,-0.717 30.721,-0.426 30.721,-0.426l10.863,94.309l0,69.706l8.621,0l79.836,11.278l8.537,-51.482l25.727,-0.016l8.651,51.758l-14.048,3.818l25.563,3.61l-25.079,3.543l13.564,3.686l-8.651,51.758l-25.727,-0.016l-8.505,-51.286l-79.868,11.281l-8.621,0l0,69.707l-10.676,92.682c0,-0 -22.304,0.191 -30.908,-0.526c-6.198,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l0,-69.707l-8.621,0l-40.291,-6.336l0,-8.239l-3.159,-0.866c-0.204,26.018 -2.21,46.475 -4.651,46.475c-2.521,-0 -4.578,-21.808 -4.666,-49.03Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="374.375" height="374.375" style="fill:none;"/></svg>
             </div>`;
    }
    getTurboAcftSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation + 90}deg);">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="28pt" width="28pt" viewBox="0 0 373 373" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><path d="M175.148,206.165l0,69.599l-10.676,92.682c0,0 -22.304,0.191 -30.907,-0.526c-6.199,-0.517 -6.915,-5.713 -6.915,-5.713l-5.69,-86.443l-0,-0.227l-10.657,-0c-2.434,-0 -5.724,-0.647 -9.14,-1.771c-0.747,15.047 -2.758,25.836 -5.119,25.836c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.509 9.153,-1.509l10.657,-0l-0,-40.021l-8.621,-0l-31.987,-5.031c-2.572,-0.5 -5.454,-1.257 -8.305,-2.22c-1.83,-0.618 -3.646,-1.321 -5.359,-2.097c-1.889,-0.856 -3.652,-1.799 -5.166,-2.813c-2.993,-2.005 -5.014,-4.285 -5.12,-6.705c-0.003,-0.066 -0.004,-0.133 -0.004,-0.2c-0,-2.495 2.049,-4.846 5.126,-6.906c1.513,-1.013 3.274,-1.956 5.162,-2.811c1.713,-0.776 3.53,-1.48 5.361,-2.098c1.768,-0.598 3.548,-1.115 5.259,-1.542l35.033,-5.509l8.621,-0l-0,-40.221l-10.657,0c-2.434,0 -5.724,-0.646 -9.14,-1.771c-0.747,15.048 -2.758,25.837 -5.119,25.837c-2.615,-0 -4.8,-13.236 -5.315,-30.834c-3.651,-2.49 -6.239,-5.466 -6.239,-8.576c-0,-3.118 2.6,-5.92 6.265,-8.19c0.559,-17.175 2.716,-29.989 5.289,-29.989c2.347,0 4.348,10.664 5.106,25.575c3.42,-0.972 6.716,-1.51 9.153,-1.51l10.657,0l-0,-0.028l5.795,-88.052c0,-0 0.611,-5.314 6.81,-5.831c8.603,-0.717 30.72,-0.425 30.72,-0.425l10.863,94.308l0,69.357l7.978,0c5.903,0 46.523,2.45 81.337,6.453l7.679,-46.308l25.061,-0.016c-0.486,16.789 -0.722,33.766 -0.701,50.935c11.826,2.246 19.621,4.747 19.621,7.421c0,0.182 -0.036,0.364 -0.107,0.545c-0.082,0.209 -0.211,0.417 -0.384,0.625c-1.876,2.252 -8.998,4.432 -19.046,6.459c0.17,17.203 0.596,34.598 1.283,52.189l-25.727,-0.017l-7.821,-47.163c-34.783,4.383 -75.3,7.266 -81.195,7.266l-7.978,0Z" style="fill:${color};stroke:#000;stroke-width:8px;"/><rect x="0" y="0" width="372.521" height="372.521" style="fill:none;"/></svg>
             </div>`;
    }
    getFourEngAcftSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation - 90}deg);">
            <svg xmlns="http://www.w3.org/2000/svg" height="38pt" width="38pt" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1920 1664" width="1920pt">
                <path d="m6759 16622c-118-31-179-92-164-162 14-64 90-130 342-299 84-57 169-121 189-144s70-103 111-177c76-136 818-1504 1323-2440 150-278 314-577 365-665 146-253 327-589 461-857 139-278 169-342 179-387 4-17 10-31 14-31 16 0 161-383 161-425 0-11 6-29 14-40 22-33 426-1268 530-1620 43-147 86-314 86-334 0-12-68-13-512-9-708 8-2000-7-2745-32-343-11-710-21-817-23-107-1-198-5-202-10-11-11-104-9-104 3 0 6-20 10-45 10-31 0-45-4-45-14 0-8-15-16-37-20-57-9-63-8-63 14 0 17-7 20-50 20-47 0-50-2-50-25 0-21-5-25-27-25-16 0-38-3-50-6-20-5-23-2-23 20s-4 26-27 26c-51 0-73-11-73-35s-22-35-72-35c-24 0-28 4-28 26s-3 25-22 20c-13-3-35-6-50-6-24 0-28-4-28-30 0-25-4-30-35-36-45-8-65 0-65 26 0 19-4 20-37 15-61-10-63-12-57-43 6-27 4-29-33-35-57-10-63-9-63 12 0 27-12 32-60 25-39-6-41-9-38-37l3-31-175-38c-96-21-185-38-198-38-31 0-371 266-832 651-565 472-984 870-1277 1214-137 160-330 322-411 345-20 5-136 10-257 10-190 0-225-2-254-18-56-28-76-64-75-135 1-90 22-149 145-414 159-341 406-902 584-1323 43-102 120-279 170-395l92-210-66-7c-36-3-208-11-381-18-822-29-1514-84-1794-141-174-35-200-68-86-106 128-42 469-84 1125-138 139-11 942-55 1013-55 51 0 72-4 72-12 0-7-12-38-26-68s-79-179-144-330c-218-506-445-1009-585-1290-132-267-163-379-131-464 31-80 36-81 321-81 239 0 252 1 291 22 77 41 188 139 334 293 370 391 538 556 850 829 397 348 1111 921 1148 921 9 0 121-23 247-51 127-27 245-53 263-56 31-5 33-9 28-33-5-26-2-29 39-39 56-14 55-14 55 8 0 27 12 32 59 25 37-6 41-9 41-36 0-31 7-36 60-40 30-3 35 0 38 20 4 23 17 26 72 16 28-6 31-10 26-34-5-25-2-28 32-34 56-9 62-8 62 13 0 28 15 34 60 26 36-6 40-10 40-36 0-25 4-29 28-29 15 0 37-3 49-6 18-5 22-1 25 23 3 26 5 28 43 25 51-5 55-8 55-38 0-22 4-24 50-24 43 0 50 3 50 20s7 20 50 20 50-3 50-20 7-20 50-20c39 0 50 3 50 16 0 14 8 15 48 9 26-4 49-11 50-16 4-11 102-12 102-1 0 5 28 5 63 1 34-4 121-8 192-8 72-1 155-3 185-6 30-2 129-7 220-10s359-15 595-25c237-11 478-20 538-20 59 0 107-3 107-7 0-5 109-8 242-8 134 1 421-2 638-6s612-8 878-9c265-1 482-5 482-10 0-63-606-1883-633-1901-5-4-13-28-18-53-11-60-115-308-183-436-7-14-41-83-76-155-109-229-346-662-540-990-43-71-137-238-210-370s-139-244-146-248-18-25-24-46c-5-21-19-48-30-61-11-12-22-32-26-44-7-22-72-140-570-1034-175-315-328-589-338-610-55-107-452-812-472-839-14-18-123-98-243-178-121-80-237-165-259-189-69-75-66-132 10-189 83-62 214-79 368-47 181 37 688 216 803 283 110 65 363 340 484 525 194 300 654 876 1294 1622 130 151 245 285 256 298 26 29 123 33 123 5 0-19 39-55 125-116l60-42 472-3 472-3 35 32 36 31v295 295l-31 29-31 29-388 2-389 3 97 110c352 398 929 1045 1208 1355l330 365 127 3c106 2 127 0 127-12 0-19 119-120 173-148 42-21 47-21 482-15 242 4 453 7 468 7 17 0 37 10 52 26l25 27v299 300l-31 29-31 29h-450-450l109 118c59 64 308 335 553 602 584 638 666 719 855 852 83 58 169 117 191 132l42 27 1188-2c805-1 1252 2 1384 10 641 38 1148 105 1555 205 265 65 423 125 599 225 164 93 306 244 306 325 0 112-176 275-435 401-296 145-800 257-1500 334-449 50-853 64-2135 77-459 4-712 10-725 17-39 20-382 261-532 374-147 109-165 127-455 446-397 436-972 1077-976 1088-2 5 198 9 456 9h460l26 31 26 31v285 285l-29 29-29 29h-480-480l-58-44c-33-24-76-60-97-80l-38-36h-119-120l-197 223c-243 272-877 997-1192 1362l-234 270 391 3 391 2 30 31 31 31v290 290l-29 29-29 29h-469c-459 0-469 0-503-21-58-36-160-122-160-136 0-9-16-13-54-13h-54l-184 218c-639 756-1122 1369-1337 1697-137 209-323 425-458 532-98 77-656 292-875 337-97 20-155 19-239-2z" transform="matrix(.1 0 0 -.1 0 1664)" fill="${color}" stroke="black" stroke-width="2" vector-effect="non-scaling-stroke"/>
            </svg>
            </div>`;
    }
    getBallOrShipSvg(color) {
        return `
            <div> 
            <?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 174 174" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><rect x="0" y="0" width="173.267" height="173.267" style="fill:none;"/><g><g><path d="M86.829,3.091c0,-0 -13.208,21.263 -13.766,45.836c-0.559,24.573 11.051,81.41 11.051,81.41" style="fill:none;stroke:#000;stroke-width:1px;"/><path d="M86.633,3.08c0,-0 13.209,21.263 13.767,45.836c0.559,24.573 -11.051,81.41 -11.051,81.41" style="fill:none;stroke:#000;stroke-width:1px;"/><path id="_--xml-version--1.0--encoding--UTF-8--standalone--no---" serif:id="&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot; standalone=&quot;no&quot;?&gt;" d="M86.829,3.091c0,-0 -27.41,3.403 -39.765,27.25c-8.196,15.821 -0.292,34.674 2.479,41.508c2.859,7.053 28.106,58.488 28.106,58.488" style="fill:${color};stroke:#000;stroke-width:1px;"/><path id="_--xml-version--1.0--encoding--UTF-8--standalone--no---1" serif:id="&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot; standalone=&quot;no&quot;?&gt;" d="M86.829,3.08c0,-0 27.411,3.403 39.765,27.25c8.197,15.821 0.293,34.674 -2.478,41.508c-2.859,7.053 -28.106,58.488 -28.106,58.488" style="fill:none;stroke:#000;stroke-width:1px;"/></g><path d="M101.2,130.499l-3.126,10.142l-20.435,-0l-3.812,-9.837l27.373,-0.305Z" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M84.525,140.641l0.537,13.991" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M91.162,140.641l-0.537,13.991" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M77.639,140.641l1.909,13.991" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M98.074,140.641l-1.909,13.991" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M48.466,99.811c-11.003,-14.496 -18.046,-32.985 -19.168,-46.719c-2.208,-27.049 21.128,-49.403 57.531,-50.001c35.546,-0.584 58.784,22.113 57.208,50.001c-0.777,13.753 -7.742,32.232 -18.747,46.719c-0.119,0.157 -0.239,0.313 -0.359,0.469l-23.731,30.219l-27.373,0.305l-25.468,-30.993l0.107,0Z" style="fill:none;stroke:#000;stroke-width:1.7px;"/><path d="M77.639,154.632l20.435,0l-0,3.508l-0.953,-0l-0,12.047l-18.529,0l0,-12.047l-0.953,-0l0,-3.508Z" style="fill:${color};stroke:#000;stroke-width:1.7px;"/></g></svg>
            </div>`;
    }
    getTowerSvg() {
        return `<img src="img/pole.svg" style="width: 42px; height:42px;">`;
    }
    getDefaultAcftSvg(rotation, color) {
        return `
            <div style="transform: rotate(${rotation - 90}deg);">
            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" height="28pt" width="28pt" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="135 0 798 768" enable-background="new 135 0 798 768" xml:space="preserve">
            <path fill="${color}" stroke="#000000" stroke-width="30" stroke-miterlimit="10" d="M151.7,388c0,1.6,30.9,9.5,30.9,9.5l-29.8,100.3
            c-1.2,5.2,4.9,6.4,4.9,6.4l17.2-0.4c9.2-1.6,15.6-8.4,15.6-8.4l59.2-86.4c15.3,7.7,169.7,13.4,240.6,16c33.2,1.2,34.8,3.6,34.8,3.6
            c0.7,4-2.8,35-4,44.9c-0.1,0-0.2,0.4-0.3,0.4h-14.2c-2.7,0-4.9,2.2-4.9,4.9c0,2.7,2.2,4.9,4.9,4.9h12.2c-2.7,8.7-7.3,22-11.9,34.8
            c-0.7-0.6-1.6-1-2.5-1h-8.7c-2.1,0-3.8,1.7-3.8,3.8c0,2.1,1.7,3.8,3.8,3.8h8.7c0.1,0,0.1,0,0.2,0c-5.4,14.8-10.2,28.3-11.2,30.5
            h-11.8c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h8.4c-3.5,9.8-7.6,21.1-12.1,32.9c-0.4-0.2-0.8-0.2-1.2-0.2h-8.7
            c-1.8,0-3.3,1.5-3.3,3.3c0,1.8,1.5,3.3,3.3,3.3h7.5c-2.5,6.5-5,13.1-7.6,19.6h-7c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h3.1
            C440.3,694,414,754.4,414,754.4c-5.2,12.4,11.6,8.3,11.6,8.3c22.4-9.2,34.5-22.4,34.5-22.4l143-228.6c0.7,0.9,5.6,7.3,8.6,7.9
            l48.3,0.3c0,0,5.2-3.2,5.2-4.8l-0.3-27.7c0,0-3.9-3.5-6.1-4.2l-37.1-1.2l31.2-49.9c6.8-6.8,14.2-6.8,14.2-6.8l171.7-1.1
            c75.3-11.1,84.8-35.3,84.8-35.3c2-7.5,0-9.5,0-9.5s-9.5-24.2-84.8-35.3L667,343c0,0-7.4,0-14.2-6.8l-31.2-49.9l37.1-1.2
            c2.3-0.6,6.1-4.2,6.1-4.2l0.3-27.7c0-1.6-5.2-4.8-5.2-4.8l-48.3,0.3c-3,0.6-7.9,7-8.6,7.9L460.1,28c0,0-12.1-13-34.5-22.2
            c0,0-16.8-3.5-11.6,8.9c0,0,26.3,61.4,49.9,121.3h-3.1c-2.7,0-4.9,2.2-4.9,4.9c0,2.7,2.2,4.9,4.9,4.9h7c2.6,6.5,5.2,13.1,7.6,19.6
            h-7.5c-1.8,0-3.3,1.5-3.3,3.3s1.5,3.3,3.3,3.3h8.7c0.4,0,0.8-0.1,1.2-0.2c4.5,11.9,8.7,22,12.1,32.9h-8.4c-2.7,0-4.9,2.2-4.9,4.9
            s2.2,4.9,4.9,4.9h11.8c1,2.2,5.9,15.7,11.2,30.5c-0.1,0-0.1,0-0.2,0h-8.7c-2.1,0-3.8,1.7-3.8,3.8s1.7,3.8,3.8,3.8h8.7
            c1,0,1.9-0.4,2.5-1c4.6,12.8,9.2,26.1,11.9,34.8h-12.2c-2.7,0-4.9,2.2-4.9,4.9s2.2,4.9,4.9,4.9h14.2c0.1,0,0.2-0.6,0.3-0.6
            c1.2,9.9,4.7,40.2,4,44.2c0,0-1.6,2.3-34.8,3.5c-71,2.6-225.3,8.3-240.6,15.9l-59.2-86.4c0,0-6.4-6.8-15.6-8.4l-17.2-0.4
            c0,0-6,1.2-4.8,6.4l29.7,100.3c0,0-35.1,10.4-35.1,12L151.7,388z"/>
            </svg>
        </div>`;
    }

    getUnkownAcftSvg(rotation, color) {
        return `
        <div style="transform: rotate(${rotation}deg);">
<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="22pt" height="22pt" viewBox="0 0 148 148" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><rect x="0" y="0" width="147.194" height="147.194" style="fill:none;"/><g id="Flugzeug"><path d="M60.014,35.494c0,-38.347 27.166,-38.41 27.166,-0.063c-0,38.348 -6.086,105.061 -13.583,105.061c-7.497,-0 -13.583,-66.65 -13.583,-104.998Z" style="fill:${color};stroke:#000;stroke-width:2px;"/><path d="M141.52,86.897l-67.847,-13.333l-67.999,13.333c0,-0 -0.562,-14.616 4.303,-18.164c11.333,-8.265 63.696,-31.426 63.696,-31.426c-0,-0 52.236,23.161 63.544,31.426c4.862,3.553 4.303,18.164 4.303,18.164Z" style="fill:${color};stroke:#000;stroke-width:2px;"/><path d="M108.69,134.835l-35.054,-7l-35.132,7c0,0 -0.29,-7.674 2.223,-9.537c5.856,-4.34 32.909,-16.502 32.909,-16.502c0,0 26.989,12.162 32.831,16.502c2.512,1.866 2.223,9.537 2.223,9.537Z" style="fill:${color};stroke:#000;stroke-width:2px;"/></g></svg>
        </div>
        `;
    }

    isHelicopter() {
        return helAcft.includes(this.type) ||
            (this.callsign && (
                (this.callsign.startsWith('DH') && this.callsign.replace(/\s/g, '').length == 5) ||
                this.callsign.startsWith('CHX') ||
                this.callsign.startsWith('HSO')
            ));
    }

    isPistonAcft() {
        return pistonAcft.includes(this.type) ||
            (this.callsign && (this.callsign.startsWith('DM') && this.callsign.replace(/\s/g, '').length == 5)) ||
            (this.callsign && (this.callsign.startsWith('DE') && this.callsign.replace(/\s/g, '').length == 5));
    }

    isGlider() {
        return gliderAcft.includes(this.type) ||
            this.type == 'GLID';
    }

    isTwoEngAcft() {
        return twoEngAcft.includes(this.type);
    }

    getSvgForType(rotation, color) {
        if (this.isHelicopter()) {
            return this.getHelicopterSvg(rotation, color);
        } else if (this.isGlider()) {
            return this.getGliderSvg(rotation, color);
        } else if (businessAcft.includes(this.type)) {
            return this.getBusinessAcftSvg(rotation, color);
        } else if (this.isPistonAcft()) {
            return this.getPistonAcftSvg(rotation, color);
        } else if (turboAcft.includes(this.type)) {
            return this.getTurboAcftSvg(rotation, color);
        } else if (fourEngAcft.includes(this.type)) {
            return this.getFourEngAcftSvg(rotation, color);
        } else if (this.type == 'BALL' || this.type == 'SHIP') {
            return this.getBallOrShipSvg(color);
        } else if (this.registration == 'TWR') {
            return this.getTowerSvg();
        } else if (this.isTwoEngAcft()) {
            return this.getDefaultAcftSvg(rotation, color);
        } else {
            return this.getUnkownAcftSvg(rotation, color);
        }
    }
}