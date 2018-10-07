/* callback function is called upon completion of the request */
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() { callback(xhttp.responseText); };    // success
        xhttp.onerror = function() { callback(); };     // failure; callback() to clean up the com port

        xhttp.open(method, request.url, true);
		xhttp.responseType = 'text';
        xhttp.send();
        return true; // prevents the callback from being called too early on return
    }
});