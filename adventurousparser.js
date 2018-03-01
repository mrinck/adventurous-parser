function AdventurousParser(pattern) {

    let tokenizer = (function() {
        let regex = pattern;
        let params = [];
        let tokenRegex = /.*/;
        let tokenMatches = [];

        // groups: ()

        tokenRegex = /\(.*?\)/gi;
        tokenMatches = pattern.match(tokenRegex);

        if (tokenMatches) {
            for (let i = 0; i < tokenMatches.length; i++) {
                let match = tokenMatches[i];
                let replacement = match;
                replacement = replacement.replace("(", "(?:");
                regex = regex.replace(match, replacement);
            }
        }

        // optional groups: []

        tokenRegex = /\s*\[.*?\]/gi;
        tokenMatches = pattern.match(tokenRegex);

        if (tokenMatches) {
            for (let i = 0; i < tokenMatches.length; i++) {
                let match = tokenMatches[i];
                let leadingWhitespace = /^\s/.test(match);
                let replacement = match;
                if (leadingWhitespace) {
                    replacement = replacement.replace(/\s*\[/, "(?:\\s+(?:");
                    replacement = replacement.replace("]", "))?");
                } else {
                    replacement = replacement.replace("[", "(?:");
                    replacement = replacement.replace("]", ")?");
                }
                regex = regex.replace(match, replacement);
            }
        }

        // parameters: :param

        tokenRegex = /\s*:[-_a-zA-Z0-9]+/gi;
        tokenMatches = pattern.match(tokenRegex);

        if (tokenMatches) {
            for (let i = 0; i < tokenMatches.length; i++) {
                let match = tokenMatches[i];
                let leadingWhitespace = /^\s/.test(match);
                let replacement = "";
                if (leadingWhitespace) {
                    replacement = "\\s+(.*)";
                } else {
                    replacement = "(.*)";
                }
                regex = regex.replace(match, replacement);

                let paramName = match.replace(":", "").replace(" ", "");
                params.push(paramName);
            }
        }

        // whitespace

        regex = regex.replace(/ /g, "\\s+");
        regex = "^" + regex + "$";

        return {
            regex: new RegExp(regex, "i"),
            params: params
        }
    })();

    this.match = function(input) {
        let params = {};
        let matching = tokenizer.regex.test(input);

        if (matching) {
            params.input = input;
            if (tokenizer.params.length > 0) {
                let match = tokenizer.regex.exec(input);
                if (match) {
                    for (let i = 0; i < tokenizer.params.length; i++) {
                        params[tokenizer.params[i]] = match[i + 1];
                    }
                }
            }
        }

        return {
            input: input,
            pattern: pattern,
            regex: tokenizer.regex,
            matching: matching,
            params: params
        };
    };
};
