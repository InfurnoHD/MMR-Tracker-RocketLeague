const {readDataToArray, addMMR, removeLastAdded} = require('./database');
const {Chart, registerables} = require('chart.js');
Chart.register(...registerables);


let mmrChart;

function initMMRChart(mmrData, dateVector) {
    const ctx = document.getElementById("mmr-graph").getContext("2d");

    mmrChart = new Chart(ctx,{
        type: "line",
        data: {
            labels: dateVector.map(date => date.toLocaleDateString()),
            datasets: [{
                label: "MMR",
                data: mmrData,
                pointStyle: false,
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
        }
    });

}





function refreshChart() {
    readDataToArray().then(({ mmrVector, dateVector }) => {
        if (!mmrChart) {
            initMMRChart(mmrVector, dateVector);
        } else {
            // Update the chart data
            mmrChart.data.labels = dateVector.map(date => date.toLocaleDateString());
            mmrChart.data.datasets.forEach((dataset) => {
                dataset.data = mmrVector;
            });

            // Redraw the chart
            mmrChart.update();
        }
    }).catch(err => console.error('Error loading data:', err));
}


document.getElementById('add-mmr').addEventListener('click', () => {
    const mmrValue = document.getElementById('mmr-input').value;
    const currentDate = new Date().toISOString();
    addMMR(parseInt(mmrValue, 10), currentDate).then(() => {
        console.log('MMR added');
        refreshChart();
    }).catch(err => console.error('Error adding MMR:', err));
});


document.getElementById('undo').addEventListener('click', () => {
    removeLastAdded().then(() => {
        console.log('Last entry removed');
        refreshChart();
    }).catch(err => console.error('Error removing last entry:', err));
});


window.onload = refreshChart;
document.body.classList.add('full-width-layout');
