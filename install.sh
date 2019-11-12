#!/usr/bin/env bash
if [ ! -x "$(command -v asar)" ]; then
	echo >&2 "asar not installed."
	exit 1
fi

theme_root="$(pwd)"

echo "finding asar location"
cd "$HOME/.config/discord/" &> /dev/null || cd "$HOME"/snap/discord/??/.config/discord
sed "s/{{user}}/$USER/g" "$theme_root/.files/quotes.json" > quotes.json
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core" &> /dev/null || { echo >&2 "asar location not found. exiting"; exit 1; }
asar_location="$(pwd)"

if [ ! -f core.asar.backup ]; then
	cp core.asar core.asar.backup
	echo "created core.asar.backup"
fi

echo "extracting core.asar.backup"
rm -r /tmp/discord_theme &> /dev/null
mkdir /tmp/discord_theme
asar e core.asar.backup /tmp/discord_theme

echo "creating injection.js and deploying payload"
cd "$theme_root/.files"
sed "s|{{PATH}}|$theme_root/|" injection-original.js > injection.js
sed "s|{{FILE}}|$theme_root/.files/injection.js|" payload-original.js >> /tmp/discord_theme/app/mainScreenPreload.js

echo "repacking asar"
rm "$asar_location/core.asar"
asar p /tmp/discord_theme "$asar_location/core.asar"

echo "cleaning up tmp files"
rm -r /tmp/discord_theme &> /dev/null

echo "done"
