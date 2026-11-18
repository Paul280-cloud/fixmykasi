import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('shows the FixMyKasi name on the home screen', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'FixMyKasi' })).toBeInTheDocument();
  });
});
