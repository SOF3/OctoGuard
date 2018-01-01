#!/bin/bash
[ "$1" == "no-npm" ] || npm install -g typescript
[ "$1" == "no-npm" ] || npm install

echo Compiling backend
(cd src/backend && tsc)
echo Compiling frontend common.js
(cd src/frontend/common && tsc)
echo Compiling frontend index-member.js
(cd src/frontend/index-member && tsc)

cd public/javascripts
echo Minifying common.js
rm ./*.min.js 2>/dev/null
java -jar ../../closure_compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js "common.js" > "common.min.js"

echo Minifying index-member.js
echo "(function(){" > index-member.js.tmp
cat index-member.js >> index-member.js.tmp
echo "})()" >> index-member.js.tmp
java -jar ../../closure_compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js "index-member.js.tmp" > "index-member.min.js"
#rm index-member.js.tmp
