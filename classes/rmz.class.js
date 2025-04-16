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
                    layer.setStyle({ color: 'white', dashArray: '4 4', opacity: 1, fillOpacity: 0.6, fillColor: 'gray' });
                });
                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;
                    layer.closeTooltip();
                    layer.unbindTooltip();
                    layer.setStyle(this.getStyle());
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
            color: 'gray',      
            weight: 2,          
            opacity: 0.6,      
            dashArray: '4 4',   
            fillOpacity: 0      
        };
    }
}
