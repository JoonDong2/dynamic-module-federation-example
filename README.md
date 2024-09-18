# Dynamic Module Federation Example

리액트 네이티브 **앱을 재실행없이, 앱 사용중**(스크린 스택 등 기존 상태 유지)**에 부분 업데이트**할 수 있는 방법을 소개합니다.

## 블로그

- 프로젝트 소개 (https://joondong.tistory.com/191)
- 코드 설명 (https://joondong.tistory.com/192)
- Module Federation 정리 (https://joondong.tistory.com/189)
- 리액트 네이티브용 Module Fedration 다른점 (https://joondong.tistory.com/190)

## 최종 결과물 영상

https://youtu.be/UJLjYEa0_QE

### 테스트 환경

- `CPU: Intel`
- `OS: MacOS 14.4.1` (맥OS 전용 스크립트 명령어를 사용해서 윈도우, 리눅스에서 사용 불가)
- `Node: 20.12.1`
- `JDK: OpenJDK 17.0.11` (Microsoft)
- `ruby: 2.7.6`
- `모바일 OS: 안드로이드 API 34` (iOS는 의존성 설치 후 개발 전 한 번만 실행하고 테스트 안했습니다.)
- `장치: 에뮬레이터` (localhost:4000번을 서버로 이용했기 때문에, 실제 장치는 localhost 연결하는 작업 필요)

### 테스트 방법

스크립트를 만들어 놓았기 때문에, 루트 경로에서 실행하면 됩니다.

1. `npm i` (모든 라이브러리 및 앱의 의존성 설치)
2. `npm run deploy:android:all` 모든 앱 배포 (배포 서버 자동 실행)
3. `npm run android:host:staging host` (`host` 앱 실행, 실패하면 에뮬레이터가 완전히 켜질 때까지 기다렸다 다시 실행)
4. `npm run android:host:staging number` (`number` 앱 실행)
5. `apps/number/src/constants.ts 파일에서` 앱 고유색 변경
6. `npm run deploy:android number` (`number` 앱 배포, 버전 자동 지정)
7. `host` 앱에서 `앱 업데이트` 버튼 클릭
