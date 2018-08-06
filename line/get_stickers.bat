@echo off
:start
set id=
set type=
set /p id=Sticker ID:
set /p type=Type(iphone/android):
if NOT "%type%" == "android" (
	set type=iphone
)
echo Downloading Sticker Pack "%id%" For "%type%"...
..\.files\.wget\wget.exe -q --show-progress -O %id%.zip http://dl.stickershop.line.naver.jp/products/0/0/1/%id%/%type%/stickers@2x.zip>nul
if EXIST %id% (
	del %id%\* /q /f
) else (
	mkdir %id%
)
..\.files\.7z\7z.exe x -aoa -o%id% %id%.zip>nul
del %id%.zip
for %%a in (%id%\*key*) do del %%a
for %%a in (%id%\tab_*) do del %%a
rem del %id%\productInfo.meta
cls
echo Download Another One.
echo.
goto :start