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
        sendResponse({
            username:
                window.localStorage.getItem("leetcode_username"),
            rankHistory: prevRanks,
            rankDateHistory: prevRankDates
        });
    }
});


function addRank(){
    var username = window.localStorage.getItem("leetcode_username");
    if (window.location.href.includes("https://leetcode.com/" + username)) {
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
            }
        })
    }
    else console.log("This is not your leetcode profile! ");
}

setTimeout(()=>{
    addRank();
}, 5000);