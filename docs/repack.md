# repack, Module Fedration 플러그인

원래 **리액트 네이티브는 자체 번들러를 사용**했기 때문에, **개발자가 개입할 수 있는 방법이 제한적**이었습니다.

그런데 `callstack` 팀에서 리액트 네이티브를 위한 `webpack`인 [`repack`](https://re-pack.dev/)과 리액트 네이티브를 위해 약간 수정된 [`Module Federation`](./module-federation.md) 플러그인까지 개발해 주었습니다.

## 목차

1. [오리지널 Module Federation과 차이](#오리지널-module-federation과-차이)  
   1-1. [Federated.importModule](#federatedimportmodule)  
   1-2. [Resolver](#resolver)  
   1-3. [Host](#host)
   - [역할](#역할)
   - [제약](#제약)
   - [eager](#eager) (공식 문서와 다른 부분)
2. [정리](#정리)
3. [마치며](#마치며)

## 오리지널 Module Federation과 차이

### Federated.importModule

오리지널(브라우저용) `Module Federation`에선 외부 모듈을 가져올 때 [`import` 표현식](./module-federation.md#app1indexjs)을 썼습니다.

`repack`에서 제공하는 리액트 네이티브용 `Module Federation` 플러그인으로 빌드된 앱에서는 `Federated.importModule`를 사용해서 로드합니다.

```
import { Federated } from '@callstack/repack/client';

const NumberMain = React.lazy(() => Federated.importModule('number', './Main'));

export default () => {
  return (
    <Suspense fallback={null}>
      <NumberMain />
    </Suspense>
  )
}
```

이유는 **자바스크립트 파일을 로드(평가)하는 방법이 브라우저와 다르기 때문**입니다.

다음은 오리지널 `Module Federation`에서 자바스크립트 파일을 로드하는 방법입니다.

```
__webpack_require__.l = (url, done, key) => {
   // ...
   script = document.createElement('script'); // 스크립트 태그 생성
   script.setAttribute("data-webpack", dataWebpackPrefix + key);
   script.src = url; // src 설정

   // ...

   // 위에서 만든 스크립트 태그를 document.head에 추가하면 브라우저가 알아서 다운로드하고 실행합니다.
   document.head.appendChild(script);
}
```

`script` 태그를 만들어 `DOM`에 추가하는 방식입니다.

하지만 리액트 네이티브는 리액트 트리를 네이티브로 그려낼 뿐, 위와 같은 `DOM API`는 제공하지 않습니다.

리액트 네이트브에서 제공하는 **특별한 방법을 사용하여 스크립트를 로드해야** 합니다.

> 각 네이티브의 자바스크립트 런타임 객체의 `evaluateJavaScript` 메서드를 사용하여 로드([iOS](https://github.com/callstack/repack/blob/main/packages/repack/ios/ScriptManager.mm#L299), [안드로이드](https://github.com/callstack/repack/blob/main/packages/repack/android/src/main/cpp/NativeScriptLoader.cpp#L44))합니다.
>
> 자바스크립트 런타임 객체는 안드로이드에선 [`ApplicationContext` 객체로 부터 생성](https://github.com/callstack/repack/blob/main/packages/repack/android/src/main/java/com/callstack/repack/ScriptManagerPackage.kt#L10)할 수 있습니다.
>
> iOS에선 [`Bridge`로 부터 얻어올 수 있습니다.](https://github.com/callstack/repack/blob/main/packages/repack/ios/ScriptManager.mm#L269-L270)
>
> 자세한 설명은 생략하겠습니다.
>
> 아무튼 브라우저와 달리 스크립트를 로드하려면 좀 복잡한 방법이 필요합니다.

`Federated.importModule`의 `ScriptManager.shared.loadScript`에서 위의 동작을 수행합니다.

```
export async function importModule<Exports = any>(
  containerName: string,
  module: string,
  scope: string = 'default'
): Promise<Exports> {
  // 앱의 엔트리 객체가 있는지 확인
  if (!self[containerName]) {
    // 없다면 앱의 remoteEntry.js를 네이티브 자바스크립트 런타임에 로드
    await ScriptManager.shared.loadScript(containerName); // 스크립트의 위치를 동적으로 결정
  }

  const container = self[containerName];

  if (!container.__isInitialized) {
    container.__isInitialized = true;
    // 앱의 엔트리 객체 초기화
    await container.init(__webpack_share_scopes__[scope]);
  }

  // 앱의 엔트리 객체의 get 메서드로 원하는 모듈을 얻어와 반환합니다.
  const factory = await container.get(module);
  const exports = factory();
  return exports;
}
```

코드를 보면 오리지널 [`Module Federation`이 `import` 표현식을 컴파일한 결과](./module-federation.md#import-summary)와 동일하게 동작합니다.

즉, 컴파일된 함수를 미리 제공할 뿐이지, **오리지널과 다를게 없습니다.**

### Resolver

여기에 `Federated.importModule`은 한 가지 특별한 기능을 제공합니다.

일반적으로 브라우저 환경에서 [다른 앱의 remoteEntry.js 주소는 Module Federation 플러그인 설정에서 정적으로 정의](https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes)하고, 각 앱의 번들링 파일에 다른 앱의 **`remoteEntry.js`의 주소가 하드코딩되어 컴파일**됩니다.

하지만 `Federated.importModule`은 [`ScriptManager.shared.loadScript`](https://github.com/callstack/repack/blob/main/packages/repack/src/modules/ScriptManager/ScriptManager.ts#L336)에서 **`Resolver`를 통해 스크립트의 위치를 동적으로 결정할 수 있는 기회를 제공**합니다.

```
async loadScript(
  scriptId: string,
  caller?: string,
  webpackContext = getWebpackContext()
) {
  let script = await this.resolveScript(scriptId, caller, webpackContext);

  // script 정보로 자바스크립트 파일을 다운로드받고, 네이티브 자바스크립트 런타임에 로드
  // ...
}
```

[`Resolver`는 개발자가 직접 등록하고 해제](https://re-pack.dev/docs/module-federation#dynamic-containers-with-federatedimportmodule)할 수 있습니다.

```
import { ScriptManager, Script, Federated } from '@callstack/repack/client';

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  const resolveURL = Federated.createURLResolver({
    containers: {
      number: 'localhost:4000/[name][ext]',
    },
  });

  // resolver를 통해 실제 url 생성
  const url = resolveURL(scriptId, caller);
  if (url) {
    return { url }; // loadScript 메서드가 사용하는 script 객체
  }
});
```

### Host

리액트 네이티브의 기본 번들러로 앱을 빌드하면, 모든 자바스크립트 파일을 `index.bundle`이라는 한 개의 파일로 번들링해서 `apk`, `ipa` 파일에 `asset`으로 포함시킵니다.

`index.bundle`에서 실행되는 앱을 `Host`라고 합니다.

이러한 구조는 `repack` 번들러로 앱을 빌드해도 동일합니다.

`Module Federation` 플러그인은 `index.bundle`부터 시작해서 흩어진 외부 앱 조각(모듈)을 조금씩 불러들이는 코드를 추가하는 것뿐입니다.

#### 역할

네이티브에서 `Host` 앱은 특별한 기능을 수행해야 합니다.

1. [`AppRegistry.registerComponent`](https://reactnative.dev/docs/appregistry)로 앤트리 컴포넌트를 등록

2. `react`, `react-native`, `네이티브 라이브러리`를 즉시 초기화하고 다른 앱과 공유

리액트 네이티브 앱은 자바스크립트로만 동작하지 않습니다.

**자바스크립트로 네이티브 뷰, 모듈을 제어**합니다.

그리고 네이티브 코드는 스크립트 언어가 아니기 때문에, 동적으로 변경하는 것은 거의 불가능합니다.

따라서 네이티브 뷰, 모듈을 초기화하고 리액트 네이티브와 연동하는 코드는 설치되는 앱 내부에 있어야 합니다.

즉, **네이티브 라이브러리는 `Host`에 포함되어 초기화되고, [다른 앱을 초기화할 때 공유](./module-federation.md#import-summary)되어야** 합니다.

#### 제약

다른 앱에서 `Host` 앱에 접근할 수 없습니다.

`Host` 앱의 기능을 사용할 수 있는 유일한 방법은 `Host` 앱이 공유하는 라이브러리 모듈을 사용하는 것뿐입니다.

이것은 **`Host` 앱은 모듈을 노출할 수 없다**는 것을 의미합니다.

브라우저 환경에서도 제일 먼저 실행되고 다른 앱을 로드하는 앱을 `Host`라고 합니다.

하지만 브라우저 환경에서 `Host` 앱은 다른 앱과 차이가 없습니다.

나중에 로드되는 앱도 `Host`가 노출하는 모듈을 가져올 수 있습니다.

이것은 위에서 언급했다시피 `Host` 앱은 배포 파일에 `asset`으로 포함된 `index.bundle` 파일을 내부 자바스크립트 엔진으로 실행한 앱으로, **[다른 앱들처럼 `uri`로 접근](../shared/src/containers.ts#L32)할 수 없기 때문**입니다.

#### [eager](https://webpack.kr/plugins/module-federation-plugin/#object-syntax-with-sharing-hints)

**이 부분은 공식 문서와 다릅니다.**

`eager`는 `true`로 설정되면, 사전적 의미 그대로 모듈이 필요할 때 로드되는 것이 아니라, `remoteEntry.js`에 내장되어 `즉시` [로드(`__webpack_modules__`에 포함시키는 동작)](./module-federation.md#import-detail)됩니다.

공식 문서에서는 [`react`와 `react-native`의 `eager`를 `true`로 설정해야 한다](https://re-pack.dev/docs/module-federation#react-and-react-native-must-be-eager-and-singleton)고 명시되어 있습니다.

하지만 [`Module Fedeation`으로 빌드된 코드를 분석](./module-federation.md)했을 땐, `Host`애서만 `true`로 설정하면 되고, 나머지 앱은 `false`로 설정해도 무방해 보였습니다.

[이것 때문에 `repack issue`에 질문](https://github.com/callstack/repack/issues/462)을 올렸는데, `repack` 개발자도 기존 라이브러리를 네이티브에서 작동하도록 설정 정도만 바꾼 것에 불과하기 때문인지, **명확한 답변을 하지 못했습니다.**

그리고 [`dynamic-module-federation-example`](../README.md)에서는 [서버에 배포할 번들 파일을 만들 때(`Host` 앱이 아닌 경우)는 `eager:false`로 설정](../apps/number/webpack.config.mjs#L234)데, 예상대로 잘 작동했습니다.

**이 문제에 관심을 가졌던 이유**는 `react`와 `react-native`를 `eager:true`로 설정했을 때 용량 차이가 꽤 많이 났기 때문입니다.

`dynamic-module-federation-example`의 `number` 앱의 소스 코드를 압축했을 때 `react`와 `react-native`의 `eager` 설정에 따른 `remoteEntry.js` 파일 용량은 다음과 같았습니다.

| true  | false |
| :---: | :---: |
| 2.7Mb | 78kb  |

> `eager:false`로 했을 때 분할된 `react`, `react-native` 청크의 용량을 다 합치면 비슷하거나 오히려 더 크겠지만, 대부분 사용되지 않을 것입니다.

앱 하나당 약 `2.6Mb`의 트래픽이 더 필요합니다.

큰 용량은 아니지만, 항상 `WIFI` 환경에서 인터넷을 사용할 수 있는 것도 아니고, 제가 쓰는 요금제는 속도제한이 걸리면 `400kb/s`로 제한되는데, 이 속도로는 `앱 하나를 로드하는데 약 7초 정도`가 소요되기 때문입니다.

## 정리

결국 전체적인 흐름은 원래의 `Module Fedration`과 동일했습니다.

즉, [`react-native-dynamic-module-federation`](./react-native-dynamic-module-federation.md)을 만들 때, `repack`과 `repack`에서 수정한` Module Federation` 플러그인에 의존하는 부분은 없었습니다.

## 마치며

다양한 개발 플랫폼마다 장단점이 있지만, `repack`과 `Module Federation` 조합은 스크립트 언어로 작동하는 앱의 강점을 가장 잘 보여준 예라고 생각합니다.
