#!/bin/bash

EXTENSION_DIR=extension

rm -rf $EXTENSION_DIR

export INLINE_RUNTIME_CHUNK=false
export BUILD_PATH=$EXTENSION_DIR

npm run build

mv $EXTENSION_DIR/extension.manifest.json $EXTENSION_DIR/manifest.json