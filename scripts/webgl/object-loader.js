import { triangleVertices } from '../shapes/triangle.js';

export class ObjectLoader {

    constructor(objectManager) {
        this.objectManager = objectManager;        
    }

    loadGameObjects() {
        this.objectManager.loadObject("triangle", triangleVertices);
    }
};