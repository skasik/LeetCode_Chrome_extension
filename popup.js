document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("tracker_btn").addEventListener("click", function () {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'track_rank',
                username: document.getElementById("username").value
            });
        });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'get_username'
        }, function(resp){
            document.getElementById("username").value = resp.username;
            // resp.rankHistory.forEach(element => {
            //     var el = document.createElement("span");
            //     el.innerText = element;
            //     document.getElementById("my_ranks").appendChild(el);
            // });
            if (resp.rankHistory.length > 0){
                const ctx = document.getElementById('myChart');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                      labels: resp.rankDateHistory,
                      datasets: [{
                        label: 'Rank #',
                        data: resp.rankHistory,
                        borderWidth: 1
                      }]
                    },
                    options: {
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }
                  });
                // new Chart("myChart", {
                //     type: "line",
                //     data: {
                //         labels: resp.rankDateHistory,
                //         datasets: [{
                //             backgroundColor: "rgba(0,0,255,1.0)",
                //             borderColor: "rgba(0,0,255,0.1)",
                //             data: resp.rankHistory
                //         }]
                //     },
                //     options: {
                //         legend: {display: false}
                //     }
                // });
            }
        });
    });
});