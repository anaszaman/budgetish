import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import InputForm from './InputForm';

test('renders input form buttons', () => {
  const { getByText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{}} />);
  const addButtonElement = getByText(/add/i);
  const cancelButtonElement = getByText(/cancel/i);
  expect(addButtonElement).toBeInTheDocument();
  expect(cancelButtonElement).toBeInTheDocument();
});

test('renders input form buttons', () => {
  const { getByText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ index: 1 }} />);
  const addButtonElement = getByText(/update/i);
  const cancelButtonElement = getByText(/cancel/i);
  expect(addButtonElement).toBeInTheDocument();
  expect(cancelButtonElement).toBeInTheDocument();
});

test('renders Amount input', () => {
  const { getByLabelText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ amount: "100" }} />);
  const amountInputElement = getByLabelText(/Amount/i);
  expect(amountInputElement).toBeInTheDocument();
  expect(amountInputElement.getAttribute("value")).toBe("100");
});

test('renders Label input', () => {
  const { getByLabelText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ label: "Test" }} />);
  const labelInputElement = getByLabelText(/Label/i);
  expect(labelInputElement).toBeInTheDocument();
  expect(labelInputElement.getAttribute("value")).toBe("Test");
});

test('renders Date input', () => {
  const { getByLabelText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ date: "01-01-2020" }} />);
  const dateInputElement = getByLabelText(/Date/i);
  expect(dateInputElement).toBeInTheDocument();
  expect(dateInputElement.getAttribute("type")).toBe("date");
  expect(dateInputElement.getAttribute("value")).toBe("01-01-2020");
});

test('renders Tag input', () => {
  const { getByPlaceholderText,queryByText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ date: "01-01-2020" }} />);
  const tagInputElement = getByPlaceholderText(/tags/i);
  expect(tagInputElement).toBeInTheDocument();
});


test('does not add empty tag', () => {
  const { getByPlaceholderText,queryByText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ date: "01-01-2020" }} />);
  const tagInputElement = getByPlaceholderText(/tags/i);
  expect(tagInputElement).toBeInTheDocument();
  fireEvent.keyUp(tagInputElement, {key:'Enter', keyCode: 13});
  expect(queryByText(/text/i)).toBe(null);
});

test('add one tag to tag list', () => {
  const { getByPlaceholderText,queryByText } = render(<InputForm addTransaction={() => { }} updateTransaction={() => { }} cancelAddOrEdit={() => { }} initialData={{ date: "01-01-2020" }} />);
  const tagInputElement = getByPlaceholderText(/Tags/i);
  expect(tagInputElement).toBeInTheDocument();
  tagInputElement.value = "text"
  fireEvent.keyUp(tagInputElement, {key:'Enter', keyCode: 13});
  expect(queryByText(/text/i)).not.toBe(null);
});