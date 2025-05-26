class RoadLink{
    constructor(type, startRoad, endRoad) {
        this.type = type;
        this.startRoad = startRoad;
        this.endRoad = endRoad;
        this.laneLinks = [];
    }
    addLaneLink(startLaneIndex, endLaneIndex, points) {
        const laneLink = new LaneLink(startLaneIndex, endLaneIndex, points);
        this.laneLinks.push(laneLink);
        console.log("added laneLink", laneLink);
    }

}

export default RoadLink;
import LaneLink from './lanelink.js';