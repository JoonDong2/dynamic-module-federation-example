import React, { Suspense, useEffect, useState } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import DynamicImportProvider from '../DynamicImportProvider';
import { Text } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

jest.mock('@callstack/repack/client', () => {
  const repack = {
    ScriptManager: {
      shared: {
        addResolver: jest.fn().mockReturnValue(undefined),
        removeResolver: jest.fn().mockReturnValue(undefined),
      },
    },
  };
  return repack;
});

const SiblingComponent = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    setTimeout(() => {
      setName('sibling');
    }, 10);
  });
  return <Text>{name}</Text>;
};

const TestComponent = ({ throwError, withSibling }: any) => {
  return (
    <ErrorBoundary fallback={<Text>오류</Text>}>
      <Suspense fallback={<Text>로딩중</Text>}>
        <>
          <DynamicImportProvider
            fetchContainers={() =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  if (throwError) {
                    reject(new Error());
                  } else {
                    resolve({});
                  }
                }, 0);
              })
            }
          >
            <Text>랜더링</Text>
          </DynamicImportProvider>
          {withSibling && <SiblingComponent />}
        </>
      </Suspense>
    </ErrorBoundary>
  );
};

it('로딩중이 랜더링되는지 확인', async () => {
  const screen = render(<TestComponent />);

  await waitFor(() => {
    return screen.findByText('로딩중');
  });
});

it('children이 랜더링되는지 확인', async () => {
  const screen = render(<TestComponent />);

  await waitFor(() => {
    return screen.findByText('랜더링');
  });
});

it('오류가 랜더링되는지 확인', async () => {
  const screen = render(<TestComponent throwError />);

  await waitFor(() => {
    return screen.findByText('로딩중');
  });

  await waitFor(() => {
    return screen.findByText('오류');
  });
});

it('형제 컴포넌트 생명주기에 영향을 미치지 않는지 확인', async () => {
  const screen = render(<TestComponent withSibling />);

  await waitFor(() => {
    return screen.findByText('로딩중');
  });

  await waitFor(() => {
    return screen.findByText('sibling');
  });
});
