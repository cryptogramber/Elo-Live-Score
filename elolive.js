chrome.runtime.sendMessage({
    method: 'GET',
    action: 'xhttp',
    url: 'http://www.nfl.com/liveupdate/scorestrip/ss.xml'
}, function(responseText) {
    // TODO: Error handling!!
    var xml = $.parseXML(responseText), $xml = $(xml);
    var liveGameTeamsAway = [];
    var liveGameTeamsHome = [];
    var liveGameAwayScores = [];
    var liveGameHomeScores = [];
    var liveGameQuarters = [];
    var liveGameClocks = [];
    var currentWeek = $xml.find('ss > gms').attr('w');  // used to find the right <div> element on 538 page
    
    // h = home team short
    // v = visiting team short
    // q = quarter (P,1,2,3,4,F,O,FO)
    // k = time remaining
    // hs = home score
    // vs = visitor score
    // TODO: I'm not sure if OT and O are the actual designations for overtime in NFL's livescore xml file.

    $xml.find('ss > gms > g').each(function(index, item){
        if ($(item).attr('q') == '1' || $(item).attr('q') == '2' || $(item).attr('q') == '3' || $(item).attr('q') == '4' || $(item).attr('q') == '5' || $(item).attr('q') == 'O' || $(item).attr('q') == 'OT' || $(item).attr('q') == 'H') {
            liveGameQuarters.push($(item).attr('q'));
            if ($(item).attr('k')) {
                liveGameClocks.push($(item).attr('k'));
            } else {
                liveGameClocks.push("--:--");
            }
            if ($(item).attr('h') && $(item).attr('v') && $(item).attr('hs') && $(item).attr('vs')) {
                liveGameTeamsHome.push($(item).attr('h'));
                liveGameTeamsAway.push($(item).attr('v'));
                liveGameHomeScores.push($(item).attr('hs'));
                liveGameAwayScores.push($(item).attr('vs'));
            } else {    // something is wrong if any of home/visitor/homescore/visitorscore are missing
                liveGameTeamsHome.push('ERR');
                liveGameTeamsAway.push('ERR');
                liveGameHomeScores.push('X');
                liveGameAwayScores.push('X');
            }
        }
    });

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
                                            "<td style='font-size: x-small; padding: 0 20px;'>Q" + liveGameQuarters[t] + "</td>" +
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
