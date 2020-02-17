import React from 'react';
import { render, fireEvent, getByText } from '@testing-library/react';
import App from './App';

test('renders Add transaction button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Add Transaction/i);
  expect(buttonElement).toBeInTheDocument();
});

test('does not render transactions table', () => {
  const { queryByRole } = render(<App />);
  expect(queryByRole("table")).toBe(null);
});

test('renders transactions table', () => {
  const transactions = [{
    amount: -1,
    label: "test transaction",
    date: "2020-02-02",
    tags: ["testtag"]
  }]
  const { getByRole } = render(<App initialTransactions={transactions}/>);
  const tableElement = getByRole("table");
  expect(tableElement).not.toBe(null);
  expect(tableElement).toBeInTheDocument();
});

test('renders Import Transactions button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Import Transactions/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders Export Transactions button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Export Transactions/i);
  expect(buttonElement).toBeInTheDocument();
});

test('does not render input form', () => {
  const { queryByText } = render(<App />);
  expect(queryByText("add")).toBe(null);
});

test('click Add Transactions button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Add Transaction/i);
  fireEvent.click(buttonElement);
  const inputForm = getByText("add");
  expect(inputForm).not.toBe(null);
});
