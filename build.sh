#!/usr/bin/env sh
echo "Start building..."
rm -rf content
echo "Building coffee's"
coffee -o content -c content.coffee
echo "Copying the SDK's"
cp ./content.coffee/sdk/ -r ./content/
echo "Building the xpi"
koext build --unjarred -d ./ -o ./builds/
echo "Removing temporary folder build/"
rm -rf ./build/
