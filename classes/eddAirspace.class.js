class EddAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon);
        this.centerLat = centerLat;
        this.centerLon = centerLon;
        this.labelMarker = null;
        this._boundUpdateLabelVisibility = this._updateLabelVisibility.bind(this);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                // Tooltip entfernt
                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });

                    // Label-Hintergrund bei Polygon-Hover ändern
                    if (this.labelMarker) {
                        const iconElement = this.labelMarker.getElement();
                        if (iconElement) {
                            // Beispiel: Hintergrundfarbe für EDD-Label-Hover
                            iconElement.style.backgroundColor = 'darkorange';
                            iconElement.style.color = 'white';
                        }
                    }
                    const currentZoom = this.map.getZoom();
                    if (currentZoom < 10) {
                        if (!this.map.hasLayer(this.labelMarker)) {
                            this.labelMarker.addTo(this.map);
                        }
                    }
                });
                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;
                    layer.setStyle({ fillColor: 'orange', fillOpacity: 0.2 });

                    // Label-Hintergrund bei Polygon-Mouseout zurücksetzen
                    if (this.labelMarker) {
                        const iconElement = this.labelMarker.getElement();
                        if (iconElement) {
                            iconElement.style.backgroundColor = '';
                            iconElement.style.color = '';
                        }
                    }
                    const currentZoom = this.map.getZoom();
                    if (currentZoom < 10) {
                        if (this.map.hasLayer(this.labelMarker)) {
                            this.map.removeLayer(this.labelMarker);
                        }
                    }
                });
                layer.on('click', async () => {
                    currentAirspace = this;
                    const id = await this.setAipInfoAirspace(this.ident);
                    if (id) {
                        this.showInfoPdf(id);
                    } else {
                        console.log('No PDF ID found for:', this.ident); // Geändert von this.name zu this.ident
                    }
                });
            }
        }).addTo(this.map);

        // Erstellen und Verwalten des benutzerdefinierten Div-Labels
        this._createLabelMarker();

        if (this.labelMarker) {
            this._updateLabelVisibility(); // Initiale Sichtbarkeit festlegen
            this.map.on('zoomend', this._boundUpdateLabelVisibility);
        }
    }

    _createLabelMarker() {
        const labelHtml = `
            <div><b>${this.ident}</b></div>
            <div class="edd-label-name" style="display: none;">${this.name || 'N/A'}</div>
        `;

        const divIcon = L.divIcon({
            html: labelHtml,
            className: 'edd-custom-label', // Eigene CSS-Klasse für EDD-Labels
            iconSize: null,
        });

        let markerPosition;
        if (this.centerLat !== undefined && this.centerLon !== undefined) {
            markerPosition = L.latLng(this.centerLat, this.centerLon);
        } else {
            console.log(this.centerLat, this.centerLon);
            
            console.warn(`Zentrum für EDD-Label ${this.ident} nicht übergeben. Versuch, aus Geometrie zu ermitteln.`);
            try {
                markerPosition = this.layer.getBounds().getCenter();
            } catch (e) {
                console.error("Position für EDD-Label konnte nicht bestimmt werden für:", this.ident, ". Label wird nicht erstellt.");
                return;
            }
        }

        if (!markerPosition) {
            console.error("Position für EDD-Label konnte nicht bestimmt werden für:", this.ident, ". Label wird nicht erstellt.");
            return;
        }

        this.labelMarker = L.marker(markerPosition, {
            icon: divIcon,
            pane: 'markerPane',
            interactive: true
        });

        this.labelMarker.on('mouseover', () => {
            if (this.layer) {
                this.layer.bringToFront();
                this.layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });
            }
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                const nameElement = iconElement.querySelector('.edd-label-name');
                if (nameElement) {
                    nameElement.style.display = 'block';
                }
            }
        });

        this.labelMarker.on('mouseout', () => {
            if (this.layer) {
                this.layer.setStyle({ fillColor: 'orange', fillOpacity: 0.2 });
            }
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                const nameElement = iconElement.querySelector('.edd-label-name');
                if (nameElement) {
                    nameElement.style.display = 'none';
                }
            }
        });

        this.labelMarker.on('click', async () => { // Klick-Event für das Label
            currentAirspace = this;
            const id = await this.setAipInfoAirspace(this.ident);
            if (id) {
                this.showInfoPdf(id);
            } else {
                console.log('No PDF ID found for:', this.ident);
            }
        });
    }

    _updateLabelVisibility() {
        if (!this.labelMarker || !this.map) return;

        const currentZoom = this.map.getZoom();
        if (currentZoom >= 10) { // Gleiche Zoomstufe wie bei EDR, anpassbar
            if (!this.map.hasLayer(this.labelMarker)) {
                this.labelMarker.addTo(this.map);
            }
        } else {
            if (this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
        }
    }

    getStyle() {
        return {
            color: 'orange',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
            // zIndexOffset: 401 // Optional, falls eine andere Stapelordnung als EDR gewünscht ist
        };
    }

    remove() {
        if (this.map) {
            if (this.layer) {
                this.map.removeLayer(this.layer);
            }
            if (this.labelMarker) {
                this.map.removeLayer(this.labelMarker);
                this.map.off('zoomend', this._boundUpdateLabelVisibility);
            }
        }
        this.layer = null;
        this.labelMarker = null;

        if (super.remove) {
            super.remove();
        } else if (super.removeFromMap) {
            super.removeFromMap();
        }
    }
}