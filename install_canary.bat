@echo off
if EXIST instalation.log del instalation.log>nul
:: get discord executable
:: done with a for cuz several processes but only save the first
for /f "skip=1 delims=" %%a IN ('wmic process where "name='DiscordCanary.exe'" get ExecutablePath') do (
	if not defined d_exe (
		set d_exe=%%a
	)
)
install.bat %d_exe% DiscordCanary.exe discordcanary
