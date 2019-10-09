#!/usr/bin/env bash
type="iphone"

if [[ "$@" == *"-a"* ]]; then
	type="android"
fi

for id in $(echo "$@" | sed "s/\-[a-zA-Z]//g"); do
	echo "downloading $id"
	wget -q "http://dl.stickershop.line.naver.jp/products/0/0/1/$id/$type/stickers@2x.zip" -O /tmp/stickers@2x.zip

	echo "unzipping"
	mkdir "$id" &> /dev/null
	unzip -u /tmp/stickers@2x.zip -d "$id" -x "*key*" -x "tab_*" &> /dev/null
done