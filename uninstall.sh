echo "starting
finding asar location"
cd "$HOME/.config/discord/"
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core"

echo "replacing core.asar with backup"
rm core.asar
mv core.asar.backup core.asar

echo "backup restored."