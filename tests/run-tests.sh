#!/bin/bash
# Life Vault Test Runner
# Opens the test suite in the default browser

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEST_FILE="$SCRIPT_DIR/test-runner.html"

echo "======================================"
echo "  Life Vault Test Suite"
echo "======================================"
echo ""
echo "Opening test runner in browser..."
echo "File: $TEST_FILE"
echo ""

# Detect OS and open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$TEST_FILE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$TEST_FILE" 2>/dev/null || sensible-browser "$TEST_FILE" 2>/dev/null || echo "Please open $TEST_FILE manually in your browser"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start "$TEST_FILE"
else
    echo "Please open $TEST_FILE manually in your browser"
fi

echo "Check the browser for test results."
echo "Also check the browser console (F12) for detailed output."
echo ""
