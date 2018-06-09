@echo off
echo Downloading zip.
.files\.wget\wget.exe -q --show-progress -O update.zip https://github.com/masterzagh/DiscordTheme/archive/master.zip>nul
echo Applying update.
.files\.7z\7z.exe x -aoa -o.update update.zip>nul
del update.zip
del /s /q .files\*
del /s /q themes\default\*
xcopy .update\DiscordTheme-master\.files .files /s /e /y>nul
xcopy .update\DiscordTheme-master\themes\default themes\default /s /e /y>nul
xcopy .update\DiscordTheme-master\install.bat install.bat /s /e /y>nul
xcopy .update\DiscordTheme-master\install_canary.bat install_canary.bat /s /e /y>nul
xcopy .update\DiscordTheme-master\updater.bat updater.bat /s /e /y>nul && ^
rmdir /s /q .update\>nul && ^
install.bat