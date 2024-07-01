#!/bin/bash

# 에뮬레이터 실행 여부 확인
emulator_check=$(adb devices | grep -w "emulator" | awk '{print $1}')

# 에뮬레이터가 실행 중인지 확인
if [ -n "$emulator_check" ]; then
    echo "${emulator_check}가 이미 실행중입니다."
    exit 0
fi

# ANDROID_HOME 설정
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
fi

# ANDROID_AVD_HOME 설정
if [ -z "$ANDROID_AVD_HOME" ]; then
    export ANDROID_AVD_HOME="$HOME/.android/avd"
fi

# AVD 디렉토리 확인
avd_dir="$ANDROID_AVD_HOME"

# AVD 디렉토리가 존재하지 않으면 종료
if [ ! -d "$avd_dir" ]; then
    echo "AVD directory not found: $avd_dir"
    exit 1
fi

# 에뮬레이터 리스트 가져오기
emulator_list=$(ls "$avd_dir" | grep "\.ini$" | sed 's/\.ini$//')

# 에뮬레이터 리스트 배열로 변환
emulator_array=($emulator_list)

# 에뮬레이터가 없는 경우 메시지 출력 후 종료
if [ ${#emulator_array[@]} -eq 0 ]; then
    echo "No Android emulators found."
    exit 1
fi

# 에뮬레이터 리스트 출력
echo "Available Android Emulators:"
for i in "${!emulator_array[@]}"; do
    echo "$((i+1)). ${emulator_array[i]}"
done

# 사용자로부터 번호 입력받기
read -p "사용할 에뮬레이터 번호를 입력해 주세요: " emulator_number

# 입력된 번호가 유효한지 확인
if ! [[ "$emulator_number" =~ ^[0-9]+$ ]] || [ "$emulator_number" -lt 1 ] || [ "$emulator_number" -gt "${#emulator_array[@]}" ]; then
    echo "Invalid number. Exiting."
    exit 1
fi

# 선택된 에뮬레이터 이름 가져오기
selected_emulator=${emulator_array[$((emulator_number-1))]}

# 선택된 에뮬레이터 실행
echo "${selected_emulator}를 실행합니다."

# 새로운 터미널 창에서 에뮬레이터 실행
osascript -e "tell application \"Terminal\" to do script \"${ANDROID_HOME}/emulator/emulator -avd '${selected_emulator}'\""