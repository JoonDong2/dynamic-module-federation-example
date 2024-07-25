# React Native Dynamic Module Federation

로드된 앱을 삭제하는 코드를 `Module Federation`이 만들어낸 파일에 추가합니다.

이 코드를 사용하여 앱 버전이 변경이 감지되면, 기존 앱을 삭제하고, 새로운 앱을 로드합니다.

## 목차

1. [아이디어](#아이디어)
2. [ReactNativeDynamicModuleFederationPlugin](#reactnativedynamicmodulefederationplugin)  
   2-1. [코드를 추가하는 방법](#코드를-추가하는-방법)  
   2-2. [기존 앱을 삭제하는 코드](#기존-앱을-삭제하는-코드)
   - [엔트리 객체](#엔트리-객체)
   - [webpackJsonpCallback](#webpackjsonpcallback)
3. [DynamicImportProvider](#dynamicimportprovider)
4. [useImportLazy, useDynamicModule](#useimportlazy-useimportmodule)
5. [DynamicImportManager](#dynamicimportmanager)
6. [마치며](#마치며)

## 아이디어

처음엔 [`repack`](https://velog.io/@joondong2/repack%EA%B3%BC-Module-Federation)과 [`Module Fedration`](https://velog.io/@joondong2/Module-Federation-%EB%B6%84%EC%84%9D) 동작 방식이 궁금해서 플러그인 내부와 번들링된 코드를 분석하다가 이런 생각을 하게 되었습니다.

`Federated.importModule` 호출 위치를 리액트 컴포넌트 안으로 가져와서 앱의 `uri`를 의존성으로 하여 메모이제이션하면 어떨까?

그리고 `uri`와 [`Script Manager`](https://velog.io/@joondong2/repack%EA%B3%BC-Module-Federation#script-resolver)를 필요에 따라 변경하면, 런타임에 특정 특정 모듈만 업데이트하는 것이 가능할 것 같았습니다.

## [ReactNativeDynamicModuleFederationPlugin](../modules/react-native-dynamic-module-federation/README.md)

`Module Federation` 시스템에서 한번 로드된 앱과 해당 앱에서 로드한 모듈은 캐싱되기 때문에, 컴포넌트 안에서 `Federated.importModule`를 실행한다고 해서 스크립트를 새로 받아오지 않습니다.

따라서 `Federated.importModule`를 실행하기 전에 앱의 캐시를 제거해야 합니다.

`ReactNativeDynamicModuleFederationPlugin`은 `Module Federation`이 만들어낸 파일에 로드된 앱을 삭제하는 함수를 추가합니다.

### 코드를 추가하는 방법

> 이 섹션을 읽기 전에 `webpack`의 동작 원리에 대해 알면 좋을 것 같습니다.  
> [Webpack 내부 동작 원리 이해 - Eunsu Kim](https://blog.eunsukim.me/posts/making-webpack-plugin-1-how-webpack-works)

`ReactNativeDynamicModuleFederationPlugin` 플러그인에서 원하는 위치에 코드를 추가하는 방법은 여러가지가 있지만, `${앱이름}.container.bundle` 엔트리 파일(청크)에 엔트리 모듈을 추가하는 방식을 사용했습니다.

파일에 모듈을 추가하는 방법은 독특합니다.

[`Compilation` 객체의 `dependencyFactories`에 **`Dependency` 클래스와 팩토리 객체 쌍**을 저장](../modules/react-native-dynamic-module-federation/src/webpack/ReactNativeDynamicModuleFederationPlugin.js#L20-L25)해 놓습니다.

```
compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
  compilation.dependencyFactories.set(
    ReactNativeDynamicModuleFederationDependency,
    new ReactNativeDynamicModuleFederationModuleFactory()
  );
});
```

이 상태로는 아무런 동작을 하지 않습니다.

사용 예정인 데이터를 미리 저장해 놓은 것뿐입니다.

그리고 [`make` 타임](https://webpack.js.org/api/compiler-hooks/#make)에 `Compilation` 객체의 `addEntry` 메서드에 `Dependency` 객체와 타겟 파일(청크) 이름을 넣어서 실행하면 끝입니다.

```
const dep = new ReactNativeDynamicModuleFederationDependency(name); // Dependency 객체
dep.loc = { name };
compilation.addEntry(
  compilation.options.context,
  dep, // Dependency 객체
  { filename: `${name}.container.bundle` }, // 타겟 청크 이름
  (error) => {
    if (error) return callback(error);
    callback();
  }
);
```

> 여기서 사용된 `${name}.container.bundle` 엔트리 파일은 [`repack`의 `Module Federation` 플러그인이 이미 생성](https://github.com/callstack/repack/blob/main/packages/repack/src/webpack/plugins/ModuleFederationPlugin.ts#L250)한 파일입니다.
> 그리고 [하나의 청크에 다수의 엔트리 모듈이 추가되는 것이 허용](https://github.com/webpack/webpack/blob/main/lib/javascript/JavascriptModulesPlugin.js#L1116-L1119)됩니다.

여기서 `Dependency` **클래스와 객체를 구분**해야 합니다.

`compilation.dependencyFactories`에 `Dependency` 클래스를 저장해 놓았고, 어떤 청크 또는 모듈의 하위 의존성으로 `Dependency` 객체를 추가하면, `compilation.dependencyFactories`에서 해당 [객체의 생성자로 모듈 팩토리 객체를 찾습니다.](https://github.com/webpack/webpack/blob/main/lib/Compilation.js#L2148-L2149)

찾은 [팩토리 객체의 `create` 메서드를 사용하여 모듈 객체를 생성](https://github.com/webpack/webpack/blob/main/lib/Compilation.js#L2057)하여 모듈 그래프에 삽입하고, 코드를 생성할 때, 모듈 객체의 `codeGeneration` 메서드를 사용해서 코드 문자열을 추출하는 방식입니다.

추출된 코드는 [모듈 `Resolver` 함수](https://velog.io/@joondong2/Module-Federation-%EB%B6%84%EC%84%9D#module-resolver)의 컨텐츠가 됩니다.

> `addEntry` 메서드는 팩토리 객체를 `_addEntryIetm` → `addModuleTree` → `handleModuleCreation` → `factorizeModule`을 거쳐서 `factorizeQueue` 객체에 추가합니다.
>
> [`factorizeQueue` 객체는 생성될 때, 추가되는 아이템에 대해 수행할 작업이 미리 지정](https://github.com/webpack/webpack/blob/main/lib/Compilation.js#L971)되어 있습니다.
>
> 이 동작이 팩토리 객체의 `create` 메서드를 호출하는 동작입니다.

결론적으로 `Dependency`가 모듈 팩토리를 통해 `Module` 객체로 변환되는 것입니다.

원래 어떤 모듈의 하위 의존성을 추가한다고 자동으로 모듈 `Resolver`가 실행되는 것은 아닙니다.

상위 모듈이 해당 모듈을 어떻게 처리할지에 달려있습니다.

엔트리 청크에 `addEntry` 메서드로 엔트리 모듈이 추가되면, 엔트리 청크(파일)를 생성할 때, 자동으로 [해당 엔트리 모듈의 `Resolver`를 실행시켜주는 코드가 삽입](https://github.com/webpack/webpack/blob/main/lib/javascript/JavascriptModulesPlugin.js#L1205-L1210)됩니다.

<details>
<summary>원래 사용하려고 했던 방식 (펼치기)</summary>
ㅤ

처음엔 다음과 같이 기존 `Module Federation`에서 엔트리 객체를 노출시키는 [`ContainerEtnryModule`](https://github.com/webpack/webpack/blob/main/lib/container/ContainerEntryModule.js)을 수정하려고 했습니다.

```
compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
     compilation.hooks.optimizeModules.tap(PLUGIN_NAME, (modules) => {
       for (const module of modules) {
         if (
           typeof module === 'object' &&
           module.constructor?.name === 'ContainerEntryModule' // 요 부분 불안!
         ) {
           const codeGeneration = module.codeGeneration.bind(module);

           // codeGeneration 메서드 래핑
           module.codeGeneration = function ({
             moduleGraph,
             chunkGraph,
             runtimeTemplate,
           }) {
             // 원본 codeGeneration 메서드 호출 결과
             const result = codeGeneration({
               moduleGraph,
               chunkGraph,
               runtimeTemplate,
             });

             // result.sources 조작 ... 요 부분도 불안

             return result;
           };
         }
       }
     });
   });
```

이 방식을 사용하면 각 앱의 엔트리 객체에 자신을 삭제하는 메서드를 노출시킴으로써, 특정 앱에 대한 작업(`init`, `get`, `dispose`)을 한 군데로 모을 수 있습니다. (응집도↑)

제가 사용한 방법은 독립적인 엔트리 모듈로 추가한 방법이기 때문에, 기존 엔트리 객체를 노출하는 모듈에 접근할 수 없어, [앱을 삭제하는 함수를 `global`에 따로 지정](../modules/react-native-dynamic-module-federation/src/webpack/ReactNativeDynamicModuleFederationModule.js#L85-L95)할 수밖에 없었습니다. (응집도↓)

그럼에도 불구하고, 독립적인 엔트리 모듈을 사용한 이유는 위의 코드는 `ContainerEntryModule`에 지나치게 의존적이라는 것과 원본 코드가 훼손되는 것이 마음에 걸렸기 때문입니다.

</details>

### 기존 앱을 삭제하는 코드

#### 엔트리 객체

`Module Federation` 분석에서 [어떤 앱의 `remoteEntry.js`가 실행되면, 해당 앱의 `엔트리 객체`를 `global`에 추가](https://velog.io/@joondong2/Module-Federation-%EB%B6%84%EC%84%9D#entry-object)한다고 했었습니다.

`repack`의 `Federated.importModule`은 [`global`에서 원하는 엔트리 객체가 있는지 검사하고, 없을 때만 해당 앱의 `remoteEntry.js` 파일을 로드](https://github.com/callstack/repack/blob/main/packages/repack/src/modules/ScriptManager/federated.ts#L267-L270)합니다.

> 이것은 [오리지널 `Module Federation`에서 사용되는 `import` 표현식도 동일](https://velog.io/@joondong2/repack%EA%B3%BC-Module-Federation#same)합니다.

따라서 **새로운 `remoteEntry.js`를 다운받아 `global`에 새로운 엔트리 객체를 등록하기 위해 기존 엔트리 객체를 지워야 합니다.**

#### webpackJsonpCallback

`Module Federation` 분석에서 [`global`의 `webpackChunk${앱이름}` 속성에 빈 배열을 만들고 `push` 메서드를 `webpackJsonpCallback` 함수로 오버라이드](https://velog.io/@joondong2/Module-Federation-%EB%B6%84%EC%84%9D#webpackjsonpCallback)한다고 했었습니다.

> `webpackChunk${앱이름}` 배열을 코드상에선 `chunkLoadingGlobal`라고 명명했습니다.
> `chunkLoadingGlobal`라고 하겠습니다.

`webpackJsonpCallback` 함수는 `chunkLoadingGlobal` 배열뿐만 아니라 `__webpack_modules__`에 파일에 포함된 모듈 `Resolver`를 추가합니다.

그런데 `webpackJsonpCallback` 함수는 분할된 파일이 실행되면서 `push` 메서드가 실행될 때뿐만 아니라, [`remoteEntry.js`가 실행될 때도 `chunkLoadingGlobal` 배열에 저장된 모든 아이템에 대해 실행](https://github.com/webpack/webpack/blob/main/lib/web/JsonpChunkLoadingRuntimeModule.js#L463)됩니다.

즉, `webpackChunk${앱이름}` 배열에 저장된 이전 앱에서 저장된 모듈 `Resolver`가 새로운 `remoteEntry.js`가 실행될 때 다시 `__webpack_modules__`에 추가되는 것입니다.

이를 방지하기 위해 global의 `webpackChunk${앱이름}` 배열도 지워야 합니다.

ㅤ

이 두 객체를 지우는 코드를 [`ReactNativeDynamicModuleFederationModule`](../modules/react-native-dynamic-module-federation/src/webpack/ReactNativeDynamicModuleFederationModule.js) webpack 모듈의 `codeGeneration` 메서드에서 생성합니다.

## [DynamicImportProvider](https://github.com/JoonDong2/dynamic-federations/blob/main/modules/react-native-dynamic-module-federation/src/DynamicImportProvider.tsx)

앱 `uri` 상태를 `Context`를 사용하여 `children`에 공유합니다.

앱 `uri`를 업데이트하기 전에 [`Script Resolver`](https://velog.io/@joondong2/repack%EA%B3%BC-Module-Federation#script-resolver)를 업데이트합니다.

```
export const DynamicImportProvider = ({ manager }) => {
  const [containers, setContainers] = useState<Containers>();

  const refreshContainers = () => {
    // 1. 앱 버전 가져오기
    // 2. ReactNativeDynamicModuleFederationPlugin에 의해 생성된 앱 삭제 함수로 기존 앱 삭제
    // 3. Script Resolver
    // 4. 앱 uri 업데이트
  };

  useEffect(() => {
    refreshContainers();
  }, []);

  // manager에 refreshContainers 주입 → 외부에서 호출

  return (
    <Context.Provider value={{ containers, manager }}>
      <>{children}</>
    </Context.Provider>
  );
}
```

## [useImportLazy](https://github.com/JoonDong2/dynamic-federations/blob/main/modules/react-native-dynamic-module-federation/src/useDynamicLazy.tsx), [useImportModule](https://github.com/JoonDong2/dynamic-federations/blob/main/modules/react-native-dynamic-module-federation/src/useDynamicModule.tsx)

컴포넌트 내부에서 앱 `uri`가 변경되면 `Federated.importModule`을 실행하여 새로운 컴포넌트(`useDynamicLazy`) 또는 모듈(`useDynamicModule`)을 반환합니다.

```
export function useDynamic...(containerName, moduleName, options) {
  const containers = useContainers();
  const manager = useDynamicImportManager();

  return useMemo(() => {
    const promise = () => Federated.importModule(containerName, moduleName)

    // promise 조작 및 반환
    // ...
  }, [containers?.[containerName], moduleName]) // containers?.[containerName] = 앱 uri
}
```

`containers?.[containerName]`이 변경되서 새로 만들어지는 값은 이전 값과 내용이 같더라도 다른 객체이기 때문에, `useDynamicLazy`의 경우 다른 컴포넌트로 인식됩니다.

즉, **앱의 `uri`가 변경되면 해당 앱이 노출하는 모든 모듈은 상태를 잃어버립니다.** (다른 앱은 상태를 유지합니다.)

## DynamicImportManager

`react-native-dynamic-module-federation` 구성요소는 **앱마다 다양한 방법으로 작동할 수 있도록** 동작 과정에서 중요한 부분을 **외부에서 입력되는 `DynamicImportManager` 객체에 위임**합니다.

1. [앱 업데이트 시점](../modules/react-native-dynamic-module-federation/src/DynamicImportProvider.tsx#L203-L204) (사용예: [Host](../apps/host/App.tsx#L32-L38))
2. [앱 버전을 가져오는 방법](../modules/react-native-dynamic-module-federation/src/DynamicImportProvider.tsx#L129) (사용예: [shared > fetchContainers](../shared/src/containers.ts#L15) > [DynamicImportManager](../apps/host/App.tsx#L24))
3. [오류 처리](../modules/react-native-dynamic-module-federation/src/useDynamicLazy.tsx#L73) (사용예: [shared > ErrorManager](../shared/src/containers.ts#L68) > [DynamicImportManager](../apps/host/App.tsx#L26))

`DynamicImportManager` 객체는 오류를 다시 `ErrorManager` 객체에 위임합니다.

`ErrorManager`는 `DynamicImportManager` 객체가 생성자에 주입되는 오류 처리를 위한 **사용자 정의 클래스**입니다.

`DynamicImportManager` 생성자는 `ErrorManager` 객체가 아닌, 클래스 자체를 받아 `ErrorManager` 객체를 내부에서 생성하며, 자신(`DynamicImportManager` 객체)을 `ErrorManager` 객체에 주입합니다.

`ErrorManager`와 `DynamicImportManager` 객체간 결합도를 약화시키기 위해, 의존성 주입을 통해 제어를 역전하는 방법을 사용했습니다.

저는 임의로 오류를 2번까지 허용하는 [`ErrorManger`](https://github.com/JoonDong2/dynamic-federations/blob/main/shared/src/containers.ts#L66-L102) 클래스를 `shared`에 정의했으며, 다양하게 만들어 **각 앱의 `DynamicImportManager` 객체마다 다른 `ErrorManager`를 사용할 수 있습니다.**

## 마치며

`Host`로 작동하는 모든 미니 앱에서 공통으로 사용되기 때문에 라이브러리로 분리하였고, 해결책이라기 보단 접근 방법에 더 가깝기 때문에, `npm`에 배포하지는 않았습니다.
