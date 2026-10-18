#!/bin/bash
# Traveler's Diary - start a local web server (macOS / Linux)
# YouTube music only plays when the site is opened from a web address.
cd "$(dirname "$0")"
( sleep 1; open "http://localhost:8000/index.html" 2>/dev/null || xdg-open "http://localhost:8000/index.html" ) &
python3 -m http.server 8000
