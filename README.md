### 테스트 환경

- `OS: 맥` (맥OS 전용 스크립트 명령어를 사용해서 윈도우, 리눅스에서 사용 불가)
- `Node: 20.12.1`
- `JDK: OpenJDK 17.0.11` (Microsoft)
- `ruby: 2.7.6`
- `모바일 OS: 안드로이드 API 34` (iOS에서 테스트 안해봤습니다.)
- `장치: 에뮬레이터` (localhost:4000번을 서버로 이용했기 때문에, 실제 장치는 localhost 연결하는 작업 필요)

### 모든 프로젝트 의존성 설치

```
npm run install
```

### 모든 패키지 한 번에 배포 (버전 0.0.1 자동 증가)

```
npm run deploy:android:all
```

### 특정 앱만 배포

```
npm run deploy:android <앱 이름>
```

### 호스트 실행

```
npm run android:host:staging <앱 이름>
ex) npm run android:host:staging host
ex) npm run android:host:staging number
```
