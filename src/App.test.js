import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn Add transaction button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Add Transaction/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders learn Import Transactions button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Import Transactions/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders learn Export Transactions button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Export Transactions/i);
  expect(buttonElement).toBeInTheDocument();
});