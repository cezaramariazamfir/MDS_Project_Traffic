export function processIntersectionData(data) {
    console.log("Date primite din formular:");
    console.log(JSON.stringify(data, null, 2)); 

    //citesc latimea intersectiei
    const intersection_width = 0;

    const intersection = new Intersection('main_intersection', 0, 0, intersection_width, [], false);
    //intersectia are centrul in (0,0) si latimea de 100 (pt ca e intersectie adev fac virtual false)
    
    intersection.addRoad('road_north');
    intersection.addRoad('road_south');
    intersection.addRoad('road_east');
    intersection.addRoad('road_west');

    //citesc lungimea fiecarui drum de la inputul userului
    const north_length = data.road_lengths.north;
    const south_length = data.road_lengths.south;
    const east_length = data.road_lengths.east;
    const west_length = data.road_lengths.west;


    const northExit = new Intersection('north_exit', 0, - north_length, 0, ['road_north'], true);
    const southExit = new Intersection('south_exit', 0, south_length, 0, ['road_south'], true);
    const eastExit = new Intersection('east_exit',east_length, 0, 0,  ['road_east'], true);
    const westExit = new Intersection('west_exit', - west_length, 0, 0, ['road_west'], true);



    //DE ADAUGAT LANES 
    const roadNorth = new Road('road_north', 'north_exit', 'main_intersection', 
        [northExit.point, intersection.point]);
    const roadSouth = new Road('road_south', 'main_intersection', 'south_exit',
        [intersection.point, southExit.point]);
    const roadEast = new Road('road_east', 'main_intersection', 'east_exit',
        [intersection.point, eastExit.point]);
    const roadWest = new Road('road_west', 'west_exit', 'main_intersection',
        [westExit.point, intersection.point]);


    

    //adaug roadLinks pt northRoad
    const north_straight = new RoadLink("go_straight", 'road_north', 'road_south');
    const north_left = new RoadLink("turn_left", 'road_north', 'road_east');
    const north_right = new RoadLink("turn_right", 'road_north', 'road_west')


    //adaug roadLinks pt southRoad
    const south_straight = new RoadLink("go_straight", 'road_south', 'road_north');
    const south_left = new RoadLink("turn_left", 'road_south', 'road_west');
    const south_right = new RoadLink("turn_right", 'road_south', 'road_east');


    //adaug roadLinks pt eastRoad
    const east_straight = new RoadLink("go_straight", 'road_east', 'road_west');
    const east_left = new RoadLink("turn_left", 'road_east', 'road_north');
    const east_right = new RoadLink("turn_right", 'road_east', 'road_south');


    //adaug roadLinks pt westRoad
    const west_straight = new RoadLink("go_straight", 'road_west', 'road_east');
    const west_left = new RoadLink("turn_left", 'road_west', 'road_south');
    const west_right = new RoadLink("turn_right", 'road_west', 'road_north');

console.log(Object.keys(intersection)); // vezi ce proprietăți are obiectul
console.log(intersection.roadLinks);   // ar trebui să existe
console.log(intersection.roadLinks);   // vezi dacă există ceva cu „s”


    //DE SCHIMBAT
    const maxSpeed = 50;
    const roadWidth = 10;

    //citesc benzile de la inputul userului
    const northLanes = data.lanes.north;
    northLanes.forEach(lane => {
        if (lane.turn === 'go_straight') {
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            north_straight.addLaneLink(roadNorth.lanes.length - 1, roadSouth.lanes.length - 1, [{x: 0, y: -10}, {x: 0, y: 10}]);
        };
        if (lane.turn === 'turn_left') {
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            north_left.addLaneLink(roadNorth.lanes.length - 1, roadEast.lanes.length - 1, [{x: 0, y: -10}, {x: 10, y: 0}]);
        };
        if (lane.turn === 'turn_right') {
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            north_right.addLaneLink(roadNorth.lanes.length - 1, roadWest.lanes.length - 1, [{x: 0, y: -10}, {x: -10, y: 0}]);
        };
    });


    const southLanes = data.lanes.south;
    southLanes.forEach(lane => {
        if (lane.turn === 'go_straight') {
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            south_straight.addLaneLink(roadSouth.lanes.length - 1, roadNorth.lanes.length - 1, [{x: 0, y: 10}, {x: 0, y: -10}]);
        };
        if (lane.turn === 'turn_left') {
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            south_left.addLaneLink(roadSouth.lanes.length - 1, roadWest.lanes.length - 1, [{x: 0, y: 10}, {x: -10, y: 0}]);
        };
        if (lane.turn === 'turn_right') {
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            south_right.addLaneLink(roadSouth.lanes.length - 1, roadEast.lanes.length - 1, [{x: 0, y: 10}, {x: 10, y: 0}]);
        }
        });

    const eastLanes = data.lanes.east;
    eastLanes.forEach(lane => {
        if (lane.turn === 'go_straight') {
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            east_straight.addLaneLink(roadEast.lanes.length - 1, roadWest.lanes.length - 1, [{x: 10, y: 0}, {x: -10, y: 0}]);
        };
        if (lane.turn === 'turn_left') {
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            east_left.addLaneLink(roadEast.lanes.length - 1, roadNorth.lanes.length - 1, [{x: 10, y: 0}, {x: 0, y: -10}]);
        };
        if (lane.turn === 'turn_right') {
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            east_right.addLaneLink(roadEast.lanes.length - 1, roadSouth.lanes.length - 1, [{x: 10, y: 0}, {x: 0, y: 10}]);
        };
    });

    const westLanes = data.lanes.west;
    westLanes.forEach(lane => {
        if (lane.turn === 'go_straight') {
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            roadEast.addLane(new Lane(roadWidth, maxSpeed));
            west_straight.addLaneLink(roadWest.lanes.length - 1, roadEast.lanes.length - 1, [{x: -10, y: 0}, {x: 10, y: 0}]);
        };
        if (lane.turn === 'turn_left') {
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            roadSouth.addLane(new Lane(roadWidth, maxSpeed));
            west_left.addLaneLink(roadWest.lanes.length - 1, roadSouth.lanes.length - 1, [{x: -10, y: 0}, {x: 0, y: 10}]);
        };
        if (lane.turn === 'turn_right') {
            roadWest.addLane(new Lane(roadWidth, maxSpeed));
            roadNorth.addLane(new Lane(roadWidth, maxSpeed));
            west_right.addLaneLink(roadWest.lanes.length - 1, roadNorth.lanes.length - 1, [{x: -10, y: 0}, {x: 0, y: -10}]);
        };
    });


    intersection.addRoadLink(north_straight);
    intersection.addRoadLink(north_left)
    intersection.addRoadLink(north_right);
    intersection.addRoadLink(south_straight);
    intersection.addRoadLink(south_left);
    intersection.addRoadLink(south_right);
    intersection.addRoadLink(east_straight);
    intersection.addRoadLink(east_left);
    intersection.addRoadLink(east_right);
    intersection.addRoadLink(west_straight);
    intersection.addRoadLink(west_left);
    intersection.addRoadLink(west_right);

    const roads = [roadNorth, roadSouth, roadEast, roadWest];

    console.log(JSON.stringify(intersection, null, 2));
    console.log(JSON.stringify(roads, null, 2));

    //lane - array on road (width, maxSpeed) --> id = indexul din array
    //laneLink - array in roadLink (indexLaneStart, indexLaneEnd, points = )

    const roadnet = {
    intersections: [intersection, northExit, southExit, eastExit, westExit],
    roads: roads
    };

    fetch('/Skibidi_traffic/write_roadnet_js/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(roadnet),
    })
    .then(response => {
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    return response.json();
    })
    .then(data => {
    console.log('Fișier salvat cu succes:', data);

    // Așteaptă 2 secunde (2000ms) înainte de a face al doilea fetch
    setTimeout(() => {
        fetch("/Skibidi_traffic/run-simulation/")
        .then(res => res.json())
        .then(response => {
        if (response.status === "ok") {
            console.log("Simulare terminată cu succes");
            window.location.href = '/Skibidi_traffic/cityflow/';
        } else {
            console.error("Eroare la rularea simulării:", response.output);
        }
        })
        .catch(err => {
        console.error("Eroare:", err);
        });
    }, 4000); // 2000 milisecunde = 2 secunde

    })
    .catch(error => {
    console.error('Eroare la fetch:', error);
    });



}

import Intersection from './classes/intersection.js';
import Road from './classes/road.js';
import RoadLink from './classes/roadlink.js';
import Lane from './classes/lane.js';
import LaneLink from './classes/lanelink.js';