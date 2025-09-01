import { render, screen } from '@testing-library/react';
import { FlashcardStack } from './FlashcardStack';
import '@testing-library/jest-dom';

describe('FlashcardStack', () => {
  it('renders the first question', () => {
    const mockFlashcards = [
      { id: '1', question: 'What is the powerhouse of the cell?', answer: 'Mitochondria' }
    ];
    render(<FlashcardStack flashcards={mockFlashcards} />);
    expect(screen.getByText('What is the powerhouse of the cell?')).toBeInTheDocument();
  });
});
