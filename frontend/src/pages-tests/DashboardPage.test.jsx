import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";

import { getUser, userCanReview } from "../utils/auth";
import { getUserDashboardStats } from "../api/userApi";

vi.mock("../utils/auth", () => ({
  getUser: vi.fn(),
  userCanReview: vi.fn(),
}));

vi.mock("../api/userApi", () => ({
  getUserDashboardStats: vi.fn(),
}));

vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../components/StatCard", () => ({
  default: ({ title, statValue }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{statValue}</span>
    </div>
  ),
}));

vi.mock("../components/RecentActivities", () => ({
  default: () => (
    <div data-testid="recent-activities">Recent Activities</div>
  ),
}));

vi.mock("lucide-react", () => ({
  Star: () => <svg data-testid="star-icon" />,
  Upload: () => <svg data-testid="upload-icon" />,
  Gift: () => <svg data-testid="gift-icon" />,
  SquareCheckBig: () => <svg data-testid="check-icon" />,
}));

const mockUser = {
  firstName: "Ekaterina",
};

const mockStats = {
  totalPoints: 1250,
  totalUploads: 24,
  totalRewards: 5,
  rank: 7,
};

const renderPage = () => {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUser.mockReturnValue(mockUser);
    userCanReview.mockResolvedValue(false);
    getUserDashboardStats.mockResolvedValue(mockStats);
  });

  it("renders nothing while loading", async () => {
    let resolveStats;

    getUserDashboardStats.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStats = resolve;
        }),
    );

    const { container } = renderPage();

    expect(container.firstChild).toBeInTheDocument();

    // The loading state is intentionally an empty div.
    expect(container.querySelector("main")).not.toBeInTheDocument();

    resolveStats(mockStats);

    await waitFor(() => {
      expect(
        screen.getByText("Добредојде назад, Ekaterina 👋"),
      ).toBeInTheDocument();
    });
  });

  it("renders the welcome message", async () => {
    renderPage();

    expect(
      await screen.findByText("Добредојде назад, Ekaterina 👋"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Еве преглед на твоите придонеси"),
    ).toBeInTheDocument();
  });

  it("sets the document title", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(document.title).toBe("Контролна табла");
  });

  it("fetches dashboard stats", async () => {
    renderPage();

    await waitFor(() => {
      expect(getUserDashboardStats).toHaveBeenCalledTimes(1);
    });
  });

  it("fetches whether the user can review content", async () => {
    renderPage();

    await waitFor(() => {
      expect(userCanReview).toHaveBeenCalledTimes(1);
    });
  });

  it("renders all dashboard statistics", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Вкупно поени")).toBeInTheDocument();
    });

    expect(screen.getByText("1250")).toBeInTheDocument();
    expect(screen.getByText("Прикачувања")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Достапни награди")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Ранг")).toBeInTheDocument();
    expect(screen.getByText("#7")).toBeInTheDocument();
  });

  it("renders the upload content link", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    const uploadLink = screen.getByRole("link", {
      name: /прикачи содржина/i,
    });

    expect(uploadLink).toBeInTheDocument();
    expect(uploadLink).toHaveAttribute("href", "/upload");
  });

  it("does not render the review link when the user cannot review", async () => {
    userCanReview.mockResolvedValue(false);

    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(
      screen.queryByRole("link", {
        name: /прегледај содржина/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders the review link when the user can review", async () => {
    userCanReview.mockResolvedValue(true);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: /прегледај содржина/i,
        }),
      ).toBeInTheDocument();
    });

    const reviewLink = screen.getByRole("link", {
      name: /прегледај содржина/i,
    });

    expect(reviewLink).toHaveAttribute("href", "/admin");
  });

  it("renders the upload card text", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(screen.getByText("Прикачи содржина")).toBeInTheDocument();
    expect(
      screen.getByText("Сподели текст, аудио или видео податоци"),
    ).toBeInTheDocument();
  });

  it("renders the review card text when reviewing is allowed", async () => {
    userCanReview.mockResolvedValue(true);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Прегледај содржина")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Помогни во проверката на поставените податоци",
      ),
    ).toBeInTheDocument();
  });

  it("renders RecentActivities", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(
      screen.getByTestId("recent-activities"),
    ).toBeInTheDocument();
  });

  it("handles userCanReview failure by hiding the review card", async () => {
    userCanReview.mockRejectedValue(new Error("Request failed"));

    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    await waitFor(() => {
      expect(
        screen.queryByRole("link", {
          name: /прегледај содржина/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders the correct user name from getUser", async () => {
    getUser.mockReturnValue({
      firstName: "Марко",
    });

    renderPage();

    expect(
      await screen.findByText("Добредојде назад, Марко 👋"),
    ).toBeInTheDocument();
  });

  it("renders stats returned by the API", async () => {
    getUserDashboardStats.mockResolvedValue({
      totalPoints: 999,
      totalUploads: 42,
      totalRewards: 12,
      rank: 3,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("999")).toBeInTheDocument();
    });

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("renders exactly four stat cards", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(screen.getAllByTestId("stat-card")).toHaveLength(4);
  });

  it("renders Sidebar", async () => {
    renderPage();

    await screen.findByText("Добредојде назад, Ekaterina 👋");

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });
});
