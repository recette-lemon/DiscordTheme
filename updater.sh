#!/usr/bin/env bash
echo "

#quit if something fails
set -e

echo 'downloading zip archive'
wget -P /tmp/ 'https://github.com/recette-lemon/DiscordTheme/archive/master.zip' &> /dev/null

echo 'unzipping'
unzip -u /tmp/master.zip -d /tmp/ > /dev/null

echo 'overwriting files'
cp -r /tmp/DiscordTheme-master/* .

echo 'cleaning up'
rm -r /tmp/DiscordTheme-master
rm /tmp/master.zip

echo 'running installer'
chmod +x install.sh && ./install.sh" | bash
