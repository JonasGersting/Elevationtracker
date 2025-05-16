class EdrAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon);
        this.centerLat = centerLat; // Speichern für spätere Verwendung
        this.centerLon = centerLon; // Speichern für spätere Verwendung
        this.labelMarker = null; // Marker für das Text-Label
        // Binden des Kontexts für den Event-Handler, um 'this' korrekt zu verwenden
        this._boundUpdateLabelVisibility = this._updateLabelVisibility.bind(this);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                // Tooltip-Erstellung und -Bindung entfernt
                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    // if (!polygonIsBroughtUpToFront) {
                    //     this.handlePolygonOverlap(this.geometry);
                    // }
                    // layer.bindTooltip(tooltip).openTooltip(); // Entfernt
                    layer.setStyle({ fillColor: 'white', fillOpacity: 0.8 });

                    // Label-Hintergrund bei Polygon-Hover ändern
                    if (this.labelMarker) {
                        const iconElement = this.labelMarker.getElement();
                        if (iconElement) {
                            iconElement.style.backgroundColor = 'darkred';
                            iconElement.style.color = 'white'; // Textfarbe ändern
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
                    // layer.closeTooltip(); // Entfernt
                    // layer.unbindTooltip(); // Entfernt
                    layer.setStyle({ fillColor: 'red', fillOpacity: 0.2 });

                    // Label-Hintergrund bei Polygon-Mouseout zurücksetzen
                    if (this.labelMarker) {
                        const iconElement = this.labelMarker.getElement();
                        if (iconElement) {
                            // Entfernt den inline-Style, sodass die CSS-Klasse wieder greift
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
                        console.log('No PDF ID found for:', this.ident);
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
        // HTML-Struktur, die sowohl Ident als auch den (initial ausgeblendeten) Namen enthält
        const labelHtml = `
            <div><b>${this.ident}</b></div>
            <div class="edr-label-name" style="display: none;">${this.name || 'N/A'}</div>
        `;

        const divIcon = L.divIcon({
            html: labelHtml,
            className: 'edr-custom-label',
            iconSize: null,
        });

        let markerPosition;
        if (this.centerLat !== undefined && this.centerLon !== undefined) {
            markerPosition = L.latLng(this.centerLat, this.centerLon);
        } else {
            console.warn(`Zentrum für EDR-Label ${this.ident} nicht übergeben. Versuch, aus Geometrie zu ermitteln.`);
            try {
                markerPosition = this.layer.getBounds().getCenter();
            } catch (e) {
                console.error("Position für EDR-Label konnte nicht bestimmt werden für:", this.ident, ". Label wird nicht erstellt.");
                return;
            }
        }

        if (!markerPosition) {
            console.error("Position für EDR-Label konnte nicht bestimmt werden für:", this.ident, ". Label wird nicht erstellt.");
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
            // Namensteil einblenden
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                const nameElement = iconElement.querySelector('.edr-label-name');
                if (nameElement) {
                    nameElement.style.display = 'block'; // Oder 'inline', je nach gewünschtem Layout
                }
            }
        });

        this.labelMarker.on('mouseout', () => {
            if (this.layer) {
                this.layer.setStyle({ fillColor: 'red', fillOpacity: 0.2 });
            }
            // Namensteil ausblenden
            const iconElement = this.labelMarker.getElement();
            if (iconElement) {
                const nameElement = iconElement.querySelector('.edr-label-name');
                if (nameElement) {
                    nameElement.style.display = 'none';
                }
            }
        });

        this.labelMarker.on('click', async () => {
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
        if (currentZoom >= 10) {
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
            color: 'red',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
            zIndexOffset: 402
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