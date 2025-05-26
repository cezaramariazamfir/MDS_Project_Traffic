class Intersection {

    constructor(id, x, y, width = null, roads = [], virtual = true) {
        this.id = id;
        this.point = { x, y };
        this.width = width;
        this.roads = roads; 
        this.roadLinks = []; 
        this.trafficLight = {
      lightphases: [
        { time: 30, availableRoadLinks: [0, 1] },
        { time: 30, availableRoadLinks: [2] }
      ]};
        this.virtual = virtual;
    }

    addRoad(road) {
        this.roads.push(road);
    }

    addRoadLink(roadLink) {
        this.roadLinks.push(roadLink);
    }
}

export default Intersection;