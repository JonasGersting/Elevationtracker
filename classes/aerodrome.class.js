class Aerodrome extends AirspacePolygon {
    aipIds = [];
    currentPage = 0;
    constructor(geometry, name, map, icaoCode, rwys) {
        super(geometry, name, map, icaoCode);
        this.geometry = geometry;
        this.name = name;
        this.map = map;
        this.icaoCode = icaoCode;
        this.rwys = rwys;
        this.icon = this.createCustomIcon();
        this.marker = null;
        this.aipImgs = [];
        this.currentImgIndex;
        this.rotationAngle = 0;
        this.aipImgsAct = false;
    }

    createCustomIcon() {
        const trueHeading = this.rwys && this.rwys[0] ? this.rwys[0].trueHeading : 0;
        const circleSize = 18; // px
        const borderWidth = 3; // px
        const borderColor = 'black';
        const backgroundColor = 'transparent';
        let rotationBarHtml = '';
        if (this.rwys !== undefined) {
            rotationBarHtml = `
                <div class="rotation-bar"
                    style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 25px; /* Breite des Runway-Indikators */
                        height: 3px; /* Dicke des Runway-Indikators */
                        background-color: black;
                        transform: translate(-50%, -50%) rotate(${trueHeading - 90}deg);
                        transform-origin: center;
                    ">
                </div>`;
        }

        const iconHtml = `
            <div class="marker-icon" style="position: relative; width: ${circleSize}px; height: ${circleSize}px; display: flex; align-items: center; justify-content: center;">
                <div class="circle-marker"
                    style="
                        width: ${circleSize}px;
                        height: ${circleSize}px;
                        background-color: ${backgroundColor};
                        border: ${borderWidth}px solid ${borderColor};
                        border-radius: 50%;
                        box-sizing: border-box;
                    ">
                </div>
                ${rotationBarHtml}
                <div class="additional-info" style="display: none; font-size: 12px; width: 35px; position: absolute; right: -32px; bottom: -18px;">
                    ${this.icaoCode}
                </div>
            </div>
        `;

        return L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [circleSize, circleSize],
            iconAnchor: [circleSize / 2, circleSize / 2]
        });
    }

    addToMap() {
        this.marker = L.marker([this.geometry.coordinates[1], this.geometry.coordinates[0]], { icon: this.icon }).addTo(this.map);
        this.marker.bindPopup(`Name: ${this.name}<br>ICAO: ${this.icaoCode}`);
        this.map.on('zoomend', () => this.toggleAdditionalInfo());
        this.toggleAdditionalInfo();
        this.marker.on('mouseover', () => {
            this.marker.openPopup();
        });
        this.marker.on('mouseout', () => {
            this.marker.closePopup();
        });
        this.marker.on('click', () => this.onClick());
    }

    toggleAdditionalInfo() {
        if (!this.marker || !this.marker._icon) return;

        const zoomLevel = this.map.getZoom();
        const infoElement = this.marker._icon.querySelector('.additional-info');

        if (infoElement) {
            if (zoomLevel >= 9) {
                infoElement.style.display = 'block';
            } else {
                infoElement.style.display = 'none';
            }
        }
    }

    async onClick() {
        this.setaipInfo(this.icaoCode);
        currentAerodrome = this;
        const detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = '';
        const metarTargetId = `${this.icaoCode}`;
        const cardHTML = `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="aerodromeCard" id="aerodromeCard">
                    <button onclick="currentAerodrome.closeDetailInfo()" class="closeButton">X</button>
                    <h2>${this.name}</h2>
                    <h3>${this.icaoCode}</h3>
                    <a href="https://metar-taf.com/de/${this.icaoCode}" target="_blank" id="metartaf-${metarTargetId}" class="metar">METAR &quot;${this.name}&quot; Airfield</a>
                    <div class="buttonWithLoader">
                        <button class="aerodromeCardButton" id="showAipImgsBtn" onclick="currentAerodrome.toggleAIPImgs()">
                        <span class="loader z-index1100" id="loaderAipImg" style="display: none;"></span>
                        AIP-Info</button>
                        <button class="aerodromeCardButton" id="showNotam" disabled onclick="currentAerodrome.toggleNotam()">
                        <span class="loader z-index1100" id="loaderNotam" style="display: none;"></span>
                        NOTAM</button>
                    </div>
                </div>
                <div id="aipInfo">
                </div>
            </div>`;
        detailDiv.innerHTML = cardHTML;
        if (!document.getElementById(`metartaf-${metarTargetId}`)) {
            console.error(`METAR Target Element ${metarTargetId} NICHT im DOM gefunden, bevor das Skript angehängt wurde!`);
            const targetLinkFallback = document.getElementById(metarTargetId);
            if (targetLinkFallback) {
                targetLinkFallback.textContent = `METAR/TAF für ${this.icaoCode} konnte nicht initialisiert werden.`;
            }
            return;
        }
        const metarScript = document.createElement('script');
        metarScript.async = true;
        metarScript.defer = true;
        metarScript.crossOrigin = 'anonymous';
        metarScript.src = `https://metar-taf.com/de/embed-js/${this.icaoCode}?qnh=hPa&rh=rh&target=${metarTargetId}`;

        metarScript.onerror = () => {
            console.error(`Fehler beim Laden des METAR Skripts für ${metarTargetId} von ${metarScript.src}`);
            const targetLink = document.getElementById(metarTargetId);
            if (targetLink) {
                targetLink.textContent = `METAR/TAF für ${this.icaoCode} konnte nicht geladen werden.`;
                targetLink.href = '#error-loading-metar';
            }
        };
        document.body.appendChild(metarScript);
        try {
            let loader = document.getElementById('loaderAipImg');
            loader.style.display = 'inline-block';
            if (this.aipImgs) {
                this.currentImgIndex = 0;
                let aipImgBtn = document.getElementById('showAipImgsBtn');
                aipImgBtn.disabled = false;
                loader.style.display = 'none';
            } else {
                let aipImgBtn = document.getElementById('showAipImgsBtn');
                aipImgBtn.disabled = true;
                loader.style.display = 'none';
                console.warn(`Keine AIP Bilder für ${this.icaoCode} gefunden oder this.aipImgs ist leer.`);
            }
        } catch (error) {
            console.error('Fehler beim Initialisieren der AIP-Bilder Anzeige:', error.message);
        }
    }

    setaipInfo(icaoCode) {
        aipInfo.forEach(item => {
            if (item.Flugplatz === icaoCode) {
                this.aipIds = [
                    item.Adinfo,
                    item.AD
                ];
                if (Array.isArray(item.VFRchart)) {
                    item.VFRchart.forEach(item => {
                        this.aipIds.push(item);
                    });
                } else if (item.VFRchart) {
                    this.aipIds.push(item.VFRchart);
                }
            }
        });
    }

    async fetchWeatherData(geometry) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${geometry.coordinates[1]}&longitude=${geometry.coordinates[0]}&current=temperature_2m,showers,snowfall,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP-Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fehler beim Abrufen der Wetterdaten:", error);
            return null;
        }
    }

    toggleAIPImgs() {
        let aipImgContainer = document.getElementById('aipInfo');
        let aerodromeCard = document.getElementById('aerodromeCard');
        if (this.aipImgsAct) {
            this.aipImgsAct = false;
            aipImgContainer.style.width = '0px';
            aerodromeCard.style.borderRadius = '16px';
        } else {
            this.aipImgsAct = true;
            aerodromeCard.style.borderTopRightRadius = '0px';
            aerodromeCard.style.borderBottomRightRadius = '0px';
            aipImgContainer.style.width = '900px';
            aipImgContainer.innerHTML +=
                `
                       <button onclick="currentAerodrome.changeAipImg('left')" class="switchButton left-32" id="switchAipImgLeft"><</button>
                    <button onclick="currentAerodrome.changeAipImg('right')" class="switchButton right-32" id="switchAipImgRight">></button>
                    <span id="pageIndicator">${this.currentPage + 1} / ${this.aipIds.length}</span>
                    <iframe id="pdfIframe" src="https://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=${this.aipIds[this.currentPage]}#zoom=155" frameborder="0"></iframe>
            `
        }
    }

    changeAipImg(direction) {
        let aipIframe = document.getElementById('pdfIframe');
        if (direction == 'right') {
            if (this.currentPage != this.aipIds.length - 1) {
                this.currentPage++
            } else {
                this.currentPage = 0;
            }
            aipIframe.src = `https://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=${this.aipIds[this.currentPage]}#zoom=155`;
        }
        if (direction == 'left') {
            if (this.currentPage == 0) {
                this.currentPage = this.aipIds.length - 1;
            } else {
                this.currentPage--;
            }
            aipIframe.src = `https://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=${this.aipIds[this.currentPage]}#zoom=155`;
        }
        let pageIndicator = document.getElementById('pageIndicator');
        pageIndicator.innerHTML = '';
        pageIndicator.innerHTML = `${this.currentPage + 1} / ${this.aipIds.length}`;
    }

    closeDetailInfo() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '0px';
    }
}
