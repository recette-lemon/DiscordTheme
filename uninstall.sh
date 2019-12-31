#!/usr/bin/env bash

#quit if something fails
set -e

echo "finding asar location"
cd "$HOME/.config/discord/" &> /dev/null || cd "$HOME"/snap/discord/??/.config/discord
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core" &> /dev/null || { echo >&2 "asar location not found. exiting"; exit 1; }

echo "replacing core.asar with backup"
rm core.asar
mv core.asar.backup core.asar

echo "backup restored."
