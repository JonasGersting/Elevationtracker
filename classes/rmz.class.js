class RmzAirspace extends AirspacePolygon {
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
        super(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit);
        this.labelHighlightColor = 'dimgray';
        this.labelHighlightTextColor = 'white';
    }

    attachRmzEventHandlers(layer) {
        layer.on('mouseover', () => {
            this.rmzHover(layer);
        });
        layer.on('mouseout', () => {
            this.rmzHoverOut(layer);
        });
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => this.attachRmzEventHandlers(layer)
        }).addTo(this.map);
        super.addToMap();
    }

    rmzHover(layer) {
        isCursorOverPolygon = true;
        layer.setStyle(this.getSpecificHoverStyle());
        layer.bringToFront();
    }

    rmzHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.setStyle(this.getStyle());
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
     getPolygonStyleForLabelHover() {
        return this.getSpecificHoverStyle();
    }
}