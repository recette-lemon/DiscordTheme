@echo off
set /p id=Sticker ID:
echo Downloading Sticker Pack...
..\.files\.wget\wget.exe -q --show-progress -O pack.zip http://dl.stickershop.line.naver.jp/products/0/0/1/%id%/iphone/stickers@2x.zip>nul
mkdir %id%
..\.files\.7z\7z.exe x -aoa -o%id% pack.zip>nul
del pack.zip
for %%a in (%id%\*key*) do del %%a
del %id%\productInfo.meta
del %id%\tab_off@2x.png
del %id%\tab_on@2x.png