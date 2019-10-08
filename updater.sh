echo "downloading zip archive"
wget "https://github.com/recette-lemon/DiscordTheme/archive/master.zip" > /dev/null

echo "unzipping"
unzip master.zip > /dev/null

echo "overwriting files"
cp -r DiscordTheme-master/* .

echo "cleaning up"
rm -r DiscordTheme-master
rm master.zip

echo "running installer"
chmod +x install.sh && ./install.sh