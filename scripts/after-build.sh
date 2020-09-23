#! /bin/bash

if [ -n "$1" ];then

buildPath=$1
echo "build path: ${buildPath}"

mv dist/ ${buildPath}/
echo "✓ move to ${buildPath}"

fi
