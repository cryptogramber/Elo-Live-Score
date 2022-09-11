chrome.runtime.sendMessage({
    method: 'GET',
    action: 'xhttp',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
}, function(responseText) {
    // TODO: Error handling!!
    var nfljson = JSON.parse(responseText);
    var liveGameTeamsAway = [];
    var liveGameTeamsHome = [];
    var liveGameAwayScores = [];
    var liveGameHomeScores = [];
    var liveGameQuarters = [];
    var liveGameClocks = [];
    var currentWeek = nfljson.week.number;  // used to find the right <div> element on 538 page
    const gameQuarters = [1, 2, 3, 4, 5]
    
    // console.log(currentWeek);
    // NFL syntax
    // h = home team short
    // v = visiting team short
    // q = quarter (P,1,2,3,4,F,O,FO)
    // k = time remaining
    // hs = home score
    // vs = visitor score
    // TODO: I'm not sure if OT and O are the actual designations for overtime in ESPN's livescore json file.

    // console.log(nfljson);

    for (x in nfljson.events) {
        // if (nfljson.events[x].status.type.state == 'post') {
        //     liveGameQuarters.push("Final")
        //     liveGameClocks.push("--:--")
        //     if (nfljson.events[x].competitions[0].competitors[0].homeAway == "home") {
        //         // competitors[0] is usually home
        //         liveGameTeamsHome.push(nfljson.events[x].competitions[0].competitors[0].team.abbreviation)
        //         liveGameHomeScores.push(nfljson.events[x].competitions[0].competitors[0].score)
        //         // competitors[1] is usually away
        //         liveGameTeamsAway.push(nfljson.events[x].competitions[0].competitors[1].team.abbreviation)
        //         liveGameAwayScores.push(nfljson.events[x].competitions[0].competitors[1].score)
        //     } else if (nfljson.events[x].competitions[0].competitors[0].homeAway == "away") { 
        //         // in case my assumptions are wrong
        //         liveGameTeamsAway.push(nfljson.events[x].competitions[0].competitors[0].team.abbreviation)
        //         liveGameAwayScores.push(nfljson.events[x].competitions[0].competitors[0].score)
        //         liveGameTeamsHome.push(nfljson.events[x].competitions[0].competitors[1].team.abbreviation)
        //         liveGameHomeScores.push(nfljson.events[x].competitions[0].competitors[1].score)
        //     }
        if (nfljson.events[x].status.type.state != 'pre' && nfljson.events[x].status.type.state != 'post') {
            if (gameQuarters.includes(nfljson.events[x].status.period)) {
                liveGameQuarters.push("Q" + nfljson.events[x].status.period)
            } else {
                liveGameQuarters.push(nfljson.events[x].status.period)
            }
            liveGameClocks.push(nfljson.events[x].status.displayClock)
            if (nfljson.events[x].competitions[0].competitors[0].homeAway == "home") {
                // competitors[0] is usually home
                liveGameTeamsHome.push(nfljson.events[x].competitions[0].competitors[0].team.abbreviation)
                liveGameHomeScores.push(nfljson.events[x].competitions[0].competitors[0].score)
                // competitors[1] is usually away
                liveGameTeamsAway.push(nfljson.events[x].competitions[0].competitors[1].team.abbreviation)
                liveGameAwayScores.push(nfljson.events[x].competitions[0].competitors[1].score)
            } else if (nfljson.events[x].competitions[0].competitors[0].homeAway == "away") { 
                // in case my assumptions are wrong
                liveGameTeamsAway.push(nfljson.events[x].competitions[0].competitors[0].team.abbreviation)
                liveGameAwayScores.push(nfljson.events[x].competitions[0].competitors[0].score)
                liveGameTeamsHome.push(nfljson.events[x].competitions[0].competitors[1].team.abbreviation)
                liveGameHomeScores.push(nfljson.events[x].competitions[0].competitors[1].score)
            }
        }
    }
    // HTML structure of the current week on 538's results page
	// div data-week > table > tbody > tr
    //									td.team-away
	//										span.short
	//									td.result
	//										div.live

    var dataWeekString = "div[data-week='" + currentWeek + "'] > table > tbody > tr > td.team.away > span.short";
	$(document).ready(function() {
        $(dataWeekString).each(function(index, item) {
	    //$("div[data-week='5'] > table > tbody > tr > td.team.away > span.short").each(function(index, item) {
            for(var t = 0; t < liveGameTeamsAway.length; t++) {
                if (liveGameTeamsAway[t] == 'LA') {
                    liveGameTeamsAway[t] = 'LAR';           // 538 uses 'LAR' for LA Rams vs NFL standard(?) of 'LA'
                }
                if (liveGameTeamsAway[t] == 'WAS') {
                    liveGameTeamsAway[t] = 'WSH';           // 538 uses 'WSH' for LA Rams vs NFL standard(?) of 'WAS'
                }
                if ($(item).text() == liveGameTeamsAway[t]) {
                    var newscores = "<table style='display: inline; position: absolute;'>" +
                                        "<tr style='border: none;'>" +
                                            "<td style='font-size: x-small; padding: 0 20px;'>" + liveGameQuarters[t] + "</td>" +
                                            "<td style='font-size: x-small; padding: 0 0;'>" + liveGameTeamsAway[t] + "</td>" +
                                            "<td style='font-size: x-small; padding: 0 10px;'>" + liveGameAwayScores[t] + "</td>" +
                                        "</tr>" +
                                        "<tr style='border: none;'>" +
                                            "<td style='font-size: x-small; padding: 0 20px;'>" + liveGameClocks[t] + "</td>" +
                                            "<td style='font-size: x-small; padding: 0 0;'>" + liveGameTeamsHome[t] + "</td>" +
                                            "<td style='font-size: x-small; padding: 0 10px;'>" + liveGameHomeScores[t] + "</td>" +
                                        "</tr>" +
                                    "</table>";
                    $(item).closest('tr').children('td.result').append(newscores)
                }
            }
        });
        if ($("div > table > tbody > tr > td.result > div.live").length > 0) {
            setInterval(function() { window.location.reload(); }, 60000)        // if live game, refresh once a minute
        } else {
            setInterval(function() { window.location.reload(); }, 3600000)      // if no live game, refresh once an hour
        }
	});
});
