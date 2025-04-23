class FisAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
    }

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
            color: 'blue', 
            weight: 2,   
            opacity: 0.6,  
            fillOpacity: 0.2 
        };
    }
}