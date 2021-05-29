#!/usr/bin/env bash
theme_root="$(pwd)"

echo "finding asar location"
cd "$HOME/.config/discord/" &> /dev/null || cd "$HOME"/snap/discord/??/.config/discord
chmod +w quotes.json
sed "s/{{USER}}/$USER/g" "$theme_root/.files/quotes.json" > quotes.json
chmod -w quotes.json
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core" &> /dev/null || { echo >&2 "asar location not found. exiting"; exit 1; }
asar_location="$(pwd)"

if [ ! -f index.js.backup ]; then
	cp index.js index.js.backup
	echo "created index.js.backup"
fi

echo "creating injection.js and deploying preload and index"
cd "$theme_root/.files"
sed "s|{{PATH}}|$theme_root/|" injection-original.js > injection.js
sed "s|{{FILE}}|$theme_root/.files/injection.js|" preload-original.js > "$asar_location/preload.js"
cp index.js "$asar_location/index.js"
cp -r .node/* "$asar_location/"

echo "done"
