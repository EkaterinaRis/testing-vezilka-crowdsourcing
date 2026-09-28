import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RewardsPage from '../pages/RewardsPage';

describe('RewardsPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <RewardsPage />
      </MemoryRouter>,
    );
  });

  it('renders the rewards page heading', () => {
    expect(
      screen.getByRole('heading', { name: /Награди/i }),
    ).toBeInTheDocument();
  });

  it('renders the rewards page description', () => {
    expect(
      screen.getByText(
        /Размени ги твоите поени за ексклузивни погодности/i,
      ),
    ).toBeInTheDocument();
  });


  it('renders all available rewards', () => {
    expect(
      screen.getByRole('heading', { name: /Курс по македонска ОЈП/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Значка за придонесувач/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Премиум функции/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Везилка артикли/i }),
    ).toBeInTheDocument();
  });

  it('renders reward descriptions', () => {
    expect(
      screen.getByText(
        /Онлајн курс за обработка на природен јазик за македонски/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Ексклузивна дигитална значка за твојот профил/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Пристап до напредна аналитика и алатки за 30 дена/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Маица и стикери од заедницата на Везилка/i),
    ).toBeInTheDocument();
  });

  it('allows exchanging rewards that the user can afford', () => {
    const exchangeButtons = screen.getAllByRole('button', {
      name: 'Размени',
    });

    exchangeButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('disables the reward that costs more than the user balance', () => {
    const unavailableButton = screen.getByRole('button', {
      name: 'Нема доволно средства',
    });

    expect(unavailableButton).toBeDisabled();
  });
});
