document.addEventListener('DOMContentLoaded', async function () {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log(tabs)
    let data = await fetch('http://localhost:8000/getPrices', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url: tabs[0].url })
    });
    data = await data.json();
    data = data.data;
    let canvas = document.getElementById('myChart1');
    canvas.style.backgroundColor = 'rgba(255, 225, 186, 0.3)';
    let ctx = canvas.getContext('2d');
    const datasets = data.map((elem) => {
        let color = `rgba(${Math.ceil(Math.random() * 255)}, ${Math.ceil(Math.random() * 255)}, ${Math.ceil(Math.random() * 255)}, 1)`;
        return {
            label: elem.label,
            data: elem.data,
            borderColor: color,
            borderWidth: 3,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7
        }
    })
    let chartData = {
        type: 'line',
        data: {
            labels: ['Minimum', 'Average', 'Maximum'],
            datasets: datasets,
        },
        options: {
            scales: {
                xAxes: {
                    ticks: {
                        padding: 5
                    }
                },
                yAxes: {
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        }
    };

    new Chart(ctx, chartData);
});
