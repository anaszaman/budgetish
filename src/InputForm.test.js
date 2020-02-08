import React from 'react';
import { render } from '@testing-library/react';
import InputForm from './InputForm';

test('renders learn input form buttons button', () => {
    const { getByText } = render(<InputForm addTransaction={() => {}} updateTransaction={() => {}} cancelAddOrEdit={() => {}} initialData={{}}/>);
    const addButtonElement = getByText(/add/i);
    const cancelButtonElement = getByText(/cancel/i);
    expect(addButtonElement).toBeInTheDocument();
    expect(cancelButtonElement).toBeInTheDocument();
  });