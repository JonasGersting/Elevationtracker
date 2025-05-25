class AtzAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                const tooltip = this.returnTooltip(this.name);
                layer.on('mouseover', () => {
                    this.atzHoverOn(tooltip, layer);
                });
                layer.on('mouseout', () => {
                    this.atzHoverOut(layer);
                });
            }
        }).addTo(this.map);
    }

    returnTooltip(name) {
        return L.tooltip({
            permanent: false,
            direction: 'right',
            offset: L.point(20, 0),
            className: 'polygon-label',
        }).setContent(name);
    }

    atzHoverOn(tooltip, layer) {
        isCursorOverPolygon = true;
        layer.bindTooltip(tooltip).openTooltip();
        layer.setStyle({ color: 'white', dashArray: '4 4', fillOpacity: 0.6, fillColor: 'black' });
    }

    atzHoverOut(layer) {
        isCursorOverPolygon = false;
        layer.closeTooltip();
        layer.unbindTooltip();
        layer.setStyle(this.getStyle());
    }

    getStyle() {
        return {
            color: 'black',
            weight: 2,
            opacity: 1,
            dashArray: '4 4',
            fillOpacity: 0
        };
    }
}
