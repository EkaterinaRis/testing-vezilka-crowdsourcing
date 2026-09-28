import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PublicFilesPage from "../pages/PublicFilesPage.jsx";

vi.mock("../components/Navbar.jsx", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock("../components/Button.jsx", () => ({
  default: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("../utils/normalizeUrls.js", () => ({
  normalizeUrls: (url) => url,
}));

const mockFiles = [
  {
    id: 1,
    type: "TEXT",
    topic: "Македонски јазик",
    description: "Податоци за македонскиот јазик",
    originalFileName: "makedonski.txt",
    uploaderFullName: "Екатерина Петрова",
    avatarUrl: "https://example.com/avatar.jpg",
    dialect: { name: "Стандарден" },
    qualityScore: 4.7,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    type: "AUDIO",
    topic: "Говорни примероци",
    description: "Аудио податоци",
    originalFileName: "audio.mp3",
    uploaderFullName: "Петко Петковски",
    avatarUrl: null,
    dialect: { name: "Скопски" },
    qualityScore: 4.2,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: 3,
    type: "VIDEO",
    topic: "Видео пример",
    description: "Видео со македонски говор",
    originalFileName: "video.mp4",
    uploaderFullName: "Ана Ана",
    avatarUrl: null,
    dialect: null,
    qualityScore: 3.9,
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: 4,
    type: "IMAGE",
    topic: "Слика",
    description: "",
    originalFileName: null,
    uploaderFullName: null,
    avatarUrl: null,
    dialect: null,
    qualityScore: null,
    createdAt: "2026-04-01T10:00:00Z",
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <PublicFilesPage />
    </MemoryRouter>,
  );

const createFetchResponse = (data, ok = true) => ({
  ok,
  json: async () => data,
});

describe("PublicFilesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    document.title = "";

    global.fetch = vi.fn().mockResolvedValue(
      createFetchResponse({
        content: mockFiles,
        totalPages: 1,
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial rendering", () => {
    it("renders the page title and description", async () => {
      renderPage();

      expect(screen.getByText("Јавни податоци")).toBeInTheDocument();
      expect(
        screen.getByText("Прегледај и преземи јавно достапни податоци"),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(document.title).toBe("Податоци");
      });
    });

    it("renders the navbar", () => {
      renderPage();

      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("renders the search input", () => {
      renderPage();

      expect(
        screen.getByPlaceholderText("Пребарај..."),
      ).toBeInTheDocument();
    });

    it("fetches public files on mount", async () => {
      renderPage();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/content/public"),
        );
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("pageNumber=0"),
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=12"),
      );
    });
  });

  describe("loading state", () => {
    it("shows a loading spinner while files are being fetched", () => {
      global.fetch.mockReturnValueOnce(new Promise(() => {}));

      renderPage();

      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

  });

  describe("files", () => {

    it("renders file descriptions", async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Податоци за македонскиот јазик"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Аудио податоци")).toBeInTheDocument();
      expect(screen.getByText("Видео со македонски говор")).toBeInTheDocument();
    });

    it("renders original file names when available", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("makedonski.txt")).toBeInTheDocument();
      });

      expect(screen.getByText("audio.mp3")).toBeInTheDocument();
      expect(screen.getByText("video.mp4")).toBeInTheDocument();
    });

    it("uses the fallback title when topic is missing", async () => {
      global.fetch.mockResolvedValueOnce(
        createFetchResponse({
          content: [
            {
              ...mockFiles[0],
              topic: "",
            },
          ],
          totalPages: 1,
        }),
      );

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Без наслов")).toBeInTheDocument();
      });
    });

    it("uses the fallback description when description is missing", async () => {
      global.fetch.mockResolvedValueOnce(
        createFetchResponse({
          content: [
            {
              ...mockFiles[0],
              description: "",
            },
          ],
          totalPages: 1,
        }),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Нема додадено опис за оваа содржина."),
        ).toBeInTheDocument();
      });
    });


    it("renders download buttons", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getAllByText("Преземи")).toHaveLength(4);
      });
    });
  });

  describe("empty state", () => {
    it("renders the empty state when no files are returned", async () => {
      global.fetch.mockResolvedValueOnce(
        createFetchResponse({
          content: [],
          totalPages: 1,
        }),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Не се пронајдени датотеки"),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Нема јавни податоци кои одговараат на твоето пребарување/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("search", () => {
    it("updates the search input", () => {
      renderPage();

      const searchInput = screen.getByPlaceholderText("Пребарај...");

      fireEvent.change(searchInput, {
        target: { value: "македонски" },
      });

      expect(searchInput).toHaveValue("македонски");
    });

  });
  
});
