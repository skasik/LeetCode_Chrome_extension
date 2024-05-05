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
          if (resp.success) {
            document.getElementById("content").classList.remove("hide");
            document.getElementById("error").classList.add("hide");

            document.getElementById("username").value = resp.username;

            // if (resp.rankHistory.length > 0){
            //     const ctx = document.getElementById('myChart');
            //     new Chart(ctx, {
            //         type: 'line',
            //         data: {
            //           labels: resp.rankDateHistory,
            //           datasets: [{
            //             label: 'Rank #',
            //             data: resp.rankHistory,
            //             borderWidth: 1
            //           }]
            //         },
            //         options: {
            //           scales: {
            //             y: {
            //               beginAtZero: true
            //             }
            //           }
            //         }
            //       });
            // }
          }
          else{
            document.getElementById("content").classList.add("hide");
            document.getElementById("error").classList.remove("hide");
          }
        });
    });
});