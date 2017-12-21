#!/bin/bash
echo Public source ts=\>js
echo ====================
cd "$(dirname "$0")"
rm -r public/javascripts/* 2>/dev/null
(cd src/frontend && tsc --listEmittedFiles true)
