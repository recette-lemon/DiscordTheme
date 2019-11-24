#!/bin/bash
dir=$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
for file in "$1"/*; do
	if [[ $file == *.meta ]]; then
		continue
	fi
	if [[ "$($dir/pngfix $file)" =~ "CgBI" ]]; then
		$dir/pngdefry -so $file
		rm $file
	fi
done
echo "All broken files have been reprocessed and deleted."
