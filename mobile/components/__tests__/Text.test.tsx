import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../Text';

describe('Text', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Text>Hello World</Text>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const { getByText, rerender } = render(<Text variant="h1">Heading 1</Text>);
    expect(getByText('Heading 1')).toBeTruthy();

    rerender(<Text variant="body">Body text</Text>);
    expect(getByText('Body text')).toBeTruthy();

    rerender(<Text variant="caption">Caption text</Text>);
    expect(getByText('Caption text')).toBeTruthy();
  });

  it('applies correct alignment', () => {
    const { getByText } = render(<Text align="center">Centered</Text>);
    const element = getByText('Centered');
    expect(element.props.style).toContainEqual(
      expect.objectContaining({ textAlign: 'center' })
    );
  });
});
