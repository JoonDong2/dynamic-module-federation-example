# react-native-dynamic-module-federation

### DinamicImportProvider

`fetchContainers` 함수를 외부에서 입력받고, 해당 함수를 사용하여 `containers` 정보를 사용하여 `@callstack/reapck/client.ScriptManager`의 `resolver`를 만들고 등록합니다.

`containers`는 `키`가 `앱 이름`이고, `값`이 `경로`인 객체입니다.

```
{
  "entry": "0.0.1/android/staging/entry/0.0.3",
  "number": "0.0.1/android/staging/number/0.0.1",
}
```

`containers`를 `Context Provider`를 통해 `children`에 공유합니다.

`containers` 정보는 `children`에서 `useDynamicLazy`(컴포넌트인 경우), `useDynamicModule`(객체인 경우) 훅을 사용하여 다른 앱의 `exposes`를 가져올 때, 기존 객체를 바꿔야 하는지 판단하기 위해 사용됩니다.

### createDynamicImport

`DynamicImport` 객체를 만들어 반환합니다.

`DynamicImport` 객체는 `DinamicImportProvider`와 `DinamicImportProvider`를 `외부에서!! 제어`하는 메서드를 제공합니다.

리액트 환경 외부에서 업데이트를 트리거할 수 있습니다.

> #### 사용 예 (각 미니 앱의 `App.tsx` 참고)

```
import {AppState} from 'react-native';

const DynamicImport = createDynamicImport({
  fetchContainers,
  deleteCacheFilesWhenRefresh: false,
  suspense: true,
});

let appState = AppState.currentState;

// inactive 무시
AppState.addEventListener('change', nextAppState => {
  if (appState === 'background' && nextAppState === 'active') {
    DynamicImport.refresh();
  }

  appState = nextAppState;
});
```

### useDynamicLazy

다른 앱에서 노출하고 있는 객체 컴포넌트 `Lazy 컴포넌트`로 만들어 반환합니다.

`컴포넌트!!`이므로, 엘리먼트로 변환되어 사용될 때, 아직 스크립트를 로드하지 않았다면 `Promise`를 던집니다.

> #### 사용 예

```
const NumberDetail = useDynamicLazy('number', './number/screens/Detail', {
  fallbacks: {
    suspense: <Text>NumberDetail 로딩중</Text>,
    error: <Text>NumberDetail 오류</Text>,
  },
});
```

`Lazy 컴포넌트`는 로드되는 시간이 걸리고, 로드될 지도 확실히 알 수 없기 때문에, `Suspense`와 `ErrorBondary`와 함께 사용하는 것이 알반적이라, `fallback`에 엘리먼트만 입력하면, 각 `fallback`에 맞는 `Wrapper`로 자동으로 래핑해 줍니다.

훅과 자동 래핑만 제외하면 [`Federated.importModule`](https://re-pack.dev/docs/module-federation#dynamic-containers-with-federatedimportmodule)과 동일합니다.
