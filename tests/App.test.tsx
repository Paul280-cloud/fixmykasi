import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('shows the FixMyKasi name on the home screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'FixMyKasi' })).toBeInTheDocument();
  });
});
