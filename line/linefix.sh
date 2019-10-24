#!/bin/bash
dir=$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
for file in "$1"/*; do
  if [[ $file == *.meta ]]; then
    continue
  fi
  $dir/pngdefry -so $file
  rm $file
done
echo "All broken files have been reprocessed and deleted."
