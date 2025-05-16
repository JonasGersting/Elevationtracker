class AirspacePolygon {
    aipInfoAirspace;
    constructor(geometry, name, ident, map, polygonLayers) {
        this.geometry = geometry;
        this.name = name;
        this.ident = ident;
        this.map = map;
        this.layer = null;
        this.polygonLayers = polygonLayers;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.scale = 1;
        this.rotation = 0;
    }

    // handlePolygonOverlap(layerGeometry) {
    //     console.log('handlePolygonOverlap', layerGeometry);

    //     this.polygonLayers.forEach((otherLayer) => {
    //         if (otherLayer instanceof EdrAirspace && otherLayer.name !== this.name) {
    //             if (this.isPolygonOverlapping(layerGeometry, otherLayer.geometry.coordinates[0])) {
    //                 polygonIsBroughtUpToFront = true;
    //                 otherLayer.layer.bringToFront(); 
    //             }
    //         }
    //     });
    // }

    // isPolygonOverlapping(currentPolygon, otherPolygon) {
    //     const currentFeature = {
    //         type: "Feature",
    //         geometry: currentPolygon,
    //         properties: {}
    //     };
    //     const otherFeature = {
    //         type: "Feature",
    //         geometry: {
    //             type: "Polygon",
    //             coordinates: otherPolygon
    //         },
    //         properties: {}
    //     };
    //     const isEnclosed = turf.booleanContains(currentFeature, otherFeature);
    //     return isEnclosed;
    // }

    removeFromMap() {
        if (this.layer) {
            this.layer.remove();
            this.layer = null;
        }
    }

    showInfoPdf(pdfId) {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="airspaceInfoCard"">
                    <button onclick="currentAirspace.closeInfoPdf()" class="closeButton" style="position: absolute; right: 10px; top: 10px; z-index: 1000;">X</button>
                    <iframe 
                        id="pdfIframe" 
                        src="https://aip.dfs.de/IFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=155" 
                        frameborder="0"
                        style="width: 100%; height: 100%;">
                    </iframe>
                </div>
            </div>
        `;
    }

    setAipInfoAirspace(name) {
        return new Promise((resolve) => {
            let id = null;
            if (this instanceof RmzAirspace) {
                rmzInfo.forEach(rmz => {
                    const lowerCaseRmzArray = rmz.RMZ.map(item => item.toLowerCase());
                    if (lowerCaseRmzArray.includes(name.toLowerCase())) {
                        id = rmz.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof CtrAirspace) {
                ctrInfo.forEach(ctr => {
                    const lowerCaseCtrArray = ctr.CTRs.map(item => item.toLowerCase());
                    if (lowerCaseCtrArray.includes(name.toLowerCase())) {
                        id = ctr.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof PjeAirspace) {
                const cleanName = name.replace('PJA', '').trim();
                console.log(cleanName);

                pjeInfo.forEach(pje => {
                    const lowerCasePjeArray = pje.PJE.map(item => item.toLowerCase());
                    if (lowerCasePjeArray.includes(cleanName.toLowerCase())) {
                        id = pje.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof TmzAirspace) {
                tmzInfo.forEach(tmz => {
                    const lowerCaseRmzArray = tmz.TMZ.map(item => item.toLowerCase());
                    if (lowerCaseRmzArray.includes(name.toLowerCase())) {
                        id = tmz.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof EdrAirspace) {
                const edrPattern = /ED-R\s*(\S+)/;
                const edrMatch = name.match(edrPattern);
                let cleanName = edrMatch && edrMatch[1] ? edrMatch[1] : name;
                edrInfo.forEach(edr => {
                    const lowerCaseEdrArray = edr["ED-R"].map(item => item.toLowerCase());
                    if (lowerCaseEdrArray.includes(cleanName.toLowerCase())) {
                        id = edr.ID;
                    }
                });
                resolve(id);
            } else if (this instanceof EddAirspace) {
                const eddPattern = /ED-D\s*(\S+)/;
                const eddMatch = name.match(eddPattern);
                let cleanName = eddMatch && eddMatch[1] ? eddMatch[1] : name;
                eddInfo.forEach(edd => {
                    const lowerCaseEddArray = edd["ED-D"].map(item => item.toLowerCase());
                    if (lowerCaseEddArray.includes(cleanName.toLowerCase())) {
                        id = edd.ID;
                    }
                });
                resolve(id);
            }
            else {
                resolve(null);
            }
        });
    }

    closeInfoPdf() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        detailDiv.style.height = '0px';
    }

    getStyle() {
        return {};
    }





}
