import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import withErrorBoundary from '../withErrorBoundary';
import { Text } from 'react-native';

const TestComponent = () => {
  useEffect(() => {
    throw new Error();
  });
  return null;
};

it('fallback 랜더링', async () => {
  render(withErrorBoundary(<Text>오류</Text>)(<TestComponent />));
  await waitFor(() => screen.findByText('오류'));
});
