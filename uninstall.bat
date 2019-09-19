@echo off
if EXIST instalation.log del instalation.log>nul
:: get discord executable
:: done with a for cuz several processes but only save the first
for /f "skip=1 delims=" %%a IN ('wmic process where "name='discord.exe'" get ExecutablePath') do (
	if not defined d_exe (
		set d_exe=%%a
	)
)
if "%d_exe%"=="" (
	echo [ERROR!] Discord needs to be running...
	pause>nul
	goto EOF
)
cls

echo --- Uninstaller ---
echo.

echo Working...
:: set discord executable path
for %%a IN ("%d_exe%") do set d_path=%%~dpa
:: get discord version from a file
for /f "tokens=7 delims=\" %%a IN ("%d_path%") do set d_ver=%%a
for /f "tokens=2 delims=-" %%a IN ("%d_ver%") do set d_ver=%%a
:: set discord core path
set d_core=%APPDATA%\discord\%d_ver%\modules\discord_desktop_core

:: kill discord to be able to replace the file
taskkill /F /im discord.exe /T>nul

:: make backup if it doesnt already exist
if EXIST "%d_core%\core.asar.bak" (
	move "%d_core%\core.asar.bak" "%d_core%\core.asar">nul
)

echo.
echo --- SUCCESS ---

:: restart discord
start "" "%d_path%Discord.exe"

:EOF
