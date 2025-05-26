class LaneLink {
    constructor(startIndex, endIndex, points = []) {
        this.startLaneIndex = startIndex;
        this.endLaneIndex = endIndex;
        this.points = points;
    }
}

export default LaneLink;