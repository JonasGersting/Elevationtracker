class AirspacePolygon {
    aipInfoAirspace;
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        this.geometry = geometry;
        this.name = name;
        this.ident = ident;
        this.map = map;
        this.layer = null;
        this.polygonLayers = polygonLayers;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.scale = 1;
        this.rotation = 0;
        this.centerLat = centerLat;
        this.centerLon = centerLon;
        this.lowerLimit = lowerLimit;
        this.lowerLimitUnit = lowerLimitUnit;
        this.upperLimit = upperLimit;
        this.upperLimitUnit = upperLimitUnit;

        // Label spezifische Eigenschaften
        this.labelMarker = null;
        this.labelHighlightColor = 'darkgrey'; // Standard-Highlight-Farbe
        this.labelHighlightTextColor = 'white'; // Standard-Highlight-Textfarbe
        this._boundUpdateLabelVisibility = this._updateLabelVisibility.bind(this);
        this._labelTemporarilyVisibleByHover = false;

        // Binden der neuen Listener für Polygon-Hover-Events
        this._boundPolygonMouseoverForLabel = this._onPolygonMouseoverForLabel.bind(this);
        this._boundPolygonMouseoutForLabel = this._onPolygonMouseoutForLabel.bind(this);
        this._boundPolygonClick = this._onPolygonClick.bind(this); // Klick-Handler binden

    }


    _shouldHaveLabel() {
        return this instanceof EdrAirspace ||
            this instanceof EddAirspace ||
            this instanceof CtrAirspace ||
            this instanceof RmzAirspace ||
            this instanceof TmzAirspace;
    }

    _initializeLabel() {
        if (!this.map) return;
        this._createLabelMarker();
        if (this.labelMarker) {
            this._updateLabelVisibility(); // Initiale Sichtbarkeit festlegen
            this.map.on('zoomend', this._boundUpdateLabelVisibility);
        }
    }

    _createLabelMarker() {
        if (!this.centerLat || !this.centerLon) {
            // Fallback oder Warnung, wenn Zentrum nicht verfügbar ist, obwohl es für Label-Klassen sein sollte
            console.warn(`Label für ${this.ident || this.name} kann nicht ohne centerLat/centerLon erstellt werden.`);
            // Versuch, Zentrum aus Geometrie zu ermitteln, falls Layer schon existiert
            if (this.layer) {
                try {
                    const bounds = this.layer.getBounds();
                    if (bounds.isValid()) {
                        const center = bounds.getCenter();
                        this.centerLat = center.lat;
                        this.centerLon = center.lng;
                        console.log(`Fallback: Zentrum für ${this.ident || this.name} aus Geometrie ermittelt.`);
                    } else {
                        console.error(`Ungültige Bounds für ${this.ident || this.name}, Label kann nicht positioniert werden.`);
                        return;
                    }
                } catch (e) {
                    console.error(`Fehler beim Ermitteln des Zentrums für ${this.ident || this.name}:`, e);
                    return;
                }
            } else {
                console.error(`Layer für ${this.ident || this.name} nicht vorhanden, Label kann nicht positioniert werden.`);
                return;
            }
        }

        let limitsHtml = '';

        limitsHtml = `
                <span style="border-bottom: 1px solid #555; display: inline-block; margin-bottom: 2px; padding-bottom: 1px;">${this.upperLimit} ${this.upperLimitUnit}</span><br>
                <span style="display: inline-block; margin-top: 1px;">${this.lowerLimit} ${this.lowerLimitUnit}</span>`;


        let primaryDisplay = '';
        let secondaryDisplayHtml = ''; // Für den Hover-Effekt bei EDR/EDD

        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            primaryDisplay = this.ident || 'N/A';
            // Nur den Namen als sekundäre Info anzeigen, wenn er vorhanden und anders als der Ident ist
            if (this.name && this.name !== primaryDisplay) {
                secondaryDisplayHtml = `<div class="airspace-label-name" style="display: none; margin-top: 3px; font-weight: normal;">${this.name}</div>`;
            }
        } else if (this instanceof CtrAirspace || this instanceof RmzAirspace || this instanceof TmzAirspace) {
            primaryDisplay = this.name || this.ident || 'N/A'; // Name bevorzugen, Fallback auf Ident
            // Kein sekundäres Display für diese Typen
        } else {
            // Fallback für andere Typen, falls sie Labels bekommen sollten (aktuell nicht der Fall laut _shouldHaveLabel)
            primaryDisplay = this.ident || this.name || 'N/A';
        }

        const labelHtml = `
            <div style="line-height: 1.2;">
                <b>${primaryDisplay}</b><br>
                ${limitsHtml}
            </div>
            ${secondaryDisplayHtml}
        `;

        const divIcon = L.divIcon({
            html: labelHtml,
            className: 'airspace-custom-label', // Generische CSS-Klasse
            iconSize: null,
        });

        const markerPosition = L.latLng(this.centerLat, this.centerLon);

        this.labelMarker = L.marker(markerPosition, {
            icon: divIcon,
            pane: 'markerPane',
            interactive: true
        });

        this.labelMarker.on('mouseover', (e) => {
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                iconElement.style.backgroundColor = this.labelHighlightColor;
                iconElement.style.color = this.labelHighlightTextColor;
                iconElement.style.zIndex = '1000'; // Label nach vorne bringen

                // Nur für EDR/EDD den sekundären Namen anzeigen, falls vorhanden
                if (this instanceof EdrAirspace || this instanceof EddAirspace) {
                    const nameElement = iconElement.querySelector('.airspace-label-name');
                    if (nameElement) {
                        nameElement.style.display = 'block';
                    }
                }
            }
            // Zugehöriges Polygon-Layer hervorheben und nach vorne bringen
            if (this.layer) {
                this.layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 }); // EDR-Hover-Stil
                this.layer.bringToFront();
            }
        });

        this.labelMarker.on('mouseout', (e) => {
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                iconElement.style.backgroundColor = '';
                iconElement.style.color = '';
                iconElement.style.zIndex = ''; // z-index zurücksetzen

                // Nur für EDR/EDD den sekundären Namen ausblenden, falls vorhanden
                if (this instanceof EdrAirspace || this instanceof EddAirspace) {
                    const nameElement = iconElement.querySelector('.airspace-label-name');
                    if (nameElement) {
                        nameElement.style.display = 'none';
                    }
                }
            }
            // Polygon-Layer-Stil zurücksetzen
            if (this.layer) {
                this.layer.setStyle(this.getStyle()); // Ruft getStyle() der Unterklasse auf
            }
        });

        this.labelMarker.on('click', async () => {
            currentAirspace = this; // Globale Variable? Sicherstellen, dass das so gewollt ist.
            const id = await this.setAipInfoAirspace(this.ident || this.name);
            if (id) {
                this.showInfoPdf(id);
            } else {
                console.log('No PDF ID found for:', this.ident || this.name);
            }
        });
    } // Ende _createLabelMarker

    _onPolygonMouseoverForLabel() {
        if (!this.map || !this.labelMarker) return;

        const currentZoom = this.map.getZoom();
        const iconElement = this.labelMarker.getElement();

        if (iconElement) {
            iconElement.style.zIndex = '1000';
            // Label-Hintergrund/Textfarbe setzen (verwendet subklassenspezifische Farben)
            iconElement.style.backgroundColor = this.labelHighlightColor;
            iconElement.style.color = this.labelHighlightTextColor;
        }

        if (currentZoom < 9 && !this.map.hasLayer(this.labelMarker)) {
            this.labelMarker.addTo(this.map);
            this._labelTemporarilyVisibleByHover = true;
        }
    }

    _onPolygonMouseoutForLabel() {
        if (!this.map || !this.labelMarker) return;

        const iconElement = this.labelMarker.getElement();
        if (iconElement) {
            iconElement.style.zIndex = '';
            // Label-Hintergrund/Textfarbe zurücksetzen
            iconElement.style.backgroundColor = '';
            iconElement.style.color = '';
        }

        if (this._labelTemporarilyVisibleByHover) {
            if (this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
            this._labelTemporarilyVisibleByHover = false;
        }
    }

    async _onPolygonClick() {
        currentAirspace = this;
        // Bestimme den Identifier für die AIP-Abfrage basierend auf dem Typ
        const identifier = (this instanceof EdrAirspace || this instanceof EddAirspace)
            ? this.ident
            : (this.name || this.ident); // Für CTR, RMZ, TMZ Name bevorzugen, Fallback auf Ident

        if (!identifier) {
            console.log('Kein Identifikator (Name oder Ident) für AIP-Abfrage vorhanden.');
            return;
        }

        const id = await this.setAipInfoAirspace(identifier);
        if (id) {
            this.showInfoPdf(id);
        } else {
            console.log('No PDF ID found for:', identifier);
        }
    }

    _updateLabelVisibility() {
        if (!this.labelMarker || !this.map) return;

        const currentZoom = this.map.getZoom();
        const labelShouldBeNormallyVisible = currentZoom >= 9;

        if (labelShouldBeNormallyVisible) {
            if (!this.map.hasLayer(this.labelMarker)) {
                this.labelMarker.addTo(this.map);
            }
            // Wenn das Label aufgrund des Zooms normal sichtbar sein sollte,
            // ist es nicht mehr "temporär durch Hover sichtbar".
            this._labelTemporarilyVisibleByHover = false;
        } else {
            // Wenn Zoom < 9:
            // Label nur entfernen, wenn es NICHT temporär durch Hover sichtbar ist.
            // Wenn es temporär durch Hover sichtbar ist, wird mouseout vom Polygon es entfernen.
            if (!this._labelTemporarilyVisibleByHover && this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
        }
    }

    addToMap() {
        // Diese Methode wird von den Unterklassen aufgerufen, NACHDEM sie ihr Layer erstellt haben.
        if (this._shouldHaveLabel()) {
            this._initializeLabel(); // Erstellt this.labelMarker

            // Füge Listener zum Polygon-Layer hinzu, um das Label zu steuern und Klicks zu behandeln
            if (this.layer) { // this.labelMarker Existenz wird in den Handlern geprüft
                this.layer.on('mouseover', this._boundPolygonMouseoverForLabel);
                this.layer.on('mouseout', this._boundPolygonMouseoutForLabel);
                this.layer.on('click', this._boundPolygonClick);
            }
        }
    }

    removeFromMap() {
        if (this.layer) {
            // Entferne die in AirspacePolygon.addToMap hinzugefügten Listener
            if (this._shouldHaveLabel()) { // labelMarker Existenz nicht mehr nötig hier zu prüfen
                this.layer.off('mouseover', this._boundPolygonMouseoverForLabel);
                this.layer.off('mouseout', this._boundPolygonMouseoutForLabel);
                this.layer.off('click', this._boundPolygonClick);
            }

            if (this.map && this.map.hasLayer(this.layer)) {
                this.map.removeLayer(this.layer);
            }
            this.layer = null;
        }

        // Label und zugehörige Listener entfernen, falls vorhanden
        if (this._shouldHaveLabel()) { // Prüft, ob diese Instanz ein Label haben sollte
            if (this.labelMarker) {
                if (this.map && this.map.hasLayer(this.labelMarker)) {
                    this.map.removeLayer(this.labelMarker);
                }
                this.labelMarker = null;
            }
            // Den Zoom-Event-Listener entfernen
            if (this.map && this._boundUpdateLabelVisibility) {
                this.map.off('zoomend', this._boundUpdateLabelVisibility);
            }
        }
    }

    showInfoPdf(pdfId) {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="airspaceInfoCard"">
                    <button onclick="currentAirspace.closeInfoPdf()" class="closeButton" style="position: absolute; right: 10px; top: 10px; z-index: 1000;">X</button>
                    <iframe 
                        id="pdfIframe" 
                        src="https://aip.dfs.de/IFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=155" 
                        frameborder="0"
                        style="width: 100%; height: 100%;">
                    </iframe>
                </div>
            </div>
        `;
    }

    setAipInfoAirspace(name) {
        return new Promise((resolve) => {
            let id = null;
            if (this instanceof RmzAirspace) {
                rmzInfo.forEach(rmz => {
                    const lowerCaseRmzArray = rmz.RMZ.map(item => item.toLowerCase());
                    if (lowerCaseRmzArray.includes(name.toLowerCase())) {
                        id = rmz.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof CtrAirspace) {
                ctrInfo.forEach(ctr => {
                    const lowerCaseCtrArray = ctr.CTRs.map(item => item.toLowerCase());
                    if (lowerCaseCtrArray.includes(name.toLowerCase())) {
                        id = ctr.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof PjeAirspace) {
                const cleanName = name.replace('PJA', '').trim();
                console.log(cleanName);

                pjeInfo.forEach(pje => {
                    const lowerCasePjeArray = pje.PJE.map(item => item.toLowerCase());
                    if (lowerCasePjeArray.includes(cleanName.toLowerCase())) {
                        id = pje.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof TmzAirspace) {
                tmzInfo.forEach(tmz => {
                    const lowerCaseRmzArray = tmz.TMZ.map(item => item.toLowerCase());
                    if (lowerCaseRmzArray.includes(name.toLowerCase())) {
                        id = tmz.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof EdrAirspace) {
                const edrPattern = /ED-R\s*(\S+)/;
                const edrMatch = name.match(edrPattern);
                let cleanName = edrMatch && edrMatch[1] ? edrMatch[1] : name;
                edrInfo.forEach(edr => {
                    const lowerCaseEdrArray = edr["ED-R"].map(item => item.toLowerCase());
                    if (lowerCaseEdrArray.includes(cleanName.toLowerCase())) {
                        id = edr.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof EddAirspace) {
                const eddPattern = /ED-D\s*(\S+)/;
                const eddMatch = name.match(eddPattern);
                let cleanName = eddMatch && eddMatch[1] ? eddMatch[1] : name;
                eddInfo.forEach(edd => {
                    const lowerCaseEddArray = edd["ED-D"].map(item => item.toLowerCase());
                    if (lowerCaseEddArray.includes(cleanName.toLowerCase())) {
                        id = edd.ID;
                    }
                });
                resolve(id);
            }
            else {
                resolve(null);
            }
        });
    }

    closeInfoPdf() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '0px';
    }

    getStyle() {
        return {};
    }





}
