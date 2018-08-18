@echo off
echo Downloading zip.
.files\.wget\wget.exe -q --show-progress -O update.zip https://github.com/masterzagh/DiscordTheme/archive/master.zip>nul
echo Applying update.
.files\.7z\7z.exe x -aoa -o.update update.zip>nul
del update.zip
del /s /q .files\*
del .update\DiscordTheme-master\.gitattributes
del .update\DiscordTheme-master\.gitignore
del .update\DiscordTheme-master\README.md
xcopy .update\DiscordTheme-master\updater.bat .update\ /s /e /y>nul
xcopy .update\DiscordTheme-master\* .\ /s /e /y>nul
xcopy .update\updater.bat updater.bat /s /e /y>nul && ^
rmdir /s /q .update\>nul && ^
install.bat
