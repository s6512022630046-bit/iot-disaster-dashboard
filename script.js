// ======================================
// Smart Disaster Dashboard
// script.js
// ======================================

// ---------- CONFIG ----------
const USER = "ppdarr";
const DEVICE = "heltec_v3_2";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODQ3NTg5NDYsImlhdCI6MTc4NDc1MTc0Niwicm9sZSI6InVzZXIiLCJ1c3IiOiJwcGRhcnIifQ.y4fb6ZhPlXW4gz0T9YQGMEcp4ZCJo5tRMdNBgsLabks";

// ---------- CHART DATA ----------
const labels = [];
const tempData = [];
const pmData = [];
const waterData = [];

// ---------- CLOCK ----------
function updateClock() {

    const now = new Date();

    document.getElementById("time").textContent =
        now.toLocaleString();

}

setInterval(updateClock, 1000);
updateClock();

// ---------- CHART ----------
function createChart(id, label, color) {

    return new Chart(document.getElementById(id), {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: label,

                data: [],

                borderColor: color,

                backgroundColor: color + "33",

                borderWidth: 3,

                fill: true,

                tension: .35

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    display: false

                },

                y: {

                    ticks: {

                        color: "#ffffff"

                    },

                    grid: {

                        color: "rgba(255,255,255,.1)"

                    }

                }

            }

        }

    });

}

const tempChart =
createChart("tempChart", "Temperature", "#ff5252");

const pmChart =
createChart("pmChart", "PM2.5", "#00e5ff");

const waterChart =
createChart("waterChart", "Water", "#00ff95");

// ---------- LOAD DATA ----------
async function loadSensorData() {

    try {

        const response = await fetch(
`https://backend.thinger.io/v3/users/${USER}/devices/${DEVICE}/resources/SensorData`,
{
    method:"GET",
    mode:"cors",
    cache:"no-cache",
    headers:{
        "Authorization":"Bearer "+TOKEN.trim(),
        "Accept":"application/json"
    }
});

        if(!response.ok){

            throw new Error("HTTP "+response.status);

        }

        const data = await response.json();

        console.log(data);

        const pm = Number(data.PM2_5);

        // ------------------
        // WEATHER
        // ------------------

        document.getElementById("temp").textContent =
            Number(data.Temp).toFixed(2)+"°C";

        document.getElementById("temperature").textContent =
            Number(data.Temp).toFixed(2)+"°C";

        document.getElementById("humidity").textContent =
            Number(data.Hum).toFixed(2)+"%";

        const weatherText =
            document.getElementById("weatherText");

        if(pm<=15){

            weatherText.textContent =
            "Excellent Air";

        }
        else if(pm<=37.5){

            weatherText.textContent =
            "Normal Weather";

        }
        else{

            weatherText.textContent =
            "Poor Air Quality";

        }
              // ------------------
        // AIR
        // ------------------

        const pm25 = document.getElementById("pm25");

        pm25.textContent =
            pm.toFixed(2) + " µg/m³";

        if(pm<=15){

            pm25.style.color="#63ff8b";

        }
        else if(pm<=37.5){

            pm25.style.color="#FFD54F";

        }
        else{

            pm25.style.color="#ff5555";

        }

        // ------------------
        // WATER
        // ------------------

        document.getElementById("dam").textContent =
            Number(data.WaterDam).toFixed(2) + " cm";

        document.getElementById("sea").textContent =
            Number(data.WaterSea).toFixed(2) + " cm";

        document.getElementById("waterHeight").textContent =
            Number(data.Water_Height).toFixed(2) + " cm";

        document.getElementById("waterVolume").textContent =
            Number(data.Water_Volume).toFixed(2) + " L";

        // ------------------
        // RESERVOIR
        // ------------------

        document.getElementById("progressBar").style.width =
            data.Reservoir_Capacity + "%";

        document.getElementById("reservoirText").textContent =
            Number(data.Reservoir_Capacity).toFixed(2) + "%";

        // ------------------
        // STATUS
        // ------------------

        document.getElementById("lightStatus").textContent =
            data.Light_Status;

        const system =
            document.getElementById("systemStatus");

        system.textContent =
            data.System_Status;

        if(data.System_Status=="SAFE"){

            system.style.color="#63ff8b";

        }
        else{

            system.style.color="#ff5555";

        }

        // ------------------
        // WEATHER ICON
        // ------------------

        const icon =
            document.getElementById("weatherIcon");

        if(data.Light_Status=="มืด"){

            icon.textContent="🌙";

        }
        else{

            icon.textContent="☀️";

        }

        // ------------------
        // CHART
        // ------------------

        labels.push("");

        tempData.push(Number(data.Temp));

        pmData.push(pm);

        waterData.push(
            Number(data.Water_Height)
        );
              if (labels.length > 20) {

            labels.shift();

            tempData.shift();

            pmData.shift();

            waterData.shift();

        }

        tempChart.data.datasets[0].data = tempData;

        pmChart.data.datasets[0].data = pmData;

        waterChart.data.datasets[0].data = waterData;

        tempChart.update();

        pmChart.update();

        waterChart.update();

    }

    catch (err) {

        console.error(err);

        const system =
            document.getElementById("systemStatus");

        if(system){

            system.textContent = "Offline";

            system.style.color = "#ff5555";

        }

    }

}

// ---------- START ----------

loadSensorData();

setInterval(loadSensorData, 5000);