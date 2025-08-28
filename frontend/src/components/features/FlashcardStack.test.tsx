import { render, screen } from '@testing-library/react';
import { FlashcardStack } from './FlashcardStack';
import '@testing-library/jest-dom';

describe('FlashcardStack', () => {
  it('renders the first question', () => {
    render(<FlashcardStack />);
    expect(screen.getByText('What is the powerhouse of the cell?')).toBeInTheDocument();
  });
});
