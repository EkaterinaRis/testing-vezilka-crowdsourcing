import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";

vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../components/Button.jsx", () => ({
  default: ({ children, to, ...props }) => (
    <button {...props} data-to={to}>
      {children}
    </button>
  ),
}));

vi.mock("../components/Badge.jsx", () => ({
  default: ({ children }) => <span data-testid="badge">{children}</span>,
}));

vi.mock("../components/avatar", () => ({
  Avatar: ({ children, ...props }) => (
    <div data-testid="avatar" {...props}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children, ...props }) => (
    <div data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../utils/auth.js", () => ({
  getUser: vi.fn(),
}));

vi.mock("../utils/dateFormatter.js", () => ({
  getMonthInMacedonian: vi.fn(() => "мај"),
}));

vi.mock("../api/userApi.js", () => ({
  getUserUploads: vi.fn(),
}));

import { getUser } from "../utils/auth.js";
import { getUserUploads } from "../api/userApi.js";
import { getMonthInMacedonian } from "../utils/dateFormatter.js";
import { toast } from "sonner";

const mockUser = {
  firstName: "Екатерина",
  lastName: "Петрова",
  email: "admin@example.com",
  createdAt: new Date("2024-05-15T10:00:00"),
  avatarUrl: null,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUser.mockReturnValue(mockUser);
    getUserUploads.mockResolvedValue([]);
  });

  describe("initial rendering", () => {
    it("renders the profile page", async () => {
      renderPage();

      expect(screen.getByText("Профил")).toBeInTheDocument();
      expect(screen.getByText("Екатерина Петрова")).toBeInTheDocument();
      expect(screen.getByText("Придонесувач")).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    it("sets the document title", () => {
      renderPage();

      expect(document.title).toBe("Профил");
    });

    it("renders the sidebar", () => {
      renderPage();

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("renders the edit profile button", () => {
      renderPage();

      const button = screen.getByRole("button", {
        name: "Уреди профил",
      });

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-to", "/profile/edit");
    });
  });

  describe("user information", () => {
    it("renders the user's email", () => {
      renderPage();

      expect(
        screen.getByText("admin@example.com"),
      ).toBeInTheDocument();
    });

    it("renders the user's join date", () => {
      renderPage();

      expect(getMonthInMacedonian).toHaveBeenCalledWith(
        mockUser.createdAt,
      );

      expect(
        screen.getByText(/Се придружи во мај 2024/),
      ).toBeInTheDocument();
    });

    it("renders the user's points and rank", () => {
      renderPage();

      expect(
        screen.getByText("2,450 поени · Ранг #42"),
      ).toBeInTheDocument();
    });

    it("renders the avatar fallback when there is no avatar", () => {
      renderPage();

      expect(screen.getByTestId("avatar")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
    });

    it("renders the avatar image when the user has an avatar", () => {
      getUser.mockReturnValue({
        ...mockUser,
        avatarUrl: "https://example.com/avatar.jpg",
      });

      renderPage();

      const image = screen.getByRole("img", {
        name: "avatar",
      });

      expect(image).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg",
      );
    });
  });

  describe("badges", () => {
    it("renders the badges section", () => {
      renderPage();

      expect(
        screen.getByText("Значки и достигнувања"),
      ).toBeInTheDocument();
    });

    it("renders all available badges", () => {
      renderPage();

      expect(screen.getByText("firstUpload")).toBeInTheDocument();
      expect(screen.getByText("reviewer")).toBeInTheDocument();
      expect(screen.getByText("hundredPoints")).toBeInTheDocument();
      expect(screen.getByText("topContributor")).toBeInTheDocument();
    });
  });

  describe("contribution history", () => {
    it("renders the contribution history section", () => {
      renderPage();

      expect(
        screen.getByText("Историја на придонеси"),
      ).toBeInTheDocument();
    });

    it("shows empty state when there are no contributions", async () => {
      getUserUploads.mockResolvedValue([]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Нема придонеси сè уште"),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Кога ќе започнеш да прикачуваш податоци/,
        ),
      ).toBeInTheDocument();
    });

    it("fetches user uploads on mount", async () => {
      renderPage();

      await waitFor(() => {
        expect(getUserUploads).toHaveBeenCalledTimes(1);
      });
    });

    it("renders text contribution", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "TEXT",
          topic: "Македонски јазик",
          description: "Опис на придонесот",
          createdAt: "2026-01-15T10:00:00Z",
          status: "APPROVED",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Македонски јазик"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/Text/)).toBeInTheDocument();
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
    });

    it("uses description when topic is empty", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "TEXT",
          topic: "   ",
          description: "Опис на придонесот",
          createdAt: "2026-01-15T10:00:00Z",
          status: "PENDING",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Опис на придонесот"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it("uses fallback title when topic and description are empty", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "TEXT",
          topic: " ",
          description: " ",
          createdAt: "2026-01-15T10:00:00Z",
          status: "PENDING",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Без наслов")).toBeInTheDocument();
      });
    });

    it("renders audio contribution", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "AUDIO",
          topic: "Аудио примерок",
          description: "",
          createdAt: "2026-02-10T10:00:00Z",
          status: "APPROVED",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Аудио примерок"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/Audio/)).toBeInTheDocument();
    });

    it("renders video contribution", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "VIDEO",
          topic: "Видео примерок",
          description: "",
          createdAt: "2026-03-10T10:00:00Z",
          status: "REJECTED",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Видео примерок"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/Video/)).toBeInTheDocument();
      expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    });

    it("renders image contribution", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "IMAGE",
          topic: "Слика",
          description: "",
          createdAt: "2026-04-10T10:00:00Z",
          status: "PENDING",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Слика")).toBeInTheDocument();
      });

      expect(screen.getByText(/Image/)).toBeInTheDocument();
    });

    it("renders multiple contributions", async () => {
      getUserUploads.mockResolvedValue([
        {
          type: "TEXT",
          topic: "Текстуален придонес",
          description: "",
          createdAt: "2026-01-10T10:00:00Z",
          status: "APPROVED",
        },
        {
          type: "AUDIO",
          topic: "Аудио придонес",
          description: "",
          createdAt: "2026-02-10T10:00:00Z",
          status: "PENDING",
        },
        {
          type: "VIDEO",
          topic: "Видео придонес",
          description: "",
          createdAt: "2026-03-10T10:00:00Z",
          status: "REJECTED",
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Текстуален придонес"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Аудио придонес"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Видео придонес"),
        ).toBeInTheDocument();
      });
    });

    it("shows an error toast when uploads fail", async () => {
      getUserUploads.mockRejectedValue(new Error("API error"));

      renderPage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Не успеавме да ја вчитаме историјата на придонеси!",
        );
      });
    });
  });
});
