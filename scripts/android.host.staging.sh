#!/bin/bash

NAME=$1
echo $NAME

if [ -z $NAME ]; then
  echo "앱 이름을 입력해 주세요"
  exit 1
fi

SCRIPT_DIR=$(readlink -f "$(dirname "$0")")
ROOT=$SCRIPT_DIR/..

(cd "$ROOT" && npm run server)

echo "${NAME}을 staging 모드로 실행합니다."

(cd "$ROOT/apps/$NAME" && npm run android:host:staging)
