// Klasse für FIS Airspace
class FisAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
    }

     // Methode zum Hinzufügen des Polygons zur Karte
     addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(this.name, {
                    permanent: true,
                    direction: 'center',
                    className: 'polygon-label',
                }).openTooltip();
            }
        }).addTo(this.map);
    }


    getStyle() {
        return {
            color: 'blue', // Farbe des Polygons
            weight: 2,     // Randdicke
            opacity: 0.6,  // Randtransparenz
            fillOpacity: 0.2 // Fülltransparenz
        };
    }
}