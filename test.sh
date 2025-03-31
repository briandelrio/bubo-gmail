#!/bin/bash

# Find a browser to open the test page with
if command -v open &> /dev/null; then
  # macOS
  open test.html
elif command -v xdg-open &> /dev/null; then
  # Linux
  xdg-open test.html
elif command -v start &> /dev/null; then
  # Windows
  start test.html
else
  echo "Unable to open test.html automatically. Please open it manually."
fi

echo "Test page opened. Please ensure the Bubo extension is enabled."
echo "Use the buttons on the test page to test different components."