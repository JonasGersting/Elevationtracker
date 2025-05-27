class AirspacePolygon {
    aipInfoAirspace;
    constructor(geometry, name, ident, map, polygonLayers, centerLat, centerLon, lowerLimit, lowerLimitUnit, upperLimit, upperLimitUnit) {
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
        this.centerLat = centerLat;
        this.centerLon = centerLon;
        this.lowerLimit = lowerLimit;
        this.lowerLimitUnit = lowerLimitUnit;
        this.upperLimit = upperLimit;
        this.upperLimitUnit = upperLimitUnit;
        this.labelMarker = null;
        this.labelHighlightColor = 'darkgrey';
        this.labelHighlightTextColor = 'white';
        this.boundUpdateLabelVisibility = this.updateLabelVisibility.bind(this);
        this.labelTemporarilyVisibleByHover = false;
        this.boundPolygonMouseoverForLabel = this.onPolygonMouseoverForLabel.bind(this);
        this.boundPolygonMouseoutForLabel = this.onPolygonMouseoutForLabel.bind(this);
        this.boundPolygonClick = this.onPolygonClick.bind(this);
    }

    shouldHaveLabel() {
        return this instanceof EdrAirspace ||
            this instanceof EddAirspace ||
            this instanceof CtrAirspace ||
            this instanceof RmzAirspace ||
            this instanceof TmzAirspace;
    }

    initializeLabel() {
        if (!this.map) return;
        this.createLabelMarker();
        if (this.labelMarker) {
            this.updateLabelVisibility();
            this.map.on('zoomend', this.boundUpdateLabelVisibility);
        }
    }

    ensureLabelCenterCoordinates() {
        if (this.centerLat && this.centerLon) return true;
        if (!this.layer) {
            return false;
        }
        try {
            const bounds = this.layer.getBounds();
            if (!bounds.isValid()) {
                return false;
            }
            const center = bounds.getCenter();
            this.centerLat = center.lat;
            this.centerLon = center.lng;
            return true;
        } catch (e) {
            return false;
        }
    }

    getLimitsDisplayHtml() {
        const lowerDisplay = (this.lowerLimit === 0 || this.lowerLimit === "0") ? "GND" : `${this.lowerLimit} ${this.lowerLimitUnit}`;
        return `
            <span style="border-bottom: 1px solid #555; display: inline-block; margin-bottom: 2px; padding-bottom: 1px;">${this.upperLimit} ${this.upperLimitUnit}</span><br>
            <span style="display: inline-block; margin-top: 1px;">${lowerDisplay}</span>`;
    }

    getLabelPrimaryAndSecondaryDisplay() {
        let primaryDisplay = '';
        let secondaryDisplayHtml = '';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            primaryDisplay = this.ident || 'N/A';
            if (this.name && this.name !== primaryDisplay) {
                secondaryDisplayHtml = `<div class="airspace-label-name" style="display: none; margin-top: 3px; font-weight: normal;">${this.name}</div>`;
            }
        } else if (this instanceof CtrAirspace || this instanceof RmzAirspace || this instanceof TmzAirspace) {
            primaryDisplay = this.name || this.ident || 'N/A';
        } else {
            primaryDisplay = this.ident || this.name || 'N/A';
        }
        return { primaryDisplay, secondaryDisplayHtml };
    }

    buildFinalLabelHtml(primaryDisplay, limitsHtml, secondaryDisplayHtml) {
        return `
            <div style="line-height: 1.2;">
                <b>${primaryDisplay}</b><br>
                ${limitsHtml}
            </div>
            ${secondaryDisplayHtml}
        `;
    }

    createLeafletDivIcon(htmlContent) {
        return L.divIcon({
            html: htmlContent,
            className: 'airspace-custom-label text-shadow',
            iconSize: null,
        });
    }

    createLeafletLabelMarkerInstance(position, icon) {
        return L.marker(position, {
            icon: icon,
            pane: 'markerPane',
            interactive: true
        });
    }

    getPolygonStyleForLabelHover() {
        // Standard-Hover-Stil für das Polygon, wenn über das Label gehovert wird
        return { fillColor: 'white', fillOpacity: 0.8 };
    }

    handleLabelMouseover(event) {
        const iconElement = event.target.getElement();
        if (!iconElement) return;
        iconElement.classList.remove('text-shadow');
        iconElement.style.backgroundColor = this.labelHighlightColor;
        iconElement.style.color = this.labelHighlightTextColor;
        iconElement.style.zIndex = '1000';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            const nameEl = iconElement.querySelector('.airspace-label-name');
            if (nameEl) nameEl.style.display = 'block';
        }
        if (this.layer) {
            this.layer.setStyle(this.getPolygonStyleForLabelHover()); // Geänderte Zeile
            this.layer.bringToFront();
        }
    }

    handleLabelMouseout(event) {
        const iconElement = event.target.getElement();
        if (!iconElement) return;
        iconElement.classList.add('text-shadow');
        iconElement.style.backgroundColor = '';
        iconElement.style.color = '';
        iconElement.style.zIndex = '';
        if (this instanceof EdrAirspace || this instanceof EddAirspace) {
            const nameEl = iconElement.querySelector('.airspace-label-name');
            if (nameEl) nameEl.style.display = 'none';
        }
        if (this.layer) this.layer.setStyle(this.getStyle());
    }

    async handleLabelClick() {
        currentAirspace = this;
        const identifierForLookup = (this instanceof EdrAirspace || this instanceof EddAirspace)
            ? this.ident
            : (this.name || this.ident);
        const id = await this.setAipInfoAirspace(identifierForLookup);
        if (id) {
            this.showInfoPdf(id);
        }
    }

    addEventListenersToLabelMarker() {
        this.labelMarker.on('mouseover', this.handleLabelMouseover.bind(this));
        this.labelMarker.on('mouseout', this.handleLabelMouseout.bind(this));
        this.labelMarker.on('click', this.handleLabelClick.bind(this));
    }

    createLabelMarker() {
        if (!this.ensureLabelCenterCoordinates()) return;
        const limitsHtml = this.getLimitsDisplayHtml();
        const { primaryDisplay, secondaryDisplayHtml } = this.getLabelPrimaryAndSecondaryDisplay();
        const labelHtml = this.buildFinalLabelHtml(primaryDisplay, limitsHtml, secondaryDisplayHtml);
        const divIcon = this.createLeafletDivIcon(labelHtml);
        const markerPosition = L.latLng(this.centerLat, this.centerLon);
        this.labelMarker = this.createLeafletLabelMarkerInstance(markerPosition, divIcon);
        this.addEventListenersToLabelMarker();
    }

    styleLabelOnPolygonHover() {
        const iconElement = this.labelMarker.getElement();
        if (!iconElement) return;
        iconElement.style.zIndex = '1000';
        iconElement.style.backgroundColor = this.labelHighlightColor;
        iconElement.style.color = this.labelHighlightTextColor;
        iconElement.classList.remove('text-shadow');
    }

    showLabelTemporarily(currentZoom) {
        if (currentZoom < 9 && !this.map.hasLayer(this.labelMarker)) {
            this.labelMarker.addTo(this.map);
            this.labelTemporarilyVisibleByHover = true;
        }
    }

    onPolygonMouseoverForLabel() {
        if (!this.map || !this.labelMarker) return;
        this.styleLabelOnPolygonHover();
        this.showLabelTemporarily(this.map.getZoom());
    }

    resetLabelStyleAfterPolygonHover() {
        const iconElement = this.labelMarker.getElement();
        if (!iconElement) return;
        iconElement.style.zIndex = '';
        iconElement.style.backgroundColor = '';
        iconElement.style.color = '';
        iconElement.classList.add('text-shadow');
    }

    hideTemporaryLabel() {
        if (this.labelTemporarilyVisibleByHover) {
            if (this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
            this.labelTemporarilyVisibleByHover = false;
        }
    }

    onPolygonMouseoutForLabel() {
        if (!this.map || !this.labelMarker) return;
        this.resetLabelStyleAfterPolygonHover();
        this.hideTemporaryLabel();
    }

    async onPolygonClick() {
        currentAirspace = this;
        const identifier = (this instanceof EdrAirspace || this instanceof EddAirspace)
            ? this.ident
            : (this.name || this.ident);
        if (!identifier) {
            return;
        }
        const id = await this.setAipInfoAirspace(identifier);
        if (id) this.showInfoPdf(id);
    }

    manageLabelLayer(shouldBeVisible) {
        if (shouldBeVisible) {
            if (!this.map.hasLayer(this.labelMarker)) {
                this.labelMarker.addTo(this.map);
            }
            this.labelTemporarilyVisibleByHover = false;
        } else {
            if (!this.labelTemporarilyVisibleByHover && this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
        }
    }

    updateLabelVisibility() {
        if (!this.labelMarker || !this.map) return;
        const currentZoom = this.map.getZoom();
        const labelShouldBeNormallyVisible = currentZoom >= 9;
        this.manageLabelLayer(labelShouldBeNormallyVisible);
    }

    addToMap() {
        if (this.shouldHaveLabel()) {
            this.initializeLabel();
            if (this.layer) {
                this.layer.on('mouseover', this.boundPolygonMouseoverForLabel);
                this.layer.on('mouseout', this.boundPolygonMouseoutForLabel);
                this.layer.on('click', this.boundPolygonClick);
            }
        }
    }

    removePolygonEventListenersFromLayer() {
        if (this.layer && this.shouldHaveLabel()) {
            this.layer.off('mouseover', this.boundPolygonMouseoverForLabel);
            this.layer.off('mouseout', this.boundPolygonMouseoutForLabel);
            this.layer.off('click', this.boundPolygonClick);
        }
    }

    removePolygonLayerFromMap() {
        if (this.layer) {
            if (this.map && this.map.hasLayer(this.layer)) {
                this.map.removeLayer(this.layer);
            }
            this.layer = null;
        }
    }

    removeLabelMarkerFromMapInstance() {
        if (this.labelMarker) {
            if (this.map && this.map.hasLayer(this.labelMarker)) {
                this.map.removeLayer(this.labelMarker);
            }
            this.labelMarker = null;
        }
    }

    removeLabelZoomListener() {
        if (this.map && this.boundUpdateLabelVisibility) {
            this.map.off('zoomend', this.boundUpdateLabelVisibility);
        }
    }

    cleanupLabelResources() {
        if (this.shouldHaveLabel()) {
            this.removeLabelMarkerFromMapInstance();
            this.removeLabelZoomListener();
        }
    }

    removeFromMap() {
        this.removePolygonEventListenersFromLayer();
        this.removePolygonLayerFromMap();
        this.cleanupLabelResources();
    }

    getPdfDetailDiv() {
        return document.getElementById('aerodromeInfoDetail');
    }

    buildPdfViewerHtmlContent(pdfPath) {
        return `
            <div class="overlay"></div>
            <div class="cardWrapper">
                <div class="airspaceInfoCard">
                    <div class="airspaceInfoCardHeader">
                        <h3>${this.name}</h3>
                        <h3>${this.ident || ''}</h3>
                        <button onclick="currentAirspace.closeInfoPdf()" class="closeButton" style="position: absolute; right: 10px; top: 10px; z-index: 1000;">X</button>
                    </div>    
                    <iframe class="border-radius-bottom16" id="pdfIframe" src=${pdfPath} frameborder="0" style="width: 100%; height: 100%;"></iframe>
                </div>
            </div>
        `;
    }

    showInfoPdf(pdfId) {
        const pdfPath = this.returnCorrectAipPath(pdfId);
        const detailDiv = this.getPdfDetailDiv();
        if (!detailDiv) return;
        detailDiv.style.height = '100vh';
        detailDiv.innerHTML = this.buildPdfViewerHtmlContent(pdfPath);
    }

    returnCorrectAipPath(pdfId) {
        const vfrIdents = ['ED-R KIEL', 'ED-R ECKERNFÖRD', 'ED-R HOHE DÜNE'];
        if (vfrIdents.includes(this.ident)) {
            return `https://aip.dfs.de/VFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=page-fit`;
        } else {
            return `https://aip.dfs.de/IFR/scripts/renderPage.php?fmt=pdf&id=${pdfId}#zoom=page-fit`;
        }
    }

    findIdInArray(items, targetName, arrayKey) {
        let foundId = null;
        items.forEach(item => {
            const lowerCaseArray = item[arrayKey].map(val => val.toLowerCase());
            if (lowerCaseArray.includes(targetName.toLowerCase())) {
                foundId = item.ID;
            }
        });
        return foundId;
    }

    findEdrId(name) {
        const edrPattern = /ED-R\s*(.+)/;
        const edrMatch = name.match(edrPattern);
        const cleanName = edrMatch && edrMatch[1] ? edrMatch[1] : name;
        return this.findIdInArray(edrInfo, cleanName, "ED-R");
    }

    findEddId(name) {
        const eddPattern = /ED-D\s*(.+)/;
        const eddMatch = name.match(eddPattern);
        const cleanName = eddMatch && eddMatch[1] ? eddMatch[1] : name;
        return this.findIdInArray(eddInfo, cleanName, "ED-D");
    }

    findPjeId(name) {
        const cleanName = name.replace('PJA', '').trim();
        return this.findIdInArray(pjeInfo, cleanName, "PJE");
    }

    setAipInfoAirspace(name) {
        return new Promise((resolve) => {
            let id = null;
            if (this instanceof RmzAirspace) id = this.findIdInArray(rmzInfo, name, "RMZ");
            else if (this instanceof CtrAirspace) id = this.findIdInArray(ctrInfo, name, "CTRs");
            else if (this instanceof PjeAirspace) id = this.findPjeId(name);
            else if (this instanceof TmzAirspace) id = this.findIdInArray(tmzInfo, name, "TMZ");
            else if (this instanceof EdrAirspace) id = this.findEdrId(name);
            else if (this instanceof EddAirspace) id = this.findEddId(name);
            resolve(id);
        });
    }

    closeInfoPdf() {
        let detailDiv = document.getElementById('aerodromeInfoDetail');
        if (detailDiv) detailDiv.style.height = '0px';
    }

    getStyle() {
        return {};
    }
}
