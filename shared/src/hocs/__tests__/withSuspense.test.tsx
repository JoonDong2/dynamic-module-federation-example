import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import withSuspense from '../withSuspense';

const TestComponent = () => {
  throw new Promise(() => {});
};

it('fallback 랜더링', async () => {
  render(withSuspense(<Text>로딩중</Text>)(<TestComponent />));
  await waitFor(() => screen.findByText('로딩중'));
});
