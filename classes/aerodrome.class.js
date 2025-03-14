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
        this.icon = this.createCustomIcon(); // Das Icon wird sofort beim Erstellen gesetzt
        this.marker = null; // initialisieren, aber noch nicht gesetzt
        this.aipImgs = [];
        this.currentImgIndex;
        this.rotationAngle = 0;
        this.aipImgsAct = false;
    }

    createCustomIcon() {
        // Überprüfen, ob `this.rwys` und `trueHeading` verfügbar sind
        const trueHeading = this.rwys && this.rwys[0] ? this.rwys[0].trueHeading : 0;

        const iconHtml = `
            <div class="marker-icon" style="position: relative; width: 16px; height: 16px;">
                <img src="img/airport.png" alt="Aerodrome Icon" style="width: 16px; height: 16px;">
                <div class="rotation-bar" 
                    style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 25px;
                        height: 3px;
                        background-color: black;
                        transform: translate(-50%, -50%) rotate(${trueHeading - 90}deg);
                        transform-origin: center;
                    ">
                </div>
                <div class="additional-info" style="display: none; font-size: 12px; width: 35px; padding: 5px;">
                    ${this.icaoCode}
                </div>
            </div>
        `;

        return L.divIcon({
            className: 'custom-icon',
            html: iconHtml,
            iconSize: [16, 16], // Größe des Icons
        });
    }



    // Methode zum Hinzufügen des Markers zur Karte
    addToMap() {
        // Marker wird hier hinzugefügt, wenn das Icon erstellt wird
        this.marker = L.marker([this.geometry.coordinates[1], this.geometry.coordinates[0]], { icon: this.icon }).addTo(this.map);

        // Binde ein Popup an den Marker
        this.marker.bindPopup(`Name: ${this.name}<br>ICAO: ${this.icaoCode}`);

        // Setze einen Event-Listener für Zoom-Änderungen, wenn der Marker auf der Karte ist
        this.map.on('zoomend', () => this.toggleAdditionalInfo());

        // Initialisiere die Zusatzinformationen beim Erstellen des Markers
        this.toggleAdditionalInfo();

        // Event-Listener für Hover
        this.marker.on('mouseover', () => {
            this.marker.openPopup(); // Popup öffnen
        });

        this.marker.on('mouseout', () => {
            this.marker.closePopup(); // Popup schließen
        });

        // Event-Listener für Klick auf den Marker
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
        let weatherData = await this.fetchWeatherData(this.geometry);
        const detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = '';
        detailDiv.innerHTML +=
            `
            <div class="overlay"></div>
            <div class="cardWrapper">
            <div class="aerodromeCard" id="aerodromeCard">
                <button onclick="currentAerodrome.closeDetailInfo()" class="closeButton">X</button>
                <h2>${this.name}</h2>
                <h3>${this.icaoCode}</h3>
                <div class="orderWeatherData">
                <div>
                    <ul>Temperatur:</ul>
                    <ul>Wolkendecke:</ul>
                    <ul>Druck auf Meereshöhe:</ul>
                    <ul>Druck am Boden:</ul>
                    <ul>Regen:</ul>
                    <ul>Schnee:</ul>
                    <ul>Windrichtung:</ul>
                    <ul>Windböhen:</ul>
                    <ul>Windgeschwindigkeit:</ul>
                </div>
                <div>
                <ul>${weatherData.current.temperature_2m}°C</ul> 
                <ul>${weatherData.current.cloud_cover}%</ul> 
                <ul>${weatherData.current.pressure_msl}hPa</ul> 
                <ul>${weatherData.current.surface_pressure}hPa</ul> 
                <ul>${weatherData.current.showers}mm</ul> 
                <ul>${weatherData.current.snowfall}cm</ul> 
                <ul>${weatherData.current.wind_direction_10m}°</ul> 
                <ul>${weatherData.current.wind_gusts_10m}km/h</ul> 
                <ul>${weatherData.current.wind_speed_10m}km/h</ul> 

                </div>   
                </div>
                <div class="buttonWithLoader">
                    <button class="aerodromeCardButton" id="showAipImgsBtn" disabled onclick="currentAerodrome.toggleAIPImgs()">
                    <span class="loader z-index1100" id="loaderAipImg" style="display: none;"></span>
                    AIP-Info</button>
                    <button class="aerodromeCardButton" id="showNotam" disabled onclick="currentAerodrome.toggleNotam()">
                    <span class="loader z-index1100" id="loaderNotam" style="display: none;"></span>
                    NOTAM</button>                    
                </div>

            </div>
                <div id="aipInfo">                    
                    </div>
                </div>
            </div>
          
            `;
        try {
            let loader = document.getElementById('loaderAipImg');
            loader.style.display = 'inline-block';
            if (this.aipImgs) {
                this.currentImgIndex = 0;
                let aipImgBtn = document.getElementById('showAipImgsBtn');
                aipImgBtn.disabled = false;
                loader.style.display = 'none';
            } else {
                throw new Error('Keine Bilder gefunden');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Bilder:', error.message);
            detailDiv.innerHTML = `
            <div class="overlay"></div>
            <div class="error">
                <p>Fehler beim Laden der Bilder.</p>
                <button class="errorCloseBtn" onclick="currentAerodrome.closeDetailInfo()">X</button>
            </div>
            `;
        }
    }

    setaipInfo(icaoCode) {        
        aipInfo.forEach(item => {
            if (item.Flugplatz === icaoCode) {
                // Initialisiere this.aipIds mit den ersten beiden Werten
                this.aipIds = [
                    item.Adinfo, // adInfoId
                    item.AD      // adChartId
                ];
                console.log(item.VFRchart);
                // Prüfe, ob VFRchart ein Array ist, und füge Elemente einzeln hinzu
                if (Array.isArray(item.VFRchart)) {
                    
                    
                    item.VFRchart.forEach(item => {
                        this.aipIds.push(item); // Füge alle Elemente des Arrays einzeln hinzu
                    });
                } else if (item.VFRchart) {
                    this.aipIds.push(item.VFRchart); // Füge den einzelnen Wert hinzu
                }
            }
        });
        console.log(this.aipIds);
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

            // this.loadPdf('https://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=21599');
          
            // pageIndicator.innerHTML = `${this.currentImgIndex + 1} / ${this.aipImgs.images.length}`;
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
        setTimeout(() => {
            detailDiv.innerHTML = '';
        }, 1000);
    }

    









    

}
