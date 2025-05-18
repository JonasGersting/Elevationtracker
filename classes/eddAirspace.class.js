class EddAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'darkorange'; // Spezifische Highlight-Farbe für EDD
        this.labelHighlightTextColor = 'white';
    }

   addToMap() {
        const onFeature = (feature, layer) => {
            layer.on('mouseover', () => {
                isCursorOverPolygon = true;
                layer.setStyle(this.getSpecificHoverStyle());
                layer.bringToFront();
                // Die Label-Interaktion (Farbe, zIndex, temporäre Sichtbarkeit)
                // wird jetzt durch _boundPolygonMouseoverForLabel in AirspacePolygon gehandhabt.
            });

            layer.on('mouseout', () => {
                isCursorOverPolygon = false;
                layer.setStyle(this.getStyle());
                // Die Label-Interaktion (Farbe, zIndex, temporäre Sichtbarkeit)
                // wird jetzt durch _boundPolygonMouseoutForLabel in AirspacePolygon gehandhabt.
            });

            // Der Klick-Handler wurde in die AirspacePolygon-Klasse verschoben (_boundPolygonClick)
        };

        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: onFeature
        }).addTo(this.map);

        super.addToMap(); // Ruft Label-Initialisierung und zentrale Listener-Bindung in der Basisklasse auf
    }

    getSpecificHoverStyle() {
        return { fillColor: 'white', fillOpacity: 0.8 };
    }



   
    getStyle() {
        return {
            color: 'orange',
            fillColor: 'orange', // Füllfarbe für den Normalzustand
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
            // zIndexOffset: 401 // Optional, falls eine andere Stapelordnung als EDR gewünscht ist
        };
    }


}