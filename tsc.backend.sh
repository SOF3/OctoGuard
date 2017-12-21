#!/bin/bash
echo Node source ts=\>js
echo ==================
cd "$(dirname "$0")"
rm -r gen/* 2>/dev/null
(cd src/backend && tsc --listEmittedFiles true)
