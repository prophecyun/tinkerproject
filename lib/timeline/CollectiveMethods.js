function colorMatcherFromNumber(info){
	switch (info){
		case "1": return "RED";
		case "2": return "YELLOW";
		case "3": return "GREEN";
		case "RED": return "RED";
		case "YELLOW": return "YELLOW";
		case "GREEN": return "GREEN";
		default: return info;
	}
}

function findSource(sources, type) {
	for (var i = 0 ; i < sources.length; i++ ) {
		if ( sources[i].type.toUpperCase()==type) {
			return sources[i];
		}
	}
	return null;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}