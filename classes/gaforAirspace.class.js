class GaforAirspace extends AirspacePolygon {
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
                    className: 'gaforArea',
                }).openTooltip()
                

                layer.on('mouseover', () => {
                    isCursorOverPolygon = true;
                    layer.setStyle({fillColor: 'white', fillOpacity: 0.8});
                });

                layer.on('mouseout', () => {
                    isCursorOverPolygon = false;  // Setze den globalen Zustand zurück
                    layer.setStyle({fillColor: 'lightblue', fillOpacity: 0.5});
                });

                layer.on('click', () => {
                    const inputField = document.getElementById('gaforNumbers');
                    // Hole den aktuellen Wert im Input-Feld
                    const currentValue = inputField.value.trim();
                    // Überprüfen, ob bereits ein Wert im Input-Feld existiert, dann füge den neuen Wert hinzu, wenn er noch nicht da ist
                    if (currentValue) {
                        inputField.value = currentValue + ' ' + this.name; // Füge den Namen hinzu (mit einem Leerzeichen getrennt)
                    } else {
                        inputField.value = this.name; // Wenn kein Wert da ist, setze den Namen als Wert
                    }
                });
                
            }
        }).addTo(this.map);
    }

  


    getStyle() {
        return {
            color: 'lightblue',  // Farbe des Polygons
            weight: 2,     // Randdicke
            opacity: 1,  // Randtransparenz
            fillOpacity: 0.5 // Fülltransparenz
        };
    }

}
