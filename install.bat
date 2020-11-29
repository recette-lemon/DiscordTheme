@echo off
if EXIST instalation.log del instalation.log>nul
:: get discord executable
:: done with a for cuz several processes but only save the first
if "%~1" == "" (
	for /f "skip=1 delims=" %%a IN ('wmic process where "name='discord.exe'" get ExecutablePath') do (
		if not defined d_exe (
			set d_exe=%%a
		)
	)
) else (
	set d_exe=%1
)
if "%d_exe%"=="" (
	echo [ERROR!] Discord needs to be running...
	pause>nul
	goto EOF
)
cls

echo --- Installer ---
echo.

echo Working...
:: set discord executable path
for %%a IN ("%d_exe%") do set d_path=%%~dpa
:: get discord version from a file
for /f "tokens=7 delims=\" %%a IN ("%d_path%") do set d_ver=%%a
for /f "tokens=2 delims=-" %%a IN ("%d_ver%") do set d_ver=%%a
:: set discord core path
if "%~3" == "" (
	set d_core=%APPDATA%\discord\%d_ver%\modules\discord_desktop_core
) else (
	set d_core=%APPDATA%\%3\%d_ver%\modules\discord_desktop_core
)

:: make a backup if it doesnt already exist
if NOT EXIST "%d_core%\core.asar.bak" (
	copy "%d_core%\core.asar" "%d_core%\core.asar.bak">nul
	echo Backed up to "%d_core%\core.asar.bak">>instalation.log
) else (
	echo Backup already exists at "%d_core%\core.asar.bak">>instalation.log
)

:: unpack asar with 7z + asar plugin
:: always unpack from backup to get unmodified files
.files\.7z\7z.exe x "%d_core%\core.asar.bak" -o"%d_core%\core\" -aoa>nul
echo Unpacked Asar to "%d_core%\core\">>instalation.log

:: modify files to point to current dir
if EXIST payload.js del payload.js>nul
for /f "delims=" %%a in (.files\payload-original.js) do (
	set _temp=%%a
	SETLOCAL EnableDelayedExpansion
		set modified=!_temp:{{FILE}}=%~dp0.files\injection.js!
		set modified=!modified:\=\\!
		echo !modified!>>payload.js
	ENDLOCAL
)
echo Modified payload.js to point to "%~dp0.files\injection.js">>instalation.log
if EXIST .files\injection.js del .files\injection.js>nul
for /f "delims=" %%a in (.files\injection-original.js) do (
	set _temp=%%a
	SETLOCAL EnableDelayedExpansion
		set modified=!_temp:{{PATH}}=%~dp0!
		if NOT "!modified!" == "!_temp!" (
			set modified=!modified:\=\\!
		)
		echo !modified!>>.files\injection.js
	ENDLOCAL
)
echo Modified injection.js to point to "%~dp0">>instalation.log

:: apply payload to mainScreenPreload
echo.>>"%d_core%\core\app\mainScreenPreload.js"
for /f "delims=^ tokens=1" %%b in (payload.js) do (
	echo %%b>>"%d_core%\core\app\mainScreenPreload.js"
)
echo Applied payload to "%d_core%\core\app\mainScreenPreload.js">>instalation.log

:: Remove contextBridge
move "%d_core%\core\app\mainScreenPreload.js" "%d_core%\core\app\_mainScreenPreload.js"
for /f "usebackq delims=" %%a in ("%d_core%\core\app\_mainScreenPreload.js") do (
	set _temp=%%a
	SETLOCAL EnableDelayedExpansion
		set modified=!_temp:contextBridge.exposeInMainWorld('DiscordNative', DiscordNative^)=window.DiscordNative=DiscordNative!
		echo !modified!>>"%d_core%\core\app\mainScreenPreload.js"
	ENDLOCAL
)
del "%d_core%\core\app\_mainScreenPreload.js"

:: disable contextIsolation and enable worldSafeExecuteJavaScript
move "%d_core%\core\app\mainScreen.js" "%d_core%\core\app\_mainScreen.js"
for /f "usebackq delims=" %%a in ("%d_core%\core\app\_mainScreen.js") do (
	set _temp=%%a
	SETLOCAL EnableDelayedExpansion
		set modified=!_temp:contextIsolation^: true=worldSafeExecuteJavaScript^: true, contextIsolation^: false!
		echo !modified!>>"%d_core%\core\app\mainScreen.js"
	ENDLOCAL
)
del "%d_core%\core\app\_mainScreen.js"

:: close discord to apply changes
if "%~2" == "" (
	taskkill /F /im discord.exe /T>nul
) else (
	taskkill /F /im %2 /T>nul
)
echo Killed discord processes to repack Asar>>instalation.log

:: pack asar
.files\.7z\7z a "%d_core%\core.asar" "%d_core%\core\*">nul
echo Repacked "%d_core%\core.asar">>instalation.log

:: cleanup
del payload.js
:: rmdir /s /q "%d_core%\core"

echo.
echo --- SUCCESS ---

:: restart discord
if "%~2" == "" (
	start "" "%d_path%Discord.exe"
) else (
	start "" "%d_path%%2"
)

:EOF
