module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            2,
            4
        ],
        "linebreak-style": [
            1,
            "unix"
        ],
        "quotes": [
            1,
            "single"
        ],
        "semi": [
            2,
            "always"
        ],
        "no-console": 0,
        "prefer-const": 1,
        "no-unused-vars": 1,
        "no-var": 1,
        //"no-new-object": 1,
        "object-shorthand": 1,
        "object-shorthand": 1,
        "quote-props": [
            1,
            "as-needed"
        ],
        //"no-array-constructor": 1,
        "array-callback-return": 1,
        //"no-eval": 1,
        "no-useless-escape": 1,
        "wrap-iife": 1,
        "no-loop-func": 1,
        "prefer-rest-params": 1,
        //"no-new-func": 1,
        "prefer-spread": 1,
        "prefer-arrow-callback": 1,
        "arrow-parens": [
            1,
            "as-needed",
            { "requireForBlockBody": true }
        ],
        "arrow-body-style": 1,
        "no-confusing-arrow": [
            1,
            { "allowParens": true }
        ],
        "no-useless-constructor": 1,
        "no-dupe-class-members": 1,
        "no-duplicate-imports": 1,
        //"import/no-mutable-exports": 1,
        //"import/prefer-default-export": 1,
        //"import/first": 1,
        "dot-notation": 1,
        //"no-plusplus": 1,
        "eqeqeq": [
            1,
            "smart"
        ],
        "no-unneeded-ternary": 1,
        "brace-style": [
            0,
            "allman",
            { "allowSingleLine": true }
        ],
        "max-len": [
            1,
            120,
            4
        ],
        "comma-style": 1,
        /*"comma-dangle": [
            1,
            "always"
        ],*/
        "radix": 1,

    }
};
