#!/usr/bin/env bash
if [ ! -x "$(command -v asar)" ]; then
	echo "asar not installed.
pacaur -S asar
snap install asar"
fi

theme_root="$(pwd)"

echo "starting
finding asar location"
cd "$HOME/.config/discord/"
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core"
asar_location="$(pwd)"
echo "found"

if [ ! -f core.asar.backup ]; then
	cp core.asar core.asar.backup
	echo "created core.asar.backup"
fi

rm -r /tmp/discord_theme &> /dev/null

echo "extracting core.asar.backup"
mkdir /tmp/discord_theme
asar e core.asar.backup /tmp/discord_theme
echo "done extracting
creating injection.js and deploying payload"

cd "$theme_root/.files"
cat injection-original.js | sed "s|{{PATH}}|$theme_root/|" > injection.js
cat payload-original.js | sed "s|{{FILE}}|$theme_root/.files/injection.js|" >> /tmp/discord_theme/app/mainScreenPreload.js
echo "injection.js created and payload deployed
repacking asar"

rm "$asar_location/core.asar"
asar p /tmp/discord_theme "$asar_location/core.asar"
echo "core.asar created.
cleaning up tmp files"

rm -r /tmp/discord_theme &> /dev/null

echo "done"