class RmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers) {
        super(geometry, name, ident, map, polygonLayers);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                const tooltip = L.tooltip({
                    permanent: false,
                    direction: 'right',
                    offset: L.point(20, 0),
                    className: 'polygon-label',
                }).setContent(this.name);

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    if (!polygonIsBroughtUpToFront) {
                        this.handlePolygonOverlap(this.geometry);
                    }
                    layer.bindTooltip(tooltip).openTooltip();
                    layer.setStyle({ color: 'white', dashArray: '4 4', opacity: 1, fillOpacity: 0.6, fillColor: 'gray' }); // Weiße gestrichelte Linie beim Hover
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;  // Setze den globalen Zustand zurück
                    layer.closeTooltip();
                    layer.unbindTooltip(); // Verbindung lösen
                    layer.setStyle(this.getStyle()); // Stil zurücksetzen
                });

                layer.on('click', async () => {
                    currentAirspace = this;
                    const id = await this.setAipInfoAirspace(this.name);
                    if (id) {
                        this.showInfoPdf(id);
                    } else {
                        console.log('No PDF ID found for:', this.name);
                    }
                });
            }
        }).addTo(this.map);
    }

    getStyle() {
        return {
            color: 'gray',      // Farbe des Randes
            weight: 2,          // Dicke des Randes
            opacity: 0.6,       // Transparenz des Randes
            dashArray: '4 4',   // Muster für gestrichelte Linien
            fillOpacity: 0      // Innenbereich vollständig transparent
        };
    }
}
