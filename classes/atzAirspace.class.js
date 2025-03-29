class AtzAirspace extends AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        super(geometry, name, map, polygonLayers);
    }

    addToMap() {
        this.layer = L.geoJSON(this.geometry, {
            style: this.getStyle(),
            onEachFeature: (feature, layer) => {
                const tooltip = L.tooltip({
                    permanent: false,       // Tooltip erscheint nur bei Hover
                    direction: 'right',     // Richtung des Tooltips
                    offset: L.point(20, 0), // Offset für bessere Platzierung
                    className: 'polygon-label',
                }).setContent(this.name);

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    layer.bindTooltip(tooltip).openTooltip(); // Tooltip beim Hover öffnen
                    layer.setStyle({ color: 'white', dashArray: '4 4', fillOpacity: 0.6, fillColor: 'black' }); // Weiß gestrichelte Linie beim Hover
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false; // Zustand zurücksetzen
                    layer.closeTooltip();        // Tooltip schließen
                    layer.unbindTooltip();       // Tooltip-Verbindung lösen
                    layer.setStyle(this.getStyle()); // Ursprünglicher Stil
                });
            }
        }).addTo(this.map);
    }

    getStyle() {
        return {
            color: 'black',    // Schwarz gestrichelte Linie
            weight: 2,         // Dicke des Randes
            opacity: 1,        // Transparenz des Randes
            dashArray: '4 4',  // Gestricheltes Muster
            fillOpacity: 0     // Innenbereich vollständig transparent
        };
    }
}
