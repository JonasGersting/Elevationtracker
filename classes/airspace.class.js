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

    async initializePdfViewer() {
        let url = 'adInfoTest/Gehalt_Februar.pdf';
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        try {
            this.pdfDoc = await pdfjsLib.getDocument(url).promise;
            this.renderPage(this.pageNum);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }

    renderPage(num) {
        const canvas = document.getElementById('pdf-render');
        const ctx = canvas.getContext('2d');

        this.pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({ scale: this.scale, rotation: this.rotation });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            };
            page.render(renderContext);
        });
    }

    setupPdfControls() {
        const zoomInButton = document.getElementById('zoom-in');
        const zoomOutButton = document.getElementById('zoom-out');
        const rotateButton = document.getElementById('rotate');
        const container = document.getElementById('canvas-container');

        // Zoom-In
        zoomInButton.addEventListener('click', () => {
            this.scale += 0.2;
            this.renderPage(this.pageNum);
        });

        // Zoom-Out
        zoomOutButton.addEventListener('click', () => {
            if (this.scale > 0.2) {
                this.scale -= 0.2;
                this.renderPage(this.pageNum);
            }
        });

        // Rotate
        rotateButton.addEventListener('click', () => {
            this.rotation = (this.rotation + 90) % 360;
            this.renderPage(this.pageNum);
        });

        // Dragging
        let isDragging = false;
        let startX, startY;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - container.offsetLeft;
            startY = e.pageY - container.offsetTop;
        });

        container.addEventListener('mousemove', (e) => {
            if (isDragging) {
                container.scrollLeft -= e.movementX;
                container.scrollTop -= e.movementY;
            }
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        // Scroll-Zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomStep = 0.1;

            if (e.deltaY < 0) {
                this.scale += zoomStep;
            } else if (e.deltaY > 0 && this.scale > 0.2) {
                this.scale -= zoomStep;
            }

            this.renderPage(this.pageNum);
        });
    }

    loadPdf(url) {
        this.initializePdfViewer(url);
        this.setupPdfControls();
    }




}
