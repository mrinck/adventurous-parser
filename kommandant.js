function Kommandant() {

    this.commands = [];

    this.buildParser = function(pattern) {
        var regexp = pattern;
        var params = [];

        // groups

        var groupRe =       /\(.*?\)/g;
        var groupMatches = pattern.match(groupRe);

        if (groupMatches) {
            for (var i = 0; i < groupMatches.length; i++) {
                var groupMatch = groupMatches[i];
                var groupReplace = groupMatch;
                groupReplace = groupReplace.replace("(", "(?:");
                regexp = regexp.replace(groupMatch, groupReplace);
            }
        }

        // optional groups

        var optGroupRe =    /\[.*?\]/g;
        var optGroupMatches = pattern.match(optGroupRe);

        if (optGroupMatches) {
            for (var i = 0; i < optGroupMatches.length; i++) {
                var optGroupMatch = optGroupMatches[i];
                var optGroupReplace = optGroupMatch;
                optGroupReplace = optGroupReplace.replace("[", "(?:");
                optGroupReplace = optGroupReplace.replace("]", ")");
                optGroupReplace = optGroupReplace + "?";
                regexp = regexp.replace(optGroupMatch, optGroupReplace);
            }
        }

        // parameters

        var paramRe =       /:[-_a-zA-Z0-9]+/g;
        var paramMatches = pattern.match(paramRe);

        if (paramMatches) {
            for (var i = 0; i < paramMatches.length; i++) {
                var paramMatch = paramMatches[i];
                var paramReplace = "(.*)";
                regexp = regexp.replace(paramMatch, paramReplace);

                var paramName = paramMatch.replace(":", "");
                params.push(paramName);
            }
        }

        // whitespace

        regexp = regexp.replace(/ /g, "\\s+");
        regexp = "^" + regexp + "$";

        return {
            regex: new RegExp(regexp, "i"),
            params: params
        }
    };

    this.parse = function(input, pattern) {
        var parser = this.buildParser(pattern);
        var params = {};
        var matching = parser.regex.test(input);

        if (matching) {
            console.log(input, parser.regex);
            params.input = input;
            if (parser.params.length > 0) {
                var match = parser.regex.exec(input);
                if (match) {
                    for (var i = 0; i < parser.params.length; i++) {
                        params[parser.params[i]] = match[i + 1];
                    }
                }
            }
        }

        return {
            input: input,
            pattern: pattern,
            regex: parser.regex,
            matching: matching,
            params: params
        };
    };

    this.process = function(input, pattern) {
        var result = parse(input, pattern);
        console.log("RESULT: ", result);
        return result;
    };

    this.on = function(param1, param2) {
        if(param1 && param2) {
            addRoute(param1, param2);
        } else if (param1) {
            var routes = param1;
            for( prop in routes) {
                this.addRoute(prop, routes[prop]);
            }
        }
    };

    this.addRoute = function(pattern, callback) {
        this.commands.push({
            pattern: pattern,
            callback: callback
        });
    };

    this.resolve = function(input) {
        for( var i = 0; i < this.commands.length; i++ ) {
            var command = this.commands[i];
            var result = this.parse(input, command.pattern);
            if ( result.matching ) {
                command.callback(result.params);
                return result;
            }
        }
    };
};
