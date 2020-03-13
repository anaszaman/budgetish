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

const transactions = [{
  amount: -1,
  label: "test transaction",
  date: "2020-02-02",
  tags: ["groceries"]
}]
test('renders transactions table', () => {
  const { getAllByRole } = render(<App initialTransactions={transactions}/>);
  const tableElements = getAllByRole("table");
  expect(tableElements.length).toBe(2);
});

test('renders budget table row', () => {
  const { getByText } = render(<App initialTransactions={transactions} initialBudgets={[{"tag": "groceries","amount": 100}]}/>);
  const tagSelectElement = getByText(/groceries/i);
  expect(tagSelectElement).toBeInTheDocument();
});

test('renders Add Budget button', () => {
  const { getByText } = render(<App />);
  const buttonElement = getByText(/Add Budget/i);
  expect(buttonElement).toBeInTheDocument();
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
