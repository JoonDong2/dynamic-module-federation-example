#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
ROOT=$SCRIPT_DIR/..

echo "apps 폴더에 포함된 모든 앱과 containers-server의 의존성을 설치합니다."

# modules 폴더의 모든 하위 폴더에서 npm install 실행
for dir in $ROOT/modules/*; do
  if [ -d "$dir" ]; then
    echo "Running npm install in $dir"
    (cd "$dir" && npm install)
  fi
done

# shared 폴더에서 npm install 실행
if [ -d "$ROOT/shared" ]; then
  echo "Running npm install in shared"
  (cd "$ROOT/shared" && npm install)
fi

# apps 폴더의 모든 하위 폴더에서 npm install 실행
for dir in $ROOT/apps/*; do
  if [ -d "$dir" ]; then
    echo "Running npm install in $dir"
    (cd "$dir" && npm install)
  fi
done

# server 폴더에서 npm install 실행
if [ -d "$ROOT/containers-server" ]; then
  echo "Running npm install in containers-server"
  (cd "$ROOT/containers-server" && npm install)
fi

echo "설치 완료!!"