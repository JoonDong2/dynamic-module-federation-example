import React, { Suspense, useEffect, useState } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import createDynamicImport from '../createDynamicImport';
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

const fetchContainers = jest.fn().mockReturnValue(
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, 0);
  })
);

const DynamicImport = createDynamicImport({
  fetchContainers,
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

const TestComponent = ({ withSibling }: any) => {
  return (
    <ErrorBoundary fallback={<Text>오류</Text>}>
      <Suspense fallback={<Text>로딩중</Text>}>
        <>
          <DynamicImport.Provider>
            <Text>랜더링</Text>
          </DynamicImport.Provider>
          {withSibling && <SiblingComponent />}
        </>
      </Suspense>
    </ErrorBoundary>
  );
};

describe('createDynamicImport 테스트', () => {
  beforeEach(() => {
    fetchContainers.mockClear();
  });
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

  it('형제 컴포넌트 생명주기에 영향을 미치지 않는지 확인', async () => {
    const screen = render(<TestComponent withSibling />);

    await waitFor(() => {
      return screen.findByText('로딩중');
    });

    await waitFor(() => {
      return screen.findByText('sibling');
    });
  });

  it('외부에서 DynamicImport.refresh가 호출되는지 확인', async () => {
    const screen = render(<TestComponent />);

    await waitFor(() => {
      return screen.findByText('로딩중');
    });
    await waitFor(() => {
      return screen.findByText('랜더링');
    });

    act(() => {
      DynamicImport.refresh();
    });

    expect(fetchContainers.mock.calls.length).toBe(2);
  });
});
