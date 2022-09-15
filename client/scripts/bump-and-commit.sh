#!/bin/bash

UPDATE_TYPE=$1
MANIFEST_PATH=public/extension.manifest.json

node scripts/bump-up-extension-version.mjs $MANIFEST_PATH $UPDATE_TYPE && 

npx prettier --write $MANIFEST_PATH

git add $MANIFEST_PATH && 

git commit -m "bump up $MANIFEST_PATH extension version"
