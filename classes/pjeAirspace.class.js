class PjeAirspace extends AirspacePolygon {
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
                }).setContent(`${this.name}<br>${this.ident}`);

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    if (!polygonIsBroughtUpToFront) {
                        this.handlePolygonOverlap(this.geometry);
                    }
                      // Prüfen auf Überlappung
                    layer.bindTooltip(tooltip).openTooltip();
                    layer.setStyle({fillColor: 'white', fillOpacity: 0.8});
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;  // Setze den globalen Zustand zurück
                    layer.closeTooltip();
                    layer.unbindTooltip(); // Verbindung lösen
                    layer.setStyle({fillColor: 'orange', fillOpacity: 0.2});
                });
            }
        }).addTo(this.map);
    }

  


    getStyle() {
        return {
            color: 'orange',  // Farbe des Polygons
            weight: 2,     // Randdicke
            opacity: 0.6,  // Randtransparenz
            fillOpacity: 0.2 // Fülltransparenz
        };
    }

}
