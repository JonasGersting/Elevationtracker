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
                    // if (!polygonIsBroughtUpToFront) {
                    //     this.handlePolygonOverlap(this.geometry);
                    // }
                    layer.bindTooltip(tooltip).openTooltip();
                    layer.setStyle({fillColor: 'white', fillOpacity: 0.8});
                });
                layer.on('mouseout', () => {
                    isCursorOverPolygon = false; 
                    layer.closeTooltip();
                    layer.unbindTooltip(); 
                    layer.setStyle({fillColor: 'orange', fillOpacity: 0.2});
                });
                layer.on('click', async () => {
                    currentAirspace = this;
                    const id = await this.setAipInfoAirspace(this.ident);
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
            color: 'darkorange',  
            weight: 2,     
            opacity: 1,  
            dashArray: '4 4',
            fillOpacity: 0.2 
        };
    }
}
