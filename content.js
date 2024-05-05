chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'track_rank') {

        window.localStorage.setItem("leetcode_username", request.username)
        console.log("Username saved");
        sendResponse({ message: 'Success' });
    }
    else if (request.action === "get_username") {
        var username = window.localStorage.getItem("leetcode_username");
        let prevRanks = [];
        let prevRankDates = [];
        if (username) {
            prevRanks = JSON.parse(window.localStorage.getItem(username + "_ranks") || "[]");
            prevRankDates = JSON.parse(window.localStorage.getItem(username + "_rankdates") || "[]");
        }
        // alert(window.location.href)
        sendResponse({
            username:
                window.localStorage.getItem("leetcode_username"),
            rankHistory: prevRanks,
            rankDateHistory: prevRankDates,
            success: window.location.href.includes("https://leetcode.com/u/")
        });
    }
});


function addRank(){
    var username = window.localStorage.getItem("leetcode_username");
    if (window.location.href.includes("https://leetcode.com/u/" + username)) {
        document.querySelectorAll("span").forEach((ele) => {
            if (ele.innerText == "Rank") {
                let rank = ele.parentNode.children[1].innerText;
                rank = parseFloat(rank.replace(/,/g, '').replace(/~/g, '').trim());
                console.log(rank);
                let prevRanks = JSON.parse(window.localStorage.getItem(username + "_ranks") || "[]");
                let prevRankDates = JSON.parse(window.localStorage.getItem(username + "_rankdates") || "[]");
                console.log("My Ranks: ", prevRanks)
                if (prevRanks.length === 0 || prevRanks[prevRanks.length - 1] != rank) {
                    prevRanks.push(rank);

                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                    var yyyy = today.getFullYear();

                    today = dd + '/' + mm + '/' + yyyy;
                    prevRankDates.push(today);
                }
                window.localStorage.setItem(username + "_ranks", JSON.stringify(prevRanks));
                window.localStorage.setItem(username + "_rankdates", JSON.stringify(prevRankDates));
                displayChart(prevRanks,prevRankDates);
            }
        })
    }
    else console.log("This is not your leetcode profile! ");
}

function displayChart(ranks,dates){
    document.querySelectorAll("span").forEach(ele=>{
        if(ele.innerText.includes("submissions in the past one year")){
            let parent = ele.parentNode.parentNode.parentNode.parentNode;
            let ctx = document.createElement("canvas");
            ctx.width = parent.width;
            ctx.height = "300";
            let isDark = document.querySelector('html').classList.contains("dark");
            ctx.style.background = isDark?"#282828":"white";
            ctx.style.marginTop = "1rem";
            new Chart(ctx, {
                    type: 'line',
                    data: {
                      labels: dates,
                      datasets: [{
                        label: 'Rank #',
                        data: ranks,
                        borderWidth: 3,
                        borderColor: "#ffa116"
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
        parent.appendChild(ctx);
        }
    });
}

function toggleTimer(start=true){
    if (window.location.href.includes("https://leetcode.com/problems/")){
        try{
            document.querySelector('#ide-top-btns > div > div > div > div:nth-child(2) > div').click();
            let status = document.querySelector('#ide-top-btns > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div> div > svg').getAttribute('data-icon');
            console.log(status, start, status.includes("play"), status.includes("pause"));
            var problemId = window.location.href.replace("https://leetcode.com/problems/","").split("/")[0];
            if (!window.localStorage.getItem(problemId+"_status")){
                document.querySelector('#ide-top-btns > div > div > div > div:nth-child(1) > div > div:nth-child(4)').click(); //reset timer
                window.localStorage.setItem(problemId+"_status", "NA");
                timer = 0;
                toggleSolutions(true);
            }
            if (window.location.href.includes('/submissions/') && document.querySelector('span[data-e2e-locator="submission-result"]').innerText.includes("Accepted")){
                window.localStorage.setItem(problemId+"_status", "AC");
            }
            if (window.localStorage.getItem(problemId+"_status") == "AC"){
                start = false;
                toggleSolutions(false);
            }
            if (start && status.includes("play")) {
                document.querySelector('#ide-top-btns > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div').click()
            }
            else if (!start && status.includes("pause")){
                document.querySelector('#ide-top-btns > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div').click()
            }
        }
        catch(e){
            console.log(e);
        }
    }
}

function toggleSolutions(hide=true){
    if (window.location.href.includes("https://leetcode.com/problems/")){
        if (hide){
            document.querySelector('div[data-layout-path="/ts0/tb1"]').style.display = "none";
            document.querySelector('div[data-layout-path="/ts0/tb2"]').style.display = "none";
        }
        else{
            document.querySelector('div[data-layout-path="/ts0/tb1"]').style.display = "";
            document.querySelector('div[data-layout-path="/ts0/tb2"]').style.display = "";
        }
    }
}

setTimeout(()=>{
    addRank();
}, 4000);

let timer = 0;
setInterval(()=>{
    // console.log("-->", document.hasFocus())
    toggleSolutions(true);
    if (document.hasFocus()){
        timer += 1;
        if (timer >= 30*60){ //show solutions after 30 minutes
            toggleSolutions(false);
        }
    }
    toggleTimer(document.hasFocus());
},1000);