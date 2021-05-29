#!/usr/bin/env bash
echo "starting
finding asar location"
cd "$HOME/.config/discord/" &> /dev/null || cd "$HOME"/snap/discord/??/.config/discord
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core" &> /dev/null || { echo >&2 "asar location not found. exiting"; exit 1; }

echo "replacing index.js with backup"
rm index.js
mv index.js.backup index.js

echo "backup restored."
