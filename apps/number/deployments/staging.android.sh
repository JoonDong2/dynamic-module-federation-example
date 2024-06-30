#!/bin/zsh

SCRIPT_DIR=$(dirname "$0")

ROOT=$SCRIPT_DIR/../

cp $ROOT/env/.env.host.development .env

export $(grep -E '^(NATIVE_VERSION)=' .env | xargs)

PACKAGE_JSON="${SCRIPT_DIR}/../package.json"

NAME=$(grep '"name"' "$PACKAGE_JSON" | awk -F '"' '{print $4}')
DEFAULT_VERSION=$(grep '"version"' "$PACKAGE_JSON" | awk -F '"' '{print $4}')

read -p "버전 ${DEFAULT_VERSION} 맞으면 엔터, 아니면 다른 버전 입력:" VERSION

if [ -z "$VERSION" ]; then
  VERSION="$DEFAULT_VERSION"
fi

DEPLOY_URL="localhost:4000/deployment"

SOURCE_DIR="$ROOT/build/generated/android"

rm -rf "$SOURCE_DIR"

cd "$ROOT"

npm run bundle:android

# 압축된 파일을 저장할 경로 및 파일명
ZIP_FILE="archive.android.zip"

cd "$SOURCE_DIR"

echo "$SOURCE_DIR"

# 압축 파일 생성
zip -r "$ZIP_FILE" ./

# POST 요청으로 압축 파일 전송
curl -X POST "$DEPLOY_URL" -F "archive=@./$ZIP_FILE" -F "name=${NAME}" -F "os=android" -F "version=${VERSION}" -F "native_version=${NATIVE_VERSION}" -F "env=staging"

# 임시로 생성한 압축 파일 삭제 (선택 사항)
rm -rf "./$ZIP_FILE"