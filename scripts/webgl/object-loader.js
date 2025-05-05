import { triangleVertices } from '../shapes/triangle.js';
import { fVertices } from '../shapes/3df.js';
import { ObjectType } from './utils/constants.js';

export class ObjectLoader {

    constructor(objectManager) {
        this.objectManager = objectManager;        
    }

    loadGameObjects() {
        this.objectManager.loadObject("triangle", triangleVertices, ObjectType.TWO_D);
        this.objectManager.loadObject("3df", fVertices, ObjectType.THREE_D);
    }
};