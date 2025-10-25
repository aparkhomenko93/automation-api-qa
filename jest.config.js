export default {
    testEnvironment: "node",
    transform: {},
    reporters: [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report",
            "includeFailureMsg": true,
            "includeStackTrace": true
        }]
    ]
};