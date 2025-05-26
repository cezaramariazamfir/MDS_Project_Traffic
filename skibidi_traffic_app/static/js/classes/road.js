class Road {
    constructor(id, startIntersection, endIntersection, points) {
        this.id = id; //id strada
        this.startIntersection = startIntersection; //id intrate
        this.endIntersection = endIntersection; //id iesire
        this.points = points;
        this.lanes = [];
    }

    addLane(lane) {
        this.lanes.push(lane);
    }

}

export default Road;