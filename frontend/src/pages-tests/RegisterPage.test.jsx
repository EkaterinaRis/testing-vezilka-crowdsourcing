import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';

describe('RegisterPage', () => {
  it('renders the registration form heading', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Создај сметка/i }),
    ).toBeInTheDocument();
  });
});
