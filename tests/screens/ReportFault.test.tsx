import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp, setOnline } from '../helpers/renderApp';
import * as faults from '../../src/lib/faults';
import * as photo from '../../src/lib/photo';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/faults', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faults')>('../../src/lib/faults');
  return {
    CATEGORIES: actual.CATEGORIES,
    getFaultTypes: vi.fn(),
    getHomeWardId: vi.fn(),
    submitReport: vi.fn(),
  };
});

vi.mock('../../src/lib/photo', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/photo')>('../../src/lib/photo');
  return { ...actual, resizePhoto: vi.fn() };
});

// S6 Report a Fault (PRD 8.2), stories T-US3-2 to T-US3-4 and T-S6-3.

const FAULT_TYPES: faults.FaultType[] = [
  { id: 'pothole', category: 'roads', name: 'Pothole', autoUrgent: false },
  { id: 'sinkhole', category: 'roads', name: 'Sinkhole', autoUrgent: true },
  { id: 'burst-pipe', category: 'clean_water', name: 'Burst clean water pipe', autoUrgent: true },
];

const RESIZED = new Blob(['resized'], { type: 'image/jpeg' });

function file(name: string, type: string): File {
  return new File(['x'], name, { type });
}

function choosePhoto(chosen: File) {
  fireEvent.change(screen.getByLabelText('Add photo'), { target: { files: [chosen] } });
}

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function openS6() {
  renderApp('/report');
  await screen.findByRole('heading', { name: 'Report a fault' });
  await screen.findByRole('option', { name: 'Ward A: Orlando West' });
}

async function fillValidForm() {
  choosePhoto(file('pothole.jpg', 'image/jpeg'));
  await screen.findByRole('img', { name: 'Photo 1' });
  fireEvent.change(screen.getByLabelText(/^category/i), { target: { value: 'roads' } });
  fireEvent.change(screen.getByLabelText(/^fault type/i), { target: { value: 'pothole' } });
  type(/^street address/i, '23 Vilakazi Street, Orlando West');
  type(/^landmark/i, 'Near the Mandela House');
  type(/^description/i, 'Big pothole in the left lane since Monday.');
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit report' }));
}

beforeEach(() => {
  auth.resetAuthMock('resident-1');
  auth.getRole.mockResolvedValue('resident');
  vi.mocked(faults.getFaultTypes).mockResolvedValue(FAULT_TYPES);
  vi.mocked(faults.getHomeWardId).mockResolvedValue('ward-a');
  vi.mocked(faults.submitReport).mockResolvedValue({ reference: 'FMK-2026-00125' });
  vi.mocked(photo.resizePhoto).mockResolvedValue(RESIZED);
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
  window.scrollTo = vi.fn();
  setOnline(true);
});

describe('S6 Report a Fault', () => {
  it('sends a visitor to log in', async () => {
    auth.resetAuthMock(null);
    renderApp('/report');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows the emergency notice and the ward defaults to the home ward (BR3)', async () => {
    await openS6();
    expect(screen.getByText(/call 10177 or 112/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ward/i)).toHaveValue('ward-a');
  });

  it('T-S6-3: a HEIC photo shows the message, is not added or uploaded, and photos already added stay', async () => {
    await openS6();
    choosePhoto(file('first.jpg', 'image/jpeg'));
    await screen.findByRole('img', { name: 'Photo 1' });

    choosePhoto(file('IMG_0001.heic', 'image/heic'));

    expect(await screen.findByText('Please choose a JPG or PNG photo.')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(photo.resizePhoto).toHaveBeenCalledTimes(1);
    expect(faults.submitReport).not.toHaveBeenCalled();
  });

  it('allows at most 3 photos and a photo can be removed (BR2)', async () => {
    await openS6();
    for (const number of [1, 2, 3]) {
      choosePhoto(file(`photo${number}.jpg`, 'image/jpeg'));
      await screen.findByRole('img', { name: `Photo ${number}` });
    }
    expect(screen.queryByLabelText('Add photo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove photo 2' }));
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByLabelText('Add photo')).toBeInTheDocument();
  });

  it('T-US3-2: without a photo or "not safe", Submit shows "Add at least 1 photo."', async () => {
    await openS6();
    submit();
    expect(await screen.findByText('Add at least 1 photo.')).toBeInTheDocument();
    expect(screen.getByText('Choose a category.')).toBeInTheDocument();
    expect(screen.getByText('Enter the street address.')).toBeInTheDocument();
    expect(faults.submitReport).not.toHaveBeenCalled();
  });

  it('"not safe" hides the photos and needs a 30-character description (BR2)', async () => {
    await openS6();
    fireEvent.click(screen.getByLabelText('It is not safe to take a photo'));
    expect(screen.queryByLabelText('Add photo')).not.toBeInTheDocument();

    type(/^description/i, 'Wires hanging low.');
    submit();
    expect(await screen.findByText('Describe the fault in at least 30 characters.')).toBeInTheDocument();
    expect(screen.queryByText('Add at least 1 photo.')).not.toBeInTheDocument();
  });

  it('only lists fault types of the chosen category, and ticks and locks "dangerous" for auto urgent types (BR19)', async () => {
    await openS6();
    fireEvent.change(screen.getByLabelText(/^category/i), { target: { value: 'roads' } });
    expect(screen.getByRole('option', { name: 'Pothole' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Burst clean water pipe' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^fault type/i), { target: { value: 'sinkhole' } });
    const dangerous = screen.getByLabelText('This is dangerous');
    expect(dangerous).toBeChecked();
    expect(dangerous).toBeDisabled();
  });

  it('counts the description characters', async () => {
    await openS6();
    type(/^description/i, 'Water everywhere');
    expect(screen.getByText('16 / 500')).toBeInTheDocument();
  });

  it('submits a valid report and shows the reference number', async () => {
    await openS6();
    await fillValidForm();
    submit();

    expect(await screen.findByText('Fault reported. Your reference number is FMK-2026-00125.')).toBeInTheDocument();
    expect(faults.submitReport).toHaveBeenCalledWith(
      {
        wardId: 'ward-a',
        faultTypeId: 'pothole',
        isUrgent: false,
        noPhotoSafe: false,
        description: 'Big pothole in the left lane since Monday.',
        streetAddress: '23 Vilakazi Street, Orlando West',
        landmark: 'Near the Mandela House',
        latitude: null,
        longitude: null,
      },
      [RESIZED],
    );
    expect(screen.getByLabelText(/^street address/i)).toHaveValue('');
    expect(screen.getByLabelText(/^ward/i)).toHaveValue('ward-a');
  });

  it('T-US3-3: at the 5-a-day limit it shows the message and keeps the form', async () => {
    vi.mocked(faults.submitReport).mockResolvedValue({ error: 'too_many_reports' });
    await openS6();
    await fillValidForm();
    submit();

    expect(
      await screen.findByText('You can report up to 5 faults a day. Please try again tomorrow.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^street address/i)).toHaveValue('23 Vilakazi Street, Orlando West');
    expect(screen.getByRole('img', { name: 'Photo 1' })).toBeInTheDocument();
  });

  it('T-US3-4: when the upload fails it shows "Try again" and keeps the photos and text', async () => {
    vi.mocked(faults.submitReport).mockResolvedValueOnce({ error: 'upload_failed' });
    await openS6();
    await fillValidForm();
    submit();

    expect(await screen.findByText('Upload failed. Check your connection.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photo 1' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^description/i)).toHaveValue('Big pothole in the left lane since Monday.');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Fault reported. Your reference number is FMK-2026-00125.')).toBeInTheDocument();
    expect(faults.submitReport).toHaveBeenCalledTimes(2);
  });

  it('BR2: with every other field valid but no photo and "not safe" unticked, nothing is saved', async () => {
    await openS6();
    fireEvent.change(screen.getByLabelText(/^category/i), { target: { value: 'roads' } });
    fireEvent.change(screen.getByLabelText(/^fault type/i), { target: { value: 'pothole' } });
    type(/^street address/i, '23 Vilakazi Street, Orlando West');
    type(/^description/i, 'Big pothole in the left lane since Monday.');
    submit();

    expect(await screen.findByText('Add at least 1 photo.')).toBeInTheDocument();
    expect(screen.queryByText('Choose a category.')).not.toBeInTheDocument();
    expect(faults.submitReport).not.toHaveBeenCalled();
  });

  it('BR2: a removed photo counts as no photo', async () => {
    await openS6();
    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo 1' }));
    submit();

    expect(await screen.findByText('Add at least 1 photo.')).toBeInTheDocument();
    expect(faults.submitReport).not.toHaveBeenCalled();
  });

  it('BR2: with "not safe" ticked and a 30+ character description, the report is saved with no photos', async () => {
    await openS6();
    fireEvent.click(screen.getByLabelText('It is not safe to take a photo'));
    fireEvent.change(screen.getByLabelText(/^category/i), { target: { value: 'roads' } });
    fireEvent.change(screen.getByLabelText(/^fault type/i), { target: { value: 'pothole' } });
    type(/^street address/i, '23 Vilakazi Street, Orlando West');
    type(/^description/i, 'Deep pothole in the fast lane, cars swerve into it at night.');
    submit();

    expect(await screen.findByText('Fault reported. Your reference number is FMK-2026-00125.')).toBeInTheDocument();
    expect(faults.submitReport).toHaveBeenCalledWith(expect.objectContaining({ noPhotoSafe: true }), []);
  });

  it('BR2: if the database refuses the report for having no photo, it shows the photo error and no "Try again"', async () => {
    vi.mocked(faults.submitReport).mockResolvedValue({ error: 'photo_required' });
    await openS6();
    await fillValidForm();
    submit();

    expect(await screen.findByText('Add at least 1 photo.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Your reference number is/)).not.toBeInTheDocument();
  });

  it('when saving fails, nothing is reported as saved and "Try again" sends the report again', async () => {
    vi.mocked(faults.submitReport).mockResolvedValueOnce({ error: 'save_failed' });
    await openS6();
    await fillValidForm();
    submit();

    expect(await screen.findByText('Upload failed. Check your connection.')).toBeInTheDocument();
    expect(screen.queryByText(/Your reference number is/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Fault reported. Your reference number is FMK-2026-00125.')).toBeInTheDocument();
  });

  it('disables "Submit report" while offline', async () => {
    await openS6();
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit report' })).toBeDisabled());
  });
});
