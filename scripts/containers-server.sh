#!/bin/bash

KEY="123"

SCRIPT_DIR=$(readlink -f "$(dirname "$0")")
ROOT=$SCRIPT_DIR/..

open_containers_server() {
  echo "localhost:4000에서 containers-server를 실행시킵니다."
osascript <<END
tell application "Terminal"
    activate
    do script "cd ${ROOT}/containers-server; npm run start;"
end tell
END

  sleep 5
  echo ""
}

nc -zv "localhost" "4000"
RESULT=$?

# 4000번 포트가 열려있지 않은 경우 -> 바로 서버 실행
if ! [ "$RESULT" -eq 0 ]; then
  open_containers_server
else
  # containers-server인지 확인
  RESPONSE=$(curl -s "localhost:4000/status?key=$KEY")
  RECEIVED_KEY=$(echo $RESPONSE | grep -o '"key":[^,}]*' | cut -d':' -f2 | sed 's/"//g' | tr -d '[:space:]')
  # 아니면 4000번 포트 가져올 것인지 물어보기
  if ! [ $RECEIVED_KEY == $KEY ]; then
    read -p "4000번 포트를 종료하고, containers-server를 실행합니다. (y)  " EXIT_4000
    if [ $EXIT_4000 == 'y' ]; then
      PID=$(lsof -t -i :4000 -s TCP:LISTEN -P)
      kill -9 $PID
      open_containers_server
    # 거절하면 종료
    else
      echo "containers-server는 localhost:4000번에서 실행되어야 합니다."
      exit 1
    fi
  else
    echo "이미 containers-server가 실행중입니다."
  fi
fi
