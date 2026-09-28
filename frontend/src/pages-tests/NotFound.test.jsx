import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../pages/NotFound";

describe("NotFound", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    document.title = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const renderPage = (initialEntries = ["/non-existent-route"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <NotFound />
      </MemoryRouter>
    );
  };

  describe("initial rendering", () => {
    it("renders the 404 status", () => {
      renderPage();

      expect(screen.getByText("404")).toBeInTheDocument();
    });

    it("renders the page not found message", () => {
      renderPage();

      expect(
        screen.getByText("Oops! Page not found")
      ).toBeInTheDocument();
    });

    it("renders the return home link", () => {
      renderPage();

      expect(
        screen.getByText("Return to Home")
      ).toBeInTheDocument();
    });

    it("renders the home link with the correct href", () => {
      renderPage();

      const homeLink = screen.getByRole("link", {
        name: "Return to Home",
      });

      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("document title", () => {
    it("sets the document title to Не е пронајдено", () => {
      renderPage();

      expect(document.title).toBe("Не е пронајдено");
    });
  });

  describe("page structure", () => {
    it("renders the main 404 heading as an h1", () => {
      renderPage();

      const heading = screen.getByRole("heading", {
        level: 1,
        name: "404",
      });

      expect(heading).toBeInTheDocument();
    });

    it("renders the not found message as a paragraph", () => {
      renderPage();

      const paragraph = screen.getByText("Oops! Page not found");

      expect(paragraph.tagName).toBe("P");
    });

    it("renders exactly one home link", () => {
      renderPage();

      const links = screen.getAllByRole("link");

      expect(links).toHaveLength(1);
      expect(links[0]).toHaveTextContent("Return to Home");
    });
  });
});
