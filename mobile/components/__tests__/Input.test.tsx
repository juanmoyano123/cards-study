import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders correctly with label', () => {
    const { getByText, getByPlaceholderText } = render(
      <Input label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeTextMock} />
    );

    fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello');
    expect(onChangeTextMock).toHaveBeenCalledWith('Hello');
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <Input label="Email" error="Invalid email" />
    );

    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('shows helper text when provided', () => {
    const { getByText } = render(
      <Input label="Password" helperText="At least 6 characters" />
    );

    expect(getByText('At least 6 characters')).toBeTruthy();
  });

  it('uses email keyboard for email type', () => {
    const { getByPlaceholderText } = render(
      <Input type="email" placeholder="Enter email" />
    );

    const input = getByPlaceholderText('Enter email');
    expect(input.props.keyboardType).toBe('email-address');
  });
});
