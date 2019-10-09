# Discord Theme Linux Version

Fork of Manuel's thing to support linux. Bash replacements for the batch files, and directory structure fixed for linux.

Tested and seems to be working on Manjaro and Ubuntu and Arch Linux.

I'll get around to replacing the rest of the batch files in a bit.

This theme enables you to set custom css and js to run inside discord.

It comes with a default css theme and some aditional functions coded in.

![ss](https://i.imgur.com/m8s5iSj.png)

## Installing
* Install Asar package
  * Universal: `npm install asar`
  * Ubuntu: `snap install asar`
  * Arch/Manjaro: `pacman -S asar`
* Download the zip or clone the project.
* Run `install.sh`.

## Problems

After a discord update the theme might break. If that happens try installing it again.

If that doesn't solve it then it might be fixed soon, but just in case it doesn't you can always open a pull request.

## Update

To update just run the `updater.sh`. If it fails or breaks the theme just re-download the zip.

## Uninstall

To uninstall just run the `uninstall.sh`.

## Features

### Custom CSS
* CSS is added in a folder under the `themes` folder.
* All CSS files in a theme folder will be ran.
* A default theme already exists which adds a background image to discord.
* Themes can be selected via the expanded discord settings.

![ss](https://i.imgur.com/OgEWRIY.png)

### Custom JS
* Custom JS should be put in the `code` folder.
* Several variables created in the core theme files are accessible here.
* Please check the files under `.files\.js` and `.files\.js-before-load` for functions you may want to expand.

## Extra Discord Features

### Commands
Run `/help` for a list of commands

### Context Menu
Some extra options have been added to different context menus.
* User
  * Get Info
* Message
  * React With Text ( Will open a command line with the command `/react` ready to post )
* Image
  * Search Image On ( Reverse Image Search )
  * Save Attachment As ( Saves image to specified location )

### LINE Stickers

* LINE Stickers can be added by using `get_stickers.sh`, with the ids as args. E.g., `get_stickers.sh id id id`.
* The id is the number in the sticker url.
* The default platform is iphone ( for better resolution ). If that fucks up, use `-a` to get the android version.

![ss](https://i.imgur.com/hv6wPqz.png)

### Other Settings

All Settings are turned off by default, so make sure you turn them on if you want them.

![ss](https://i.imgur.com/NxzwJdS.png)
