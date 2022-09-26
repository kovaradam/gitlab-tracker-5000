#!/bin/bash

EXTENSION_DIR=extension
PUBLIC_DIR=public
ARTIFACTS_DIR=artifacts

rm -rf $EXTENSION_DIR || true

npm run build -- --outDir $EXTENSION_DIR && 


node scripts/create-manifest.mjs $PUBLIC_DIR/manifest.json $PUBLIC_DIR/extension.manifest.json > $EXTENSION_DIR/manifest.json &&

rm $EXTENSION_DIR/extension.manifest.json 

mkdir -p $ARTIFACTS_DIR 

cd $EXTENSION_DIR

zip -r ../$ARTIFACTS_DIR/extension.zip ./*

cd ..