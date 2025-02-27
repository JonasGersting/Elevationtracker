// Basisklasse für Airspace-Polygone
class AirspacePolygon {
    constructor(geometry, name, map, polygonLayers) {
        this.geometry = geometry;
        this.name = name;
        this.map = map;
        this.layer = null; // Platzhalter für den Polygon-Layer
        this.polygonLayers = polygonLayers; // Referenz auf das spezifische polygonLayers-Array

        //pdf viewer properties
        this.pdfDoc = null;
        this.pageNum = 1;
        this.scale = 1;
        this.rotation = 0;
    }

    handlePolygonOverlap(layerGeometry) {
        // Überprüfe andere Instanzen der EdrAirspace-Klasse
        this.polygonLayers.forEach((otherLayer) => {
            if (otherLayer instanceof EdrAirspace && otherLayer.name !== this.name) {
                if (this.isPolygonOverlapping(layerGeometry, otherLayer.geometry.coordinates)) {
                    polygonIsBroughtUpToFront = true;
                    otherLayer.layer.bringToFront(); // Überlappende Polygone nach vorne bringen
                }
            }
        });
    }

    isPolygonOverlapping(currentPolygon, otherPolygon) {
        const currentFeature = {
            type: "Feature",
            geometry: currentPolygon,
            properties: {}
        };

        const otherFeature = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: otherPolygon
            },
            properties: {}
        };

        // Prüfen auf Überschneidung oder Umschließung
        const isEnclosed = turf.booleanContains(currentFeature, otherFeature);
        // const hasIntersection = turf.intersect(currentFeature, otherFeature);

        return isEnclosed; // True, wenn Umschlossen oder Überschneidung
    }

    // Methode zum Entfernen des Polygons von der Karte
    removeFromMap() {
        if (this.layer) {
            this.layer.remove();
            this.layer = null;
        }
    }

    // Überschreiben in spezifischen Klassen
    getStyle() {
        return {}; // Standardstil
    }





}
