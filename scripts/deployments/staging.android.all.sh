#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
ROOT=$SCRIPT_DIR/../..

echo "모든 앱을 배포합니다."

# apps 폴더의 모든 하위 폴더에서 npm install 실행
for dir in $ROOT/apps/*; do
  if [ -d "$dir" ]; then
    NAME=$(basename "$dir")
    if ! [[ $NAME =~ "host" ]]; then
      (cd "$ROOT" && npm run deploy:android $NAME auto)
    fi
    
  fi
done
