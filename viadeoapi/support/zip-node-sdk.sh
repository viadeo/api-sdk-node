#!/bin/bash
cd $(dirname $0)/../..
FILE=/tmp/viadeoapi-node.zip
zip -ry $FILE $(find viadeoapi/ -type f | grep -v svn | grep -v tests)
echo $FILE
