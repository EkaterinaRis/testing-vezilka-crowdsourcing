import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AdminReviewPage from "../pages/AdminReviewPage";

import {
  getLatestReview,
  getQualityScore,
  getTranscription,
  reviewDocumentAccept,
  reviewDocumentReject,
} from "../api/userApi";

import { normalizeUrls } from "../utils/normalizeUrls";

vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../components/Button", () => ({
  default: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../components/Badge", () => ({
  default: ({ children }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("../utils/normalizeUrls", () => ({
  normalizeUrls: vi.fn((url) => url),
}));

vi.mock("../api/userApi", () => ({
  getLatestReview: vi.fn(),
  getQualityScore: vi.fn(),
  getTranscription: vi.fn(),
  reviewDocumentAccept: vi.fn(),
  reviewDocumentReject: vi.fn(),
}));

const baseDocument = {
  id: 123,
  title: "Test document",
  description: "This is a test document description.",
  type: "TEXT",
  fileUrl: "https://example.com/test.pdf",
  uploadedBy: "user@example.com",
  createdAt: "2025-01-01",
  status: "pending",
};

const audioDocument = {
  ...baseDocument,
  type: "AUDIO",
  fileUrl: "https://example.com/audio.mp3",
};

const videoDocument = {
  ...baseDocument,
  type: "VIDEO",
  fileUrl: "https://example.com/video.mp4",
};

const imageDocument = {
  ...baseDocument,
  type: "IMAGE",
  fileUrl: "https://example.com/image.jpg",
};

const officeDocument = {
  ...baseDocument,
  type: "TEXT",
  fileUrl: "https://example.com/document.docx",
};

const localhostOfficeDocument = {
  ...baseDocument,
  type: "TEXT",
  fileUrl: "http://localhost:8080/document.pptx",
};

const renderPage = (document = baseDocument) => {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/admin/review",
          state: {
            document,
          },
        },
      ]}
    >
      <AdminReviewPage />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();

  getLatestReview.mockResolvedValue({
    reviewerFullName: "John Reviewer",
    comment: "Looks good",
  });

  getQualityScore.mockResolvedValue(3);

  getTranscription.mockResolvedValue({
    text: "This is the transcription.",
  });

  reviewDocumentAccept.mockResolvedValue({});
  reviewDocumentReject.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
});

describe("AdminReviewPage", () => {
  it("renders the page", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Преглед на документ",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Администраторска проверка на документ"),
    ).toBeInTheDocument();

    expect(screen.getByText("Test document")).toBeInTheDocument();
    expect(screen.getByText("TEXT")).toBeInTheDocument();
  });

  it("renders the document information", async () => {
    renderPage();

    expect(
      screen.getByText("This is a test document description."),
    ).toBeInTheDocument();

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();
  });

  it("renders the sidebar", () => {
    renderPage();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the back link", () => {
    renderPage();

    const backLink = screen.getByRole("link", {
      name: /Назад/i,
    });

    expect(backLink).toHaveAttribute("href", "/admin");
  });

  it("loads the quality score", async () => {
    getQualityScore.mockResolvedValue(4);

    renderPage();

    await waitFor(() => {
      expect(getQualityScore).toHaveBeenCalledWith(123);
    });

    await waitFor(() => {
      expect(
        screen.getByText("4 / 5"),
      ).toBeInTheDocument();
    });
  });

  it("uses default quality score when API fails", async () => {
    getQualityScore.mockRejectedValue(new Error("API error"));

    renderPage();

    await waitFor(() => {
      expect(getQualityScore).toHaveBeenCalledWith(123);
    });

    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("loads the latest reviewer and comment", async () => {
    getLatestReview.mockResolvedValue({
      reviewerFullName: "Jane Reviewer",
      comment: "Looks good",
    });

    renderPage();

    await waitFor(() => {
      expect(getLatestReview).toHaveBeenCalledWith(123);
    });

    await waitFor(() => {
      expect(screen.getByText("Jane Reviewer")).toBeInTheDocument();
    });

    const commentTextarea = screen.getByPlaceholderText(
      "Остави коментар...",
    );

    expect(commentTextarea).toHaveValue("Looks good");
  });

  it("handles latest review API failure", async () => {
    getLatestReview.mockRejectedValue(new Error("API error"));

    renderPage();

    await waitFor(() => {
      expect(getLatestReview).toHaveBeenCalledWith(123);
    });

    expect(
      screen.queryByText("Jane Reviewer"),
    ).not.toBeInTheDocument();
  });

  it("allows changing the quality score", async () => {
    getQualityScore.mockResolvedValue(3);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("3 / 5")).toBeInTheDocument();
    });

    const scoreButton = screen.getByRole("button", {
      name: "Оценка 4",
    });

    fireEvent.click(scoreButton);

    expect(screen.getByText("4 / 5")).toBeInTheDocument();
  });

  it("allows selecting all quality scores", async () => {
    renderPage();

    for (let score = 1; score <= 5; score++) {
      fireEvent.click(
        screen.getByRole("button", {
          name: `Оценка ${score}`,
        }),
      );

      expect(
        screen.getByText(`${score} / 5`),
      ).toBeInTheDocument();
    }
  });

  it("allows editing the comment", () => {
    renderPage();

    const textarea = screen.getByPlaceholderText(
      "Остави коментар...",
    );

    fireEvent.change(textarea, {
      target: {
        value: "New administrator comment",
      },
    });

    expect(textarea).toHaveValue(
      "New administrator comment",
    );
  });

  it("accepts a document", async () => {
    getQualityScore.mockResolvedValue(4);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("4 / 5")).toBeInTheDocument();
    });

    const commentTextarea = screen.getByPlaceholderText(
      "Остави коментар...",
    );

    fireEvent.change(commentTextarea, {
      target: {
        value: "Looks good",
      },
    });

    const acceptButton = screen.getByRole("button", {
      name: /Прифати документ/i,
    });

    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(reviewDocumentAccept).toHaveBeenCalledWith({
        id: 123,
        comment: "Looks good",
        qualityScore: 4,
        transcription: "This is the transcription.",
      });
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "approved",
    );
  });

  it("changes status to approved after successful accept", async () => {
    renderPage();

    const acceptButton = screen.getByRole("button", {
      name: /Прифати документ/i,
    });

    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByTestId("badge")).toHaveTextContent(
        "approved",
      );
    });
  });

  it("rejects a document", async () => {
    getQualityScore.mockResolvedValue(4);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("4 / 5")).toBeInTheDocument();
    });

    const commentTextarea = screen.getByPlaceholderText(
      "Остави коментар...",
    );

    fireEvent.change(commentTextarea, {
      target: {
        value: "Document needs changes",
      },
    });

    const rejectButton = screen.getByRole("button", {
      name: /Одбиј документ/i,
    });

    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(reviewDocumentReject).toHaveBeenCalledWith({
        id: 123,
        comment: "Document needs changes",
        qualityScore: 4,
      });
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "rejected",
    );
  });

  it("changes status to rejected after successful reject", async () => {
    renderPage();

    const rejectButton = screen.getByRole("button", {
      name: /Одбиј документ/i,
    });

    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByTestId("badge")).toHaveTextContent(
        "rejected",
      );
    });
  });

  describe("media documents", () => {
    it("loads transcription for audio", async () => {
      getTranscription.mockResolvedValue({
        text: "Audio transcription",
      });

      renderPage(audioDocument);

      await waitFor(() => {
        expect(getTranscription).toHaveBeenCalledWith(123);
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Audio transcription"),
        ).toBeInTheDocument();
      });
    });

    it("loads transcription for video", async () => {
      getTranscription.mockResolvedValue({
        text: "Video transcription",
      });

      renderPage(videoDocument);

      await waitFor(() => {
        expect(getTranscription).toHaveBeenCalledWith(123);
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Video transcription"),
        ).toBeInTheDocument();
      });
    });

    it("renders the transcription textarea for audio", async () => {
      renderPage(audioDocument);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("This is the transcription."),
        ).toBeInTheDocument();
      });
    });

    it("renders the transcription textarea for video", async () => {
      renderPage(videoDocument);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("This is the transcription."),
        ).toBeInTheDocument();
      });
    });

    it("allows editing transcription", async () => {
      renderPage(audioDocument);

      const transcriptionTextarea =
        await screen.findByDisplayValue(
          "This is the transcription.",
        );

      fireEvent.change(transcriptionTextarea, {
        target: {
          value: "Edited transcription",
        },
      });

      expect(transcriptionTextarea).toHaveValue(
        "Edited transcription",
      );
    });

    it("shows transcription error message when API fails", async () => {
      getTranscription.mockRejectedValue(
        new Error("Transcription failed"),
      );

      renderPage(audioDocument);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Транскрипцијата не можеше да се вчита/i,
          ),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByPlaceholderText(
          /Транскрипцијата ќе се прикаже овде/i,
        ),
      ).toBeInTheDocument();
    });

    it("accepts media with transcription", async () => {
      getTranscription.mockResolvedValue({
        text: "Original transcription",
      });

      getQualityScore.mockResolvedValue(4);

      renderPage(audioDocument);

      const transcriptionTextarea =
        await screen.findByDisplayValue(
          "Original transcription",
        );

      fireEvent.change(transcriptionTextarea, {
        target: {
          value: "Edited transcription",
        },
      });

      const acceptButton = screen.getByRole("button", {
        name: /Прифати документ/i,
      });

      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(reviewDocumentAccept).toHaveBeenCalledWith({
          id: 123,
          comment: "Looks good",
          qualityScore: 4,
          transcription: "Edited transcription",
        });
      });
    });

    it("rejects media with transcription", async () => {
      getTranscription.mockResolvedValue({
        text: "Original transcription",
      });

      getQualityScore.mockResolvedValue(4);

      renderPage(audioDocument);

      const transcriptionTextarea =
        await screen.findByDisplayValue(
          "Original transcription",
        );

      fireEvent.change(transcriptionTextarea, {
        target: {
          value: "Edited transcription",
        },
      });

      const rejectButton = screen.getByRole("button", {
        name: /Одбиј документ/i,
      });

      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(reviewDocumentReject).toHaveBeenCalledWith({
          id: 123,
          comment: "Looks good",
          qualityScore: 4,
          transcription: "Edited transcription",
        });
      });
    });
  });

  describe("audio documents", () => {
    it("renders an audio player", () => {
      const { container } = renderPage(audioDocument);

      const audio = container.querySelector("audio");

      expect(audio).toBeInTheDocument();
    });

    it("renders the correct audio source", () => {
      const { container } = renderPage(audioDocument);

      const audio = container.querySelector("audio");
      const source = audio?.querySelector("source");

      expect(source).toBeInTheDocument();
      expect(source).toHaveAttribute(
        "src",
        "https://example.com/audio.mp3",
      );
      expect(source).toHaveAttribute(
        "type",
        "audio/mpeg",
      );
    });

    it("renders audio controls", () => {
      const { container } = renderPage(audioDocument);

      const audio = container.querySelector("audio");

      expect(audio).toHaveAttribute("controls");
    });
  });

  describe("video documents", () => {
    it("renders a video player", () => {
      const { container } = renderPage(videoDocument);

      const video = container.querySelector("video");

      expect(video).toBeInTheDocument();
    });

    it("renders the correct video source", () => {
      const { container } = renderPage(videoDocument);

      const video = container.querySelector("video");
      const source = video?.querySelector("source");

      expect(source).toBeInTheDocument();
      expect(source).toHaveAttribute(
        "src",
        "https://example.com/video.mp4",
      );
      expect(source).toHaveAttribute(
        "type",
        "video/mp4",
      );
    });

    it("renders video controls", () => {
      const { container } = renderPage(videoDocument);

      const video = container.querySelector("video");

      expect(video).toHaveAttribute("controls");
    });
  });

  describe("image documents", () => {
    it("renders an image", () => {
      renderPage(imageDocument);

      const image = screen.getByRole("img", {
        name: "Test document",
      });

      expect(image).toBeInTheDocument();
    });

    it("renders the correct image source", () => {
      renderPage(imageDocument);

      const image = screen.getByRole("img", {
        name: "Test document",
      });

      expect(image).toHaveAttribute(
        "src",
        "https://example.com/image.jpg",
      );
    });
  });

  describe("PDF documents", () => {
    it("renders a PDF iframe", () => {
      const { container } = renderPage(baseDocument);

      const iframe = container.querySelector("iframe");

      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        "https://example.com/test.pdf",
      );
    });
  });

  describe("Office documents", () => {
    it("renders Office viewer for remote documents", () => {
      renderPage(officeDocument);

      const iframe = screen.getByTitle("Test document");

      expect(iframe).toBeInTheDocument();

      expect(iframe).toHaveAttribute(
        "src",
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          "https://example.com/document.docx",
        )}`,
      );
    });

    it("shows download option for localhost Office files", () => {
      renderPage(localhostOfficeDocument);

      expect(
        screen.getByText(
          /Онлајн прегледувачот на Office не може да отвори/i,
        ),
      ).toBeInTheDocument();

      const downloadLink = screen.getByRole("link", {
        name: /Преземи ја презентацијата/i,
      });

      expect(downloadLink).toHaveAttribute(
        "href",
        "http://localhost:8080/document.pptx",
      );

      expect(downloadLink).toHaveAttribute(
        "download",
      );
    });
  });

  it("calls normalizeUrls with the document file URL", () => {
    renderPage();

    expect(normalizeUrls).toHaveBeenCalledWith(
      "https://example.com/test.pdf",
    );
  });

  it("renders pending status", () => {
    renderPage({
      ...baseDocument,
      status: "pending",
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "pending",
    );
  });

  it("renders approved status", () => {
    renderPage({
      ...baseDocument,
      status: "approved",
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "approved",
    );
  });

  it("renders rejected status", () => {
    renderPage({
      ...baseDocument,
      status: "rejected",
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "rejected",
    );
  });

  it("renders IMAGE as Слика in information", () => {
    renderPage(imageDocument);

    expect(screen.getByText("Слика")).toBeInTheDocument();
  });

  it("renders TEXT as Текст in information", () => {
    renderPage(baseDocument);

    expect(screen.getByText("Текст")).toBeInTheDocument();
  });

  it("renders AUDIO as Аудио in information", () => {
    renderPage(audioDocument);

    expect(screen.getByText("Аудио")).toBeInTheDocument();
  });

  it("renders VIDEO as Видео in information", () => {
    renderPage(videoDocument);

    expect(screen.getByText("Видео")).toBeInTheDocument();
  });

  it("renders fallback when no document is selected", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/admin/review",
            state: {},
          },
        ]}
      >
        <AdminReviewPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("No document selected"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Back",
      }),
    ).toBeInTheDocument();
  });

  it("does not crash when accepting fails", async () => {
    reviewDocumentAccept.mockRejectedValue(
      new Error("Accept failed"),
    );

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Прифати документ/i,
      }),
    );

    await waitFor(() => {
      expect(reviewDocumentAccept).toHaveBeenCalled();
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "pending",
    );
  });

  it("does not crash when rejecting fails", async () => {
    reviewDocumentReject.mockRejectedValue(
      new Error("Reject failed"),
    );

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Одбиј документ/i,
      }),
    );

    await waitFor(() => {
      expect(reviewDocumentReject).toHaveBeenCalled();
    });

    expect(screen.getByTestId("badge")).toHaveTextContent(
      "pending",
    );
  });
});
