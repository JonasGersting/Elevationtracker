class TmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'navy'; // Spezifische Highlight-Farbe für TMZ
        this.labelHighlightTextColor = 'white';
    }

    addToMap() {
        const onFeature = (feature, layer) => {
            layer.on('mouseover', () => {
                isCursorOverPolygon = true;
                layer.setStyle(this.getSpecificHoverStyle());
                layer.bringToFront();
            });

            layer.on('mouseout', () => {
                isCursorOverPolygon = false;
                layer.setStyle(this.getStyle());
            });
        };

        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: onFeature
        }).addTo(this.map);

        super.addToMap();
    }

    getSpecificHoverStyle() {
        return { color: 'white', dashArray: '4 4', fillOpacity: 0.6, fillColor: 'darkblue' };
    }




    

    getStyle() {
        return {
            color: 'darkblue',
            fillColor: 'darkblue', // Füllfarbe für den Normalzustand (auch wenn fillOpacity 0 ist)
            weight: 2,
            opacity: 1,
            dashArray: '4 4',
            fillOpacity: 0 // TMZ ist oft nur ein Rahmen
        };
    }
}