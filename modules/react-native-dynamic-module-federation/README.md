# react-native-dynamic-module-federation

## ReactNativeDynamicModuleFederationPlugin

[`ModuleFederationPlugin`에 입력한 `name` 속성만 동일하게 입력](../apps/number/webpack.config.mjs#L233-L241)해야 합니다.

```
// webpack.config.js
import packageJson from './package.json' with { type: "json" };

const {name} = packageJson

export default () => {
  return {
    // ...
    plugins: [
      // ...
      new Repack.plugins.ModuleFederationPlugin({
        name,
        // ...
      }),
      new ReactNativeDynamicModuleFederationPlugin({name}),
    ]
  }
}
```

### DinamicImportProvider

[`DynamicImportManager`](<(#dynamicimportmanager)>) 객체를 입력합니다.

컨테이너(미니앱)를 가져오는 방법을 `DynamicImportManager` 객체에 위임합니다.

`suspense`: 컨테이너를 가져오는 중일 때 `Promise`를 외부로 던집니다.

`throwError`: 컨테이너를 가져오는 중에 오류가 발생했을 때 `Error` 객체를 외부로 던집니다.

```
const App = () => {
  return (
    <DynamicImportProvider manager={manager} suspense throwError>
      <Main />
    </DynamicImportProvider>
  );
};
```

`children`에서 다음 훅을 사용할 수 있습니다.

- `useContainers`: 컨테이너(미니앱) 정보를 가져올 수 있스빈다.

- `useDynamicImportManager`: `DynamicImportManager` 객체를 가져옵니다.

- [`useDynamicLazy`](#usedynamiclazy)

- [`useDynamicModule`](#usedynamicmoudle)

### [DynamicImportManager](./src/DynamicImportManager.ts)

[`DinamicImportProvider`](#dynamicimportprovider)를 컴포넌트를 내외부에서 관리합니다.

- **fetchContainers (required)**

  모든 컨테이너(미니앱) 주소를 가져노는 방법을 정의해야 합니다.

  `DinamicImportProvider`가 마운트되거나 `DynamicImportManager` 객체의 `refreshContainers` 메서드를 호출하면 실행됩니다.

  ```
  {
    "entry": "0.0.1/android/staging/entry/0.0.3",
    "number": "0.0.1/android/staging/number/0.0.1",
  }
  ```

- **fetchContainer (optional)**

  특정 컨테이너 주소를 가져오는 방법만 정의할 수 있습니다.

  `DynamicImportManager` 객체의 `refreshContainer` 메서드를 호출하면 실행됩니다.

- **errorManager (optional)**

  [`DynamicErrorManager`](#dynamicerrormanager) 클래스를 입력합니다. (객체 아님!!)

  내부에서 자신을 매개변수로 `DynamicErrorManager` 객체를 생성합니다.

  `DynamicImportManager` 객체는 컨테이너(미니앱) 스크립트 파일을 다운로드받고 평가(로드)하는 중에 발생한 오류를 `DynamicErrorManager` 객체에 위임합니다.

- **deleteCacheFilesWhenRefresh (optional)**

### [DynamicImportErrorManager](./src/ErrorManager.ts)

생성자로 `DynamicImportManager` 객체를 받을 수 있고, onError 메서드를 정의해야 합니다.

`apps`의 모든 앱이 공통으로 사용하고 있는 [`ErrorManager`](../../shared/src/containers.ts#L68) 참고

### [useDynamicLazy](./src/useDynamicLazy.tsx)

다른 앱에서 노출하고 있는 컴포넌트를 `Lazy 컴포넌트`로 만들어 반환합니다.

엘리먼트로 변환되어 사용될 때, 아직 스크립트를 로드하지 않았다면 `Promise`를 던집니다.

`Lazy 컴포넌트`는 로드되는 시간이 걸리고, 로드될 지도 확실히 알 수 없기 때문에, `Suspense`와 `ErrorBondary`와 함께 사용하는 것이 알반적이라, `fallback`에 엘리먼트만 입력하면, 각 `fallback`에 맞는 `Wrapper`로 자동으로 래핑해 줍니다.

```
const Main = () => {
  setTimeout(() => {
    awesome.multiply(2, 3);
  });
  const Entry = useDynamicLazy('entry', './Entry', {
    error: {
      fallback: <Text>Main 오류</Text>,
    },
    suspenes: {
      fallback: <Text>Main 로딩중</Text>,
      timeout: 3000,
    },
  });

  return <Entry />;
};
```

훅과 자동 래핑만 제외하면 [`Federated.importModule`](https://re-pack.dev/docs/module-federation#dynamic-containers-with-federatedimportmodule)과 동일합니다.

### [useDynamicModule](./src/useDynamicModule.tsx)

사실 `useDynamicLazy`는 다른 컨테이너가 노출하는 모듈을 컴포넌트라고 가정한 것이고, 해당 훅은 다른 컨테이너가 노출하는 모듈을 그대로 반환합니다.

```
const Detail = () => {
  const {module} = useDynamicModule<{alertNumber: (number: number) => void}>(
    'number',
    './number/utils',
  );
  const alertNumber = module?.alertNumber;

  return (
    <Pressable
      onPress={() => {
        alertNumber?.(123);
      }}
      <Text>button/Text>
    </Pressable>
  )
}
```
