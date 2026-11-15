import { render, screen } from '@testing-library/react';
import '../../src/i18n';
import Checkbox from '../../src/components/Checkbox';
import SelectField from '../../src/components/SelectField';
import TextField from '../../src/components/TextField';

// Props a caller passes must not remove the error state or the link from the
// field to its error text (PR #41 review).
const override = {
  'aria-invalid': false,
  'aria-describedby': 'something-else',
  'aria-required': false,
  className: 'caller-class',
} as const;

function expectErrorKept(field: HTMLElement, id: string) {
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAttribute('aria-describedby', `${id}-error`);
  expect(field).toHaveAttribute('aria-required', 'true');
  expect(field).toHaveAccessibleDescription('Enter a valid email address.');
  expect(field.className).not.toBe('caller-class');
}

describe('Field props cannot override the error link', () => {
  it('TextField', () => {
    render(<TextField id="email" label="Email" error="Enter a valid email address." {...override} />);
    expectErrorKept(screen.getByLabelText(/^email/i), 'email');
  });

  it('SelectField', () => {
    render(
      <SelectField
        id="ward"
        label="Ward"
        placeholder="Choose"
        options={[]}
        value=""
        onChange={() => {}}
        error="Enter a valid email address."
        {...override}
      />,
    );
    expectErrorKept(screen.getByLabelText(/^ward/i), 'ward');
  });

  it('Checkbox', () => {
    render(<Checkbox id="adult" label="I am 18" error="Enter a valid email address." {...override} />);
    expectErrorKept(screen.getByLabelText(/^i am 18/i), 'adult');
  });
});
