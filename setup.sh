#!/bin/bash
[ "$1" == "no-npm" ] || npm install -g typescript
[ "$1" == "no-npm" ] || npm install
(cd src/backend && tsc)
(cd src/frontend/common && tsc)
(cd src/frontend/index-member && tsc)
cd public/javascripts
rm ./*.min.js 2>/dev/null
for file in ./*.js; do
    java -jar ../../closure_compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js "$file" > "$(basename "$file" .js).min.js"
done
