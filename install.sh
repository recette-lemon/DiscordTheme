#!/usr/bin/env bash
if [ ! -x "$(command -v asar)" ]; then
	echo "asar not installed.
pacaur -S asar
apt install asar"
fi

echo "starting"

theme_root="$(pwd)"

echo "finding asar location"
cd "$HOME/.config/discord/"
cd "$(ls | grep -E ".\..\.." | sort -r | head -n 1)/modules/discord_desktop_core"
asar_location="$(pwd)"
echo "found"

if [ ! -f core.asar.backup ]; then
	cp core.asar core.asar.backup
	echo "created core.asar.backup"
fi

if [ -d /tmp/discord_theme ]; then
	rm -r /tmp/discord_theme
fi

echo "extracting core.asar.backup"
mkdir /tmp/discord_theme
asar e core.asar.backup /tmp/discord_theme
echo "done extracting
creating injection.js and payload.js"

cd "$theme_root/.files"
cat injection-original.js | sed "s|{{PATH}}|$theme_root/|" > injection.js
cat payload-original.js | sed "s|{{FILE}}|$theme_root/.files/injection.js|" > payload.js
echo "created
deploying payload"

cat payload.js >> /tmp/discord_theme/app/mainScreenPreload.js
echo "deployed
repacking asar"

rm "$asar_location/core.asar"
asar p /tmp/discord_theme "$asar_location/core.asar"
echo "core.asar created.
done"