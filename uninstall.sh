echo "starting
finding asar location"
cd "$HOME/.config/discord/"
cd "$(ls | grep -E ".\..\.." | sort | tail -n 1)/modules/discord_desktop_core"
asar_location="$(pwd)"
echo "found"

rm core.asar
mv core.asar.backup core.asar

echo "backup restored."