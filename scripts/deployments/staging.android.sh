#!/bin/zsh

NAME=$1
AUTO=$2

if [[ "$NAME" =~ "host" ]]; then
  echo "host는 배포하지 않습니다."
  exit 1
fi

SCRIPT_DIR=$(readlink -f "$(dirname "$0")")

ROOT=$SCRIPT_DIR/../../apps/$NAME

if [ ! -d "$ROOT" ]; then
  echo "앱이 존재하지 않습니다: $ROOT"
  exit 1  
fi

(cd "$SCRIPT_DIR/../../" && npm run server)

cp $ROOT/env/.env.host.development .env

export $(grep -E '^(NATIVE_VERSION)=' .env | xargs)

PACKAGE_JSON="$ROOT/package.json"

NAME=$(grep '"name"' "$PACKAGE_JSON" | awk -F '"' '{print $4}')

RESPONSE=$(curl --noproxy localhost "localhost:4000/container/$NAME?native_version=$NATIVE_VERSION&os=android&env=staging")
LAST_VERSION=$(echo $RESPONSE | grep -o "\"$NAME\":[^,}]*" | cut -d':' -f2 | sed 's/"//g' | tr -d '[:space:]')

echo "현재 최신 버전: $LAST_VERSION"

if [ -z "$LAST_VERSION" ]; then
  LAST_VERSION="0.0.0"
fi


# 버전 번호를 마침표(.)를 기준으로 분할
IFS='.' read -r -a version_parts <<< "$LAST_VERSION"

# 패치 버전 증가 (배열의 마지막 요소)
((version_parts[2]++))

# 증가된 버전 번호 다시 결합
DEFAULT_VERSION="${version_parts[0]}.${version_parts[1]}.${version_parts[2]}"
VERSION=$DEFAULT_VERSION

if ! [[ $AUTO =~ "auto" ]]; then
  read -p "배포할 버전 ${DEFAULT_VERSION} 맞으면 엔터, 아니면 다른 버전 입력:" VERSION
fi

if [ -z "$VERSION" ]; then
  VERSION="$DEFAULT_VERSION"
fi

# 정규 표현식 패턴
VERSION_PATTERN="^[0-9]+\.[0-9]+\.[0-9]+$"

# 문자열이 패턴과 일치하는지 확인
if ! [[ $VERSION =~ $VERSION_PATTERN ]]; then
  echo "세 자리 버전 형태가 아닙니다. ($VERSION)"
  exit 1
fi

echo "[ $NAME ${DEFAULT_VERSION} 버전 배포] "

DEPLOY_URL="localhost:4000/deployment"

SOURCE_DIR="$ROOT/build/generated/android"

rm -rf "$SOURCE_DIR"

cd "$ROOT"

npm run bundle:android

# 압축된 파일을 저장할 경로 및 파일명
ZIP_FILE="archive.android.zip"

cd "$SOURCE_DIR"

# 압축 파일 생성
zip -r "$ZIP_FILE" ./

# POST 요청으로 압축 파일 전송
curl --noproxy localhost -X POST "$DEPLOY_URL" -F "archive=@./$ZIP_FILE" -F "name=${NAME}" -F "os=android" -F "version=${VERSION}" -F "native_version=${NATIVE_VERSION}" -F "env=staging"

# 임시로 생성한 압축 파일 삭제 (선택 사항)
rm -rf "./$ZIP_FILE"