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
            success: window.location.href.includes("https://leetcode.com/")
        });
    }
});


function addRank(){
    var username = window.localStorage.getItem("leetcode_username");
    if (window.location.href.includes("https://leetcode.com/u/")) {
        username = window.location.href.replace("https://leetcode.com/u/", "").split("/")[0];
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

                if (prevRanks.length >=2 && prevRanks[prevRanks.length-1] != prevRanks[prevRanks.length-2]){
                    let rankDiff = prevRanks[prevRanks.length - 1] - prevRanks[prevRanks.length-2];

                    let rankDiffTxt = Math.abs(rankDiff);
                    if (rankDiffTxt >= 1000000){
                        rankDiffTxt = rankDiffTxt/1000000;
                        rankDiffTxt = rankDiffTxt.toFixed(1);
                        rankDiffTxt = rankDiffTxt + "M";
                    }
                    else if (rankDiffTxt >= 1000){
                        rankDiffTxt = rankDiffTxt/1000;
                        rankDiffTxt = rankDiffTxt.toFixed(1);
                        rankDiffTxt = rankDiffTxt + "K";
                    }

                    let rankDiffEle = document.createElement("span");
                    rankDiffEle.innerText = (rankDiff > 0 ? "↑" : "↓") + rankDiffTxt ;
                    rankDiffEle.style.color = rankDiff < 0 ? "green" : "red";
                    rankDiffEle.style.fontSize = "0.8rem";
                    rankDiffEle.style.fontWeight = "bold";
                    rankDiffEle.style.marginLeft = "5px";
                    ele.parentNode.appendChild(rankDiffEle);
                    
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
    let parent =  document.querySelector("div > div.mx-auto.w-full.grow > div > div.w-full");
    document.querySelectorAll("span").forEach(ele=>{
        if(ele.innerText.includes("submissions in the past one year")){
            parent = ele.parentNode.parentNode.parentNode.parentNode;
        }
    });

    let points = {};
            for (let i=0; i<12; ++i){ points[i] = {rank:9999999999, count:0};}
            for (let i=0; i<dates.length; ++i){
                let date = new Date(dates[i].split("/").reverse().join("-"));
                let mth = date.getMonth();
                points[mth].rank = Math.min(points[mth].rank, ranks[i]);
                points[mth].count = 1;
            }

            let xAxis = [];
            let yAxis = [];
            for (let i=11; i>-1; --i){
                let mth = (new Date()).getMonth() - i;
                if (mth < 0) mth += 12;
                xAxis.push((new Date(
                    (new Date()).getFullYear(),
                    mth,
                    1
                )).toLocaleString('default', { month: 'short', month: 'short' }));
                yAxis.push(points[mth].rank/points[mth].count);
            }
            for (let i = 11; i>=0; --i){
                if (isNaN(yAxis[i])){
                    yAxis[i] = (yAxis[i+1] + yAxis[i-1])/2;
                    if (isNaN(yAxis[i])){
                        yAxis[i] = yAxis[i+1];
                    }
                }
                yAxis[i] = Math.round(yAxis[i]);
            }
            // console.log(xAxis, yAxis);

            let ctx = document.createElement("canvas");
            ctx.width = "800";
            ctx.height = "300";
            let isDark = document.querySelector('html').classList.contains("dark");
            ctx.style.background = isDark?"#282828":"white";
            ctx.style.marginTop = "1rem";
            ctx.style.borderRadius = "0.5rem";
            Chart.defaults.color = isDark?"#fff":"#000";
            new Chart(ctx, {
                    type: 'line',
                    data: {
                      labels: xAxis,
                      datasets: [{
                        label: 'Rank #',
                        data: yAxis,
                        borderWidth: 3,
                        borderColor: "#ffa116",
                        pointRadius: 3,
                        // pointStyle: false,
                        cubicInterpolationMode: 'monotone',
                      }]
                    },
                    options: {
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      tension: 0.3,
                      plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: ({ label, formattedValue }) => formattedValue,
                                title: (raw) => raw[0].label,
                                labelColor: function(context) {
                                    return {
                                        borderColor: '#00000000',
                                        backgroundColor: '#00000000',
                                        borderWidth: 0,
                                        borderDash: [0,0],
                                        borderRadius: 10,
                                    };
                                },
                            }
                        },
                        title:{
                            display: true,
                            text: "Rank History",
                            font: {
                                size: 20
                            }
                        }
                    },
                    layout: {
                        padding: 20
                    },
                    },
            });
        parent.appendChild(ctx);

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
            if (window.localStorage.getItem(problemId+"_status") == "NA"){
                start = true;
                toggleSolutions(true);
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
            document.querySelector('#solutions_tab').parentNode.parentNode.style.display = "none";
            document.querySelector('#editorial_tab').parentNode.parentNode.style.display = "none";
            document.querySelectorAll(".flexlayout__tab")[1].style.filter = "blur(10px)";
            document.querySelectorAll(".flexlayout__tab")[2].style.filter = "blur(10px)";
            //disable clicks
            document.querySelectorAll(".flexlayout__tab")[1].style.pointerEvents = "none";
            document.querySelectorAll(".flexlayout__tab")[2].style.pointerEvents = "none";


        }
        else{
            document.querySelector('#solutions_tab').parentNode.parentNode.style.display = "";
            document.querySelector('#editorial_tab').parentNode.parentNode.style.display = "";
            document.querySelectorAll(".flexlayout__tab")[1].style.filter = "";
            document.querySelectorAll(".flexlayout__tab")[2].style.filter = "";
            //enable clicks
            document.querySelectorAll(".flexlayout__tab")[1].style.pointerEvents = "";
            document.querySelectorAll(".flexlayout__tab")[2].style.pointerEvents = "";
        }
    }
}

function hidePremium(){
    if (window.location.href.includes("leetcode.com/problemset/")){
        try{
            document.querySelectorAll('div.mx-2.flex.items-center > .text-brand-orange').forEach((e)=>{
                e.parentNode.parentNode.style.display = "none";
            });
        }
        catch(e){
            console.log(e);
        }
    }
}

function trackQuestions(){
    if (window.location.href.includes("leetcode.com/u/")){
        var username = window.location.href.replace("https://leetcode.com/u/","").split("/")[0];
        console.log("Tracking questions for ", username);

        var questions;
        if (window.localStorage.getItem(username+"_solvedquestions")) {
            questions = JSON.parse(window.localStorage.getItem(username+"_solvedquestions"));
        } else {
            questions = {
                prev: {
                    solved: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    time: ""
                },
                curr: {
                    solved: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    time: ""
                }
            };
        }


        var easyDiv = document.querySelector("div:nth-child(1) > div.text-sd-foreground.text-xs.font-medium");
        var medDiv = document.querySelector("div:nth-child(2) > div.text-sd-foreground.text-xs.font-medium");
        var hardDiv = document.querySelector("div:nth-child(3) > div.text-sd-foreground.text-xs.font-medium");


        var easy = parseInt(easyDiv.innerHTML.split("/")[0]);
        var medium = parseInt(medDiv.innerHTML.split("/")[0]);
        var hard = parseInt(hardDiv.innerHTML.split("/")[0]);
        var total = easy + medium + hard;

        var date = new Date();
        var today = date.getDate()+"_"+date.getMonth()+"_"+date.getFullYear();
        if (questions.curr.solved != total || questions.curr.time != today){
            if (questions.curr.time == today){
                questions.curr.easy = easy;
                questions.curr.medium = medium;
                questions.curr.hard = hard;
                questions.curr.solved = total;
            }
            else if (questions.curr.solved != total){
                questions.prev = {
                    solved: questions.curr.solved,
                    easy: questions.curr.easy,
                    medium: questions.curr.medium,
                    hard: questions.curr.hard,
                    time: questions.curr.time
                };
                questions.curr = {
                    solved: total,
                    easy: easy,
                    medium: medium,
                    hard: hard,
                    time: today
                };
            }

            window.localStorage.setItem(username+"_solvedquestions", JSON.stringify(questions));
        }

        easy = questions.curr.easy - questions.prev.easy;
        medium = questions.curr.medium - questions.prev.medium;
        hard = questions.curr.hard - questions.prev.hard;
        var temp;
        if (easy > 0){
            temp = document.createElement('div');
            temp.className = "text-xs font-medium text-sd-easy";
            temp.innerText = "+" + easy;
            temp.style.marginLeft = "5px";
            easyDiv.appendChild(temp);
            easyDiv.style.display = "flex";
        }

        if (medium > 0) {
            temp = document.createElement('div');
            temp.className = "text-xs font-medium text-sd-medium";
            temp.innerText = "+" + medium;
            temp.style.marginLeft = "5px";
            medDiv.appendChild(temp);
            medDiv.style.display = "flex";
        }

        if (hard > 0) {
            temp = document.createElement('div');
            temp.className = "text-xs font-medium text-sd-hard";
            temp.innerText = "+" + hard;
            temp.style.marginLeft = "5px";
            hardDiv.appendChild(temp);
            hardDiv.style.display = "flex";
        }

        if (questions.curr.solved - questions.prev.solved > 0){
            temp = document.createElement('div');
            temp.className = "rounded-sd-sm flex w-full flex-1 flex-col items-center justify-center gap-0.5 shadow-[unset] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.06)] text-xs font-medium text-sd-foreground";
            temp.innerText = "Total: ";
            var temp2 = document.createElement('div');
            temp2.className = "text-xs font-medium text-sd-easy";
            temp2.innerText = "+"+(questions.curr.solved - questions.prev.solved);
            temp2.style.marginLeft = "5px";
            temp2.style.color = "hsl(212.85deg 100% 37.84%)";
            temp.appendChild(temp2);
            temp.style.display = "flex";
            temp.style.alignItems = "center";
            temp.style.justifyContent = "center";
            temp.style.flexDirection = "row";
            hardDiv.parentNode.parentNode.appendChild(temp);
        }
       


    }
}

setTimeout(()=>{
    addRank();
    hidePremium();
    trackQuestions();
    showHiddenSolved();
}, 5000);

let timer = 0;
setInterval(()=>{
    // console.log("-->", document.hasFocus())
    // toggleSolutions(true);
    toggleTimer(document.hasFocus());
    if (document.hasFocus()){
        timer += 1;
        if (timer >= 20*60){ //show solutions after 30 minutes
            toggleSolutions(false);
        }
    }
},1000);


function showHiddenSolved(){
    if (window.location.href.includes("leetcode.com/u/")){
        var username = window.location.href.replace("https://leetcode.com/u/","").split("/")[0];
        var temp = document.createElement('div');
        temp.className  = "flex flex-col";
        
        var text = `<div class="text-base font-bold leading-6 mt-5 mb-3 ml-2">Recent Submissions</div>`;

        //post request
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://leetcode.com/graphql", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response);
                var submissions = response.data.recentSubmissionList;
                console.log(submissions);
                var tx = false;
                submissions.forEach((submission)=>{
                    tx = !tx;
                    text += `<a class="flex h-[56px] items-center rounded px-4 ${tx?"bg-fill-4 dark:bg-dark-fill-4":""}"
                    target="_blank"
                    href="${submission.url}">
                    <div data-title="${submission.title}" class="flex flex-1 justify-between">
                    <span class="text-label-1 dark:text-dark-label-1 line-clamp-1 font-medium"
                        >${submission.title} <span style="
                        font-size: 0.8rem;
                        font-weight: normal;
                        background: ${submission.statusDisplay == "Accepted"? "#009214":"#ba0000"};
                        border-radius: 50px;
                        padding: .1rem 0.5rem;
                        color: white;
                        margin-left: 5px;">${submission.statusDisplay}</span>
                        
                        <span style="
                        font-size: 0.8rem;
                        font-weight: normal;
                        background: grey;
                        border-radius: 50px;
                        padding: .1rem 0.5rem;
                        color: white;
                        margin-left: 5px;">${submission.lang}</span>
                        
                        </span><span
                        class="text-label-3 dark:text-dark-label-3 lc-md:inline hidden whitespace-nowrap"
                        >${submission.time} ago</span>
                    </div></a>`;
                });
                temp.innerHTML = text;
                document.querySelector("div > div.mx-auto.w-full.grow > div > div.w-full").appendChild(temp);

            }
        };
        var data = JSON.stringify({
            operationName: "recentSubmissions",
            variables: {"username":username,"limit":200},
            query: "\n    query recentSubmissions($username: String!, $limit: Int!) {\n  recentSubmissionList(username: $username, limit: $limit) {\n    id\n    title\n    titleSlug\n    timestamp\n    url\n   lang\n  time\n  status\n  statusDisplay\n}\n}\n    "
        });
        xhr.send(data);
    }

}