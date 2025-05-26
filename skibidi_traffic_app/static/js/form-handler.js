// form-handler.js
import { processIntersectionData } from './logic.js';


function addLane(direction) {
    const container = document.getElementById(`${direction}-lanes`);
    const laneIndex = container.children.length;

    const div = document.createElement("div");
    div.classList.add("lane-entry");
    div.style.marginBottom = "10px";

    div.innerHTML = `
        <span class="lane-label">Bandă ${laneIndex + 1}</span> →
        <select name="${direction}_lane_${laneIndex}_turn">
            <option value="go_straight">Înainte</option>
            <option value="turn_left">Stânga</option>
            <option value="turn_right">Dreapta</option>
        </select>
        <button type="button" class="delete-btn">Șterge</button>
    `;

    const deleteBtn = div.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => removeLane(deleteBtn));

    container.appendChild(div);
}


function removeLane(button) {
    const laneDiv = button.parentNode;
    const container = laneDiv.parentNode;
    const direction = container.id.replace("-lanes", "");

    laneDiv.remove();
    reindexLanes(direction);
}

function reindexLanes(direction) {
    const container = document.getElementById(`${direction}-lanes`);
    const laneEntries = container.children;

    for (let i = 0; i < laneEntries.length; i++) {
        const div = laneEntries[i];
        const label = div.querySelector(".lane-label");
        const select = div.querySelector("select");

        label.textContent = `Bandă ${i + 1}`;
        select.name = `${direction}_lane_${i}_turn`;
    }
}

// Funcție care colectează toate datele din formular din toate direcțiile
function collectFormData() {
    const directions = ["north", "south", "east", "west"];
    const result = {
        road_lengths: {},
        road_width: null,
        lanes: {}
    };

    // Ia lungimile drumurilor (numere)
    directions.forEach(direction => {
        const inputLength = document.querySelector(`input[name='length_${direction}']`);
        if (inputLength) {
            result.road_lengths[direction] = Number(inputLength.value);
        }
    });

    // Ia lățimea benzii globale
    const roadWidthInput = document.querySelector("input[name='road_width']");
    if (roadWidthInput) {
        result.road_width = Number(roadWidthInput.value);
    }

    // Ia benzile pentru fiecare direcție
    directions.forEach(direction => {
        const container = document.getElementById(`${direction}-lanes`);
        if (!container) return;

        const lanes = [];
        container.querySelectorAll(".lane-entry").forEach((div, i) => {
            const select = div.querySelector("select");
            lanes.push({
                lane: i + 1,
                turn: select ? select.value : null
            });
        });

        result.lanes[direction] = lanes;
    });

    return result;
}


document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const data = collectFormData();

            processIntersectionData(data);  // apel direct
        });
    } 
});



window.addLane = addLane;
window.removeLane = removeLane;
window.collectFormData = collectFormData;
