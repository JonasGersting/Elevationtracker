class RmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'dimgray';
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
        return { color: 'white', dashArray: '4 4', opacity: 1, fillOpacity: 0.6, fillColor: 'gray' };
    }

    getStyle() {
        return {
            color: 'gray',
            fillColor: 'gray',
            weight: 2,
            opacity: 0.6,
            dashArray: '4 4',
            fillOpacity: 0
        };
    }
}