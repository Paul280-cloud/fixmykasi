import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Button from '../../src/components/Button';
import ButtonLink from '../../src/components/ButtonLink';

// A link that looks exactly like a Button (PRD 8.3), for buttons that only go
// to another screen, like "Create account" and "Log in" on S1.

describe('ButtonLink', () => {
  it('is a link to the given address, with its label', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/sign-up">Create account</ButtonLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/sign-up');
  });

  it.each([undefined, 'primary', 'secondary'] as const)('looks the same as a Button with variant %s', (variant) => {
    render(
      <MemoryRouter>
        <Button variant={variant}>Button</Button>
        <ButtonLink to="/log-in" variant={variant}>
          Link
        </ButtonLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').className).toBe(screen.getByRole('button').className);
  });
});
