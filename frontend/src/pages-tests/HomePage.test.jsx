import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";

vi.mock("../components/Navbar.jsx", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock("../components/Button.jsx", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../api/userApi.js", () => ({
  getHomePageStats: vi.fn(),
}));

vi.mock("../utils/formatCompactNumber.js", () => ({
  formatCompactNumber: vi.fn((value) => `formatted-${value}`),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

import { getHomePageStats } from "../api/userApi.js";
import { formatCompactNumber } from "../utils/formatCompactNumber.js";

const renderPage = (initialEntries = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <HomePage />
    </MemoryRouter>
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getHomePageStats.mockResolvedValue([
      {
        label: "Придонесувачи",
        value: 1250,
      },
      {
        label: "Податоци",
        value: 98765,
      },
    ]);

    formatCompactNumber.mockImplementation((value) => `formatted-${value}`);

    document.title = "";
  });

  describe("initial rendering", () => {
    it("renders the navbar", async () => {
      renderPage();

      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("sets the document title", async () => {
      renderPage();

      await waitFor(() => {
        expect(document.title).toBe("Почетна");
      });
    });

    it("renders the hero heading", () => {
      renderPage();

      expect(
        screen.getByText("Помогни во градењето на иднината на")
      ).toBeInTheDocument();

      expect(
        screen.getByText("македонската ВИ")
      ).toBeInTheDocument();
    });

    it("renders the AI support badge", () => {
      renderPage();

      expect(
        screen.getByText(
          "Поддршка за вештачка интелигенција на македонски јазик"
        )
      ).toBeInTheDocument();
    });

    it("renders the hero description", () => {
      renderPage();

      expect(
        screen.getByText(/Придонеси со текст, аудио и видео податоци/)
      ).toBeInTheDocument();
    });

    it("renders the main action buttons", () => {
      renderPage();

      expect(
        screen.getByText("Започни да придонесуваш")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Дознај повеќе")
      ).toBeInTheDocument();
    });

    it("links the contribution button to register", () => {
      renderPage();

      const link = screen
        .getByText("Започни да придонесуваш")
        .closest("a");

      expect(link).toHaveAttribute("href", "/register");
    });

  });

  describe("statistics", () => {
    it("calls getHomePageStats on mount", async () => {
      renderPage();

      await waitFor(() => {
        expect(getHomePageStats).toHaveBeenCalledTimes(1);
      });
    });

    it("shows loading skeletons before statistics load", () => {
      getHomePageStats.mockReturnValue(new Promise(() => {}));

      renderPage();

      const spinners = document.querySelectorAll(".animate-spin");

      expect(spinners).toHaveLength(2);
    });

    it("renders statistics after loading", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("formatted-1250")).toBeInTheDocument();
        expect(screen.getByText("formatted-98765")).toBeInTheDocument();
      });
    });

    it("renders statistic labels", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Придонесувачи")).toBeInTheDocument();
        expect(screen.getByText("Податоци")).toBeInTheDocument();
      });
    });

    it("formats every statistic value", async () => {
      renderPage();

      await waitFor(() => {
        expect(formatCompactNumber).toHaveBeenCalledWith(1250);
        expect(formatCompactNumber).toHaveBeenCalledWith(98765);
      });
    });

    it("renders all returned statistics", async () => {
      getHomePageStats.mockResolvedValue([
        { label: "Корисници", value: 10 },
        { label: "Прикачувања", value: 20 },
        { label: "Прегледи", value: 30 },
      ]);

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Корисници")).toBeInTheDocument();
        expect(screen.getByText("Прикачувања")).toBeInTheDocument();
        expect(screen.getByText("Прегледи")).toBeInTheDocument();
      });
    });

    it("keeps loading state when the statistics request fails", async () => {
      getHomePageStats.mockRejectedValue(new Error("API error"));

      renderPage();

      await waitFor(() => {
        expect(getHomePageStats).toHaveBeenCalledTimes(1);
      });

      expect(document.querySelectorAll(".animate-spin")).toHaveLength(2);
    });
  });

  describe("how it works section", () => {
    it("renders the section heading", () => {
      renderPage();

      expect(
        screen.getByText("Како функционира")
      ).toBeInTheDocument();
    });

    it("renders the section description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Три едноставни чекори за придонес кон македонската јазична ВИ"
        )
      ).toBeInTheDocument();
    });

    it("renders all three steps", () => {
      renderPage();

      expect(screen.getByText("Прикачи")).toBeInTheDocument();
      expect(screen.getByText("Освои поени")).toBeInTheDocument();
      expect(screen.getByText("Искористи награди")).toBeInTheDocument();
    });

    it("renders the step numbers", () => {
      renderPage();

      expect(screen.getByText("Чекор 1")).toBeInTheDocument();
      expect(screen.getByText("Чекор 2")).toBeInTheDocument();
      expect(screen.getByText("Чекор 3")).toBeInTheDocument();
    });

    it("renders upload step description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Сподели текст, аудио или видео на македонски. Секој придонес е важен."
        )
      ).toBeInTheDocument();
    });

    it("renders points step description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Биди награден за секој придонес и преглед што го правиш."
        )
      ).toBeInTheDocument();
    });

    it("renders rewards step description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Размени поени за курсеви, погодности и ексклузивни награди."
        )
      ).toBeInTheDocument();
    });

    it("has the correct section id", () => {
      renderPage();

      expect(
        document.getElementById("how-it-works")
      ).toBeInTheDocument();
    });
  });

  describe("features section", () => {
    it("renders the section heading", () => {
      renderPage();

      expect(
        screen.getByText("Што можеш да правиш")
      ).toBeInTheDocument();
    });

    it("renders the section description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Повеќе начини да придонесеш и да оставиш печат"
        )
      ).toBeInTheDocument();
    });

    it("renders all feature titles", () => {
      renderPage();

      expect(
        screen.getByText("Текстуални податоци")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Аудио податоци")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Видео податоци")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Загарантиран квалитет")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Заедница")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Со награди")
      ).toBeInTheDocument();
    });

    it("renders text feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Поднеси статии, реченици и преводи на македонски."
        )
      ).toBeInTheDocument();
    });

    it("renders audio feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Сними говорни примероци за тренирање на гласовно препознавање."
        )
      ).toBeInTheDocument();
    });

    it("renders video feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Прикачи видеа со македонски говор за мултимодална ВИ."
        )
      ).toBeInTheDocument();
    });

    it("renders quality feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Прегледот од заедницата обезбедува висококвалитетни податоци."
        )
      ).toBeInTheDocument();
    });

    it("renders community feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Придружи се на илјадници придонесувачи што го зачувуваат македонскиот."
        )
      ).toBeInTheDocument();
    });

    it("renders rewards feature description", () => {
      renderPage();

      expect(
        screen.getByText(
          "Освојувај значки, искачувај се на ранг-листи и отклучувај достигнувања."
        )
      ).toBeInTheDocument();
    });

    it("has the correct section id", () => {
      renderPage();

      expect(
        document.getElementById("features")
      ).toBeInTheDocument();
    });
  });

  describe("footer", () => {
    it("renders the Vezilka brand", () => {
      renderPage();

      expect(screen.getByText("Везилка")).toBeInTheDocument();
    });

    it("renders footer navigation links", () => {
      renderPage();

      expect(screen.getByText("Почетна")).toBeInTheDocument();
      expect(screen.getByText("Kako функционира")).toBeInTheDocument();
      expect(screen.getByText("Можности")).toBeInTheDocument();
    });

    it("renders the copyright text", () => {
      renderPage();

      expect(
        screen.getByText("© 2026 Везилка. Сите права се задржани.")
      ).toBeInTheDocument();
    });

    it("links footer home to hero", () => {
      renderPage();

      const link = screen.getByText("Почетна").closest("a");

      expect(link).toHaveAttribute("href", "#hero");
    });

    it("links footer how-it-works correctly", () => {
      renderPage();

      const link = screen.getByText("Kako функционира").closest("a");

      expect(link).toHaveAttribute("href", "#how-it-works");
    });

    it("links footer features correctly", () => {
      renderPage();

      const link = screen.getByText("Можности").closest("a");

      expect(link).toHaveAttribute("href", "#features");
    });
  });

  describe("hash navigation", () => {
    it("scrolls to the requested section when a hash exists", async () => {
      const scrollIntoView = vi.fn();

      window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

      renderPage(["/#features"]);

      await waitFor(
        () => {
          expect(scrollIntoView).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("does not scroll when there is no hash", () => {
      const scrollIntoView = vi.fn();

      window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

      renderPage(["/"]);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("API edge cases", () => {
    it("renders an empty statistics area when API returns an empty array", async () => {
      getHomePageStats.mockResolvedValue([]);

      renderPage();

      await waitFor(() => {
        expect(getHomePageStats).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText("Придонесувачи")).not.toBeInTheDocument();
      expect(document.querySelectorAll(".animate-spin")).toHaveLength(0);
    });

    it("handles zero statistic values", async () => {
      getHomePageStats.mockResolvedValue([
        {
          label: "Придонеси",
          value: 0,
        },
        {
          label: "Корисници",
          value: 0,
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(formatCompactNumber).toHaveBeenCalledWith(0);
        expect(screen.getAllByText("formatted-0")).toHaveLength(2);
      });
    });

    it("handles large statistic values", async () => {
      getHomePageStats.mockResolvedValue([
        {
          label: "Голем број",
          value: 1000000000,
        },
      ]);

      renderPage();

      await waitFor(() => {
        expect(formatCompactNumber).toHaveBeenCalledWith(1000000000);
        expect(screen.getByText("formatted-1000000000")).toBeInTheDocument();
      });
    });
  });
});
