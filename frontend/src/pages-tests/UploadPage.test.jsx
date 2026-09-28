import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from '../pages/UploadPage';

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../components/DialectDropdown', () => ({
  default: ({ value, onChange }) => (
    <select
      aria-label="Дијалект"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Избери дијалект</option>
      <option value="1">Скопски</option>
      <option value="2">Охридски</option>
    </select>
  ),
}));

vi.mock('../components/UploadEntry', () => ({
  default: ({ entries, onRemove }) => (
    <div data-testid="upload-entries">
      {entries.map((entry) => (
        <div key={entry.id}>
          <span>{entry.file.name}</span>
          <button onClick={() => onRemove(entry.id)}>Отстрани запис</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../utils/auth', () => ({
  getToken: vi.fn(() => 'test-token'),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>,
    );

  it('renders the upload page heading', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /Прикачи содржина/i }),
    ).toBeInTheDocument();
  });

  it('renders the upload page description', () => {
    renderPage();

    expect(
      screen.getByText(/Сподели податоци на македонски јазик/i),
    ).toBeInTheDocument();
  });

  it('renders the file upload area', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: /Прикачи датотеки/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Влечи и пушти датотеки овде/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/или кликни за да избереш/i),
    ).toBeInTheDocument();
  });

  it('renders supported file type categories', () => {
    renderPage();

    expect(screen.getByText('Текст')).toBeInTheDocument();
    expect(screen.getByText('Слика')).toBeInTheDocument();
    expect(screen.getByText('Аудио')).toBeInTheDocument();
    expect(screen.getByText('Видео')).toBeInTheDocument();
  });

  it('renders topic and description fields', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(
        /Вести, Литература, Секојдневен говор/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Накратко опиши ја содржината/i),
    ).toBeInTheDocument();
  });

  it('renders the visibility options', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /Јавно/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Приватно/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Содржината ќе биде достапна за сите корисници/i),
    ).toBeInTheDocument();
  });

  it('uses public visibility by default', () => {
    renderPage();

    expect(
      screen.getByText(/Содржината ќе биде достапна за сите корисници/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Само ти ќе можеш да ја видиш/i),
    ).not.toBeInTheDocument();
  });

  it('changes visibility to private', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Приватно/i }));

    expect(
      screen.getByText(/Само ти ќе можеш да ја видиш оваа содржина/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Содржината ќе биде достапна за сите корисници/i),
    ).not.toBeInTheDocument();
  });

  it('changes visibility back to public', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Приватно/i }));
    fireEvent.click(screen.getByRole('button', { name: /Јавно/i }));

    expect(
      screen.getByText(/Содржината ќе биде достапна за сите корисници/i),
    ).toBeInTheDocument();
  });

  it('displays selected files', () => {
    renderPage();

    const file = new File(['test content'], 'document.txt', {
      type: 'text/plain',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText(/Избрани датотеки \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('document.txt')).toBeInTheDocument();
  });

  it('supports selecting multiple files', () => {
    renderPage();

    const file1 = new File(['first'], 'first.txt', {
      type: 'text/plain',
    });

    const file2 = new File(['second'], 'second.pdf', {
      type: 'application/pdf',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file1, file2],
      },
    });

    expect(
      screen.getByText(/Избрани датотеки \(2\)/i),
    ).toBeInTheDocument();

    expect(screen.getByText('first.txt')).toBeInTheDocument();
    expect(screen.getByText('second.pdf')).toBeInTheDocument();
  });

  it('removes a selected file', () => {
    renderPage();

    const file = new File(['test'], 'document.txt', {
      type: 'text/plain',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText('document.txt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Отстрани' }));

    expect(screen.queryByText('document.txt')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Избрани датотеки/i),
    ).not.toBeInTheDocument();
  });

  it('shows transcription field for audio files', () => {
    renderPage();

    const file = new File(['audio'], 'recording.mp3', {
      type: 'audio/mpeg',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByRole('button', { name: /Транскрипција/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /Добредојдовте на денешната емисија/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows transcription field for video files', () => {
    renderPage();

    const file = new File(['video'], 'video.mp4', {
      type: 'video/mp4',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByRole('button', { name: /Транскрипција/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /Добредојдовте на денешната емисија/i,
      ),
    ).toBeInTheDocument();
  });

  it('does not show transcription field for text files', () => {
    renderPage();

    const file = new File(['text'], 'document.txt', {
      type: 'text/plain',
    });

    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.queryByRole('button', { name: /Транскрипција/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText(
        /Добредојдовте на денешната емисија/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('allows entering a transcription for a media file', () => {
    renderPage();

    const file = new File(['audio'], 'recording.mp3', {
      type: 'audio/mpeg',
    });

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: {
        files: [file],
      },
    });

    const textarea = screen.getByPlaceholderText(
      /Добредојдовте на денешната емисија/i,
    );

    fireEvent.change(textarea, {
      target: {
        value: 'Ова е тест транскрипција.',
      },
    });

    expect(textarea).toHaveValue('Ова е тест транскрипција.');
  });

  it('collapses the transcription field', () => {
    renderPage();

    const file = new File(['audio'], 'recording.mp3', {
      type: 'audio/mpeg',
    });

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: {
        files: [file],
      },
    });

    const transcriptionButton = screen.getByRole('button', {
      name: /Транскрипција/i,
    });

    expect(transcriptionButton).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    fireEvent.click(transcriptionButton);

    expect(transcriptionButton).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('rejects .ppt files and displays an error toast', async () => {
    renderPage();

    const file = new File(['presentation'], 'presentation.ppt', {
      type: 'application/vnd.ms-powerpoint',
    });

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: {
        files: [file],
      },
    });

    expect(
      await screen.findByText(
        /Не е дозволено прикачување на \.ppt датотеки/i,
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText('presentation.ppt')).not.toBeInTheDocument();
  });

  it('accepts .pptx files', () => {
    renderPage();

    const file = new File(['presentation'], 'presentation.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText('presentation.pptx')).toBeInTheDocument();
  });

  it('uploads a file successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    renderPage();

    const file = new File(['test content'], 'document.txt', {
      type: 'text/plain',
    });

    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: {
        files: [file],
      },
    });

    fireEvent.change(
      screen.getByPlaceholderText(
        /Вести, Литература, Секојдневен говор/i,
      ),
      {
        target: {
          value: 'Вести',
        },
      },
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Прикачи содржина \(1\)/i,
      }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/files/upload'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
          },
          body: expect.any(FormData),
        }),
      );
    });
  });

  
});
