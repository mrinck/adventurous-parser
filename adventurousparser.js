function AdventurousParser() {

    var buildParser = function(pattern) {
        var regexp = pattern;
        var params = [];

        // groups

        var groupRegex = /\(.*?\)/g;
        var groupMatches = pattern.match(groupRegex);

        if (groupMatches) {
            for (var i = 0; i < groupMatches.length; i++) {
                var groupMatch = groupMatches[i];
                var groupReplace = groupMatch;
                groupReplace = groupReplace.replace("(", "(?:");
                regexp = regexp.replace(groupMatch, groupReplace);
            }
        }

        // optional groups with leading whitespace

        var optGroupRegex = / \[.*?\]/g;
        var optGroupMatches = pattern.match(optGroupRegex);

        if (optGroupMatches) {
            for (var i = 0; i < optGroupMatches.length; i++) {
                var optGroupMatch = optGroupMatches[i];
                var optGroupReplace = optGroupMatch;
                optGroupReplace = optGroupReplace.replace(" [", "(?: (?:");
                optGroupReplace = optGroupReplace.replace("]", ")|)");
                regexp = regexp.replace(optGroupMatch, optGroupReplace);
            }
        }

        // optional groups

        var optGroupRegex = /\[.*?\]/g;
        var optGroupMatches = pattern.match(optGroupRegex);

        if (optGroupMatches) {
            for (var i = 0; i < optGroupMatches.length; i++) {
                var optGroupMatch = optGroupMatches[i];
                var optGroupReplace = optGroupMatch;
                optGroupReplace = optGroupReplace.replace("[", "(?:");
                optGroupReplace = optGroupReplace.replace("]", ")?");
                regexp = regexp.replace(optGroupMatch, optGroupReplace);
            }
        }

        // parameters

        var paramRegex = /:[-_a-zA-Z0-9]+/g;
        var paramMatches = pattern.match(paramRegex);

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

    var parse = function(input, pattern) {
        var parser = buildParser(pattern);
        var params = {};
        var matching = parser.regex.test(input);

        if (matching) {
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

    this.commands = [];

    this.addCommand = function(pattern, callback) {
        this.commands.push({
            pattern: pattern,
            callback: callback
        });
    };

    this.parse = function(input) {
        for( var i = 0; i < this.commands.length; i++ ) {
            var command = this.commands[i];
            var result = parse(input, command.pattern);
            if ( result.matching ) {
                command.callback(result.params);
                return result;
            }
        }
    };
};
