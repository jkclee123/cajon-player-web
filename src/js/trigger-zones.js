/**
 * TriggerZoneManager - Manages trigger zone definitions, DOM element creation, and zone lookup
 */

class TriggerZoneManager {
    constructor(config) {
        this.zones = config.zones || [];
        this.container = config.container;
        this.cajonImage = config.cajonImage;
        this.zoneElements = new Map(); // Map<zoneId, HTMLElement>
        this.zoneConfigs = new Map(); // Map<zoneId, ZoneConfig>
        this.zoneByElement = new Map(); // Map<HTMLElement, ZoneConfig>
        this.zoneByKey = new Map(); // Map<keyboardKey, ZoneConfig>
        
        // Build lookup maps
        this.zones.forEach(zone => {
            this.zoneConfigs.set(zone.id, zone);
            if (zone.keyboardKey) {
                this.zoneByKey.set(zone.keyboardKey.toLowerCase(), zone);
            }
        });
    }

    /**
     * Creates DOM elements for all trigger zones and adds them to the container
     */
    initialize() {
        if (!this.container) {
            throw new Error('Container element is required');
        }

        this.zones.forEach(zone => {
            const zoneElement = this._createZoneElement(zone);
            this.container.appendChild(zoneElement);
            this.zoneElements.set(zone.id, zoneElement);
            this.zoneByElement.set(zoneElement, zone);
        });
    }

    /**
     * Creates a DOM element for a trigger zone
     * @private
     */
    _createZoneElement(zone) {
        const element = document.createElement('div');
        element.className = 'trigger-zone';
        element.dataset.zoneId = zone.id;
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', zone.name);
        
        // Set position and size based on coordinates
        const coords = zone.coordinates;
        element.style.position = 'absolute';
        element.style.left = `${coords.x}%`;
        element.style.top = `${coords.y}%`;
        element.style.width = `${coords.width}%`;
        element.style.height = `${coords.height}%`;
        
        return element;
    }

    /**
     * Gets zone configuration by ID
     * @param {string} id - Zone identifier
     * @returns {Object|null}
     */
    getZoneById(id) {
        return this.zoneConfigs.get(id) || null;
    }

    /**
     * Gets zone configuration by DOM element
     * @param {HTMLElement} element - Zone DOM element
     * @returns {Object|null}
     */
    getZoneByElement(element) {
        // Check direct mapping
        if (this.zoneByElement.has(element)) {
            return this.zoneByElement.get(element);
        }
        
        // Check if element is a zone element or child of one
        let current = element;
        while (current && current !== this.container) {
            if (current.dataset && current.dataset.zoneId) {
                return this.getZoneById(current.dataset.zoneId);
            }
            current = current.parentElement;
        }
        
        return null;
    }

    /**
     * Gets zone configuration by keyboard key
     * @param {string} key - Keyboard key (e.g., "q", "w")
     * @returns {Object|null}
     */
    getZoneByKey(key) {
        return this.zoneByKey.get(key.toLowerCase()) || null;
    }

    /**
     * Gets all zone configurations
     * @returns {Array<Object>}
     */
    getAllZones() {
        return [...this.zones];
    }

    /**
     * Activates visual feedback for a zone
     * @param {string} zoneId - Zone identifier
     */
    activateZone(zoneId) {
        const element = this.zoneElements.get(zoneId);
        if (element) {
            element.classList.add('active');
            
            // Remove active class after visual feedback duration
            setTimeout(() => {
                element.classList.remove('active');
            }, 100); // 100ms visual feedback
        }
    }
}

