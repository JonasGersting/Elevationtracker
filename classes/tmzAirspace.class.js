class TmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident,  map, polygonLayers) {
        super(geometry, name, ident, map, polygonLayers);
    }

    
    
    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(this.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'polygon-label',
                }).openTooltip()
                

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    layer.setStyle({fillColor: 'white', fillOpacity: 0.8});
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;  // Setze den globalen Zustand zurück
                    layer.setStyle({fillColor: 'yellow', fillOpacity: 0.5});
                });
            }
        }).addTo(this.map);
    }

  


    getStyle() {
        return {
            color: 'yellow',  // Farbe des Polygons
            weight: 2,     // Randdicke
            opacity: 1,  // Randtransparenz
            fillOpacity: 0.5 // Fülltransparenz
        };
    }

}
