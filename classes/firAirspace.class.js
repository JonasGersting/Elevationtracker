class FirAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers) {
        super(geometry, name, ident, map, polygonLayers);
        this.labelMarker = null; // Neue Eigenschaft für das Label
    }
    
    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                const center = layer.getBounds().getCenter();
                
                const label = L.divIcon({
                    className: 'fir-label',
                    html: `<div>${this.name}</div>`,
                    iconSize: null
                });
                
                // Speichere die Referenz zum Label-Marker
                this.labelMarker = L.marker(center, {
                    icon: label,
                    interactive: false
                }).addTo(this.map);
            }
        }).addTo(this.map);
    }

    // Überschreibe die removeFromMap Methode
    removeFromMap() {
        if (this.layer) {
            this.layer.remove();
            this.layer = null;
        }
        if (this.labelMarker) {
            this.labelMarker.remove();
            this.labelMarker = null;
        }
    }


    getStyle() {
        return {
            color: 'gray',  // Farbe des Polygons
            weight: 2,     // Randdicke
            opacity: 0.6,  // Randtransparenz
            fillOpacity: 0.2, // Fülltransparenz
            className: 'fir-polygon'        };
    }

}
