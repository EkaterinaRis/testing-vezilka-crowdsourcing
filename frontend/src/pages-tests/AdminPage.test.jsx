import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPage from "../pages/AdminPage";

import {
  getPendingDocuments,
  getApprovedDocuments,
  getRejectedDocuments,
  getAllUsersPaginated,
  blockUser,
  unblockUser,
  updateUserRole,
} from "../api/userApi";

import { userIsAdmin } from "../utils/auth";

vi.mock("../api/userApi", () => ({
  getPendingDocuments: vi.fn(),
  getApprovedDocuments: vi.fn(),
  getRejectedDocuments: vi.fn(),
  getAllUsersPaginated: vi.fn(),
  blockUser: vi.fn(),
  unblockUser: vi.fn(),
  updateUserRole: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  userIsAdmin: vi.fn(),
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

vi.mock("../components/Badge.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

const pendingDocuments = [
  {
    id: 1,
    topic: "Pending text document",
    type: "TEXT",
    status: "PENDING",
    createdAt: "2026-01-01T10:00:00Z",
    originalFileName: "document.txt",
    fileUrl: "/files/document.txt",
    description: "Test description",
    uploader: {
      email: "user@example.com",
    },
  },
  {
    id: 2,
    topic: "Pending audio document",
    type: "AUDIO",
    status: "PENDING",
    createdAt: "2026-01-02T10:00:00Z",
    uploader: {
      email: "audio@example.com",
    },
  },
];

const approvedDocuments = [
  {
    id: 3,
    topic: "Approved document",
    type: "TEXT",
    status: "APPROVED",
    createdAt: "2026-01-03T10:00:00Z",
    uploader: {
      email: "approved@example.com",
    },
  },
];

const rejectedDocuments = [
  {
    id: 4,
    topic: "Rejected document",
    type: "VIDEO",
    status: "REJECTED",
    createdAt: "2026-01-04T10:00:00Z",
    uploader: {
      email: "rejected@example.com",
    },
  },
];

const users = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "USER",
    blocked: false,
    avatarUrl: null,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    role: "REVIEWER",
    blocked: true,
    avatarUrl: null,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  );

const getUserRow = (email) => {
  const emailNode = screen.getByText(email);
  const row = emailNode.closest("div")?.parentElement?.parentElement;

  if (!row) {
    throw new Error(`Could not find a user row for ${email}`);
  }

  return row;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();

  getPendingDocuments.mockResolvedValue(pendingDocuments);
  getApprovedDocuments.mockResolvedValue(approvedDocuments);
  getRejectedDocuments.mockResolvedValue(rejectedDocuments);

  userIsAdmin.mockResolvedValue(false);

  getAllUsersPaginated.mockResolvedValue({
    users,
    totalPages: 1,
    totalElements: users.length,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AdminPage", () => {
  it("renders the page heading", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Преглед и проверка" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getPendingDocuments).toHaveBeenCalled();
    });
  });

  it("loads pending, approved and rejected documents", async () => {
    renderPage();

    await waitFor(() => {
      expect(getPendingDocuments).toHaveBeenCalledTimes(1);
      expect(getApprovedDocuments).toHaveBeenCalledTimes(1);
      expect(getRejectedDocuments).toHaveBeenCalledTimes(1);
    });
  });

  it("displays document section cards", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /Документи за проверка/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: /Одобрени документи/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: /Одбиени документи/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("does not display user management for non-admin users", async () => {
    userIsAdmin.mockResolvedValue(false);

    renderPage();

    await waitFor(() => {
      expect(userIsAdmin).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByRole("button", {
        name: /Управување со корисници/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("displays user management for admin users", async () => {
    userIsAdmin.mockResolvedValue(true);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /Управување со корисници/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("opens pending documents section", async () => {
    renderPage();

    const pendingButton = await screen.findByRole("button", {
      name: /Документи за проверка/i,
    });

    fireEvent.click(pendingButton);

    expect(
      screen.getByRole("heading", {
        name: "Документи за проверка",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Текст документи")).toBeInTheDocument();
    expect(screen.getByText("Аудио документи")).toBeInTheDocument();
    expect(screen.getByText("Видео документи")).toBeInTheDocument();
    expect(screen.getByText("Слики")).toBeInTheDocument();

    expect(screen.getByText("Pending text document")).toBeInTheDocument();
    expect(screen.getByText("Pending audio document")).toBeInTheDocument();
  });

  it("opens approved documents section", async () => {
    renderPage();

    const approvedButton = await screen.findByRole("button", {
      name: /Одобрени документи/i,
    });

    fireEvent.click(approvedButton);

    expect(
      screen.getByRole("heading", {
        name: "Одобрени документи",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Approved document")).toBeInTheDocument();
  });

  it("opens rejected documents section", async () => {
    renderPage();

    const rejectedButton = await screen.findByRole("button", {
      name: /Одбиени документи/i,
    });

    fireEvent.click(rejectedButton);

    expect(
      screen.getByRole("heading", {
        name: "Одбиени документи",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Rejected document")).toBeInTheDocument();
  });

  it("returns to the main page from a document section", async () => {
    renderPage();

    const pendingButton = await screen.findByRole("button", {
      name: /Документи за проверка/i,
    });

    fireEvent.click(pendingButton);

    expect(
      screen.getByRole("heading", {
        name: "Документи за проверка",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));

    expect(
      screen.getByRole("heading", {
        name: "Преглед и проверка",
      }),
    ).toBeInTheDocument();
  });

  it("shows empty state when a document group has no documents", async () => {
    getPendingDocuments.mockResolvedValue([]);

    renderPage();

    const pendingButton = await screen.findByRole("button", {
      name: /Документи за проверка/i,
    });

    fireEvent.click(pendingButton);

    expect(screen.getAllByText("Нема документи")).toHaveLength(4);
  });

  it("navigates to review when a document is clicked", async () => {
    renderPage();

    const pendingButton = await screen.findByRole("button", {
      name: /Документи за проверка/i,
    });

    fireEvent.click(pendingButton);

    const reviewButton = screen.getAllByRole("button", {
      name: "Прегледај",
    })[0];

    expect(reviewButton).toBeInTheDocument();
  });

  describe("User management", () => {
    beforeEach(() => {
      userIsAdmin.mockResolvedValue(true);
    });

    it("opens the user management section", async () => {
      renderPage();

      const userManagementButton = await screen.findByRole("button", {
        name: /Управување со корисници/i,
      });

      fireEvent.click(userManagementButton);

      expect(
        screen.getByRole("heading", {
          name: "Управување со корисници",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/Пребарај по е-пошта/i),
      ).toBeInTheDocument();
    });

    it("loads users when user management is opened", async () => {
      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(getAllUsersPaginated).toHaveBeenCalledWith(0, "");
      });

      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("displays blocked users", async () => {
      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByText("Блокиран")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", {
          name: /Одблокирај/i,
        }),
      ).toBeInTheDocument();
    });

    it("blocks an active user", async () => {
      blockUser.mockResolvedValue({
        blocked: true,
      });

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });

      const activeUserRow = getUserRow("john@example.com");
      const blockButton = within(activeUserRow).getByRole("button", {
        name: /Блокирај/i,
      });

      fireEvent.click(blockButton);

      await waitFor(() => {
        expect(blockUser).toHaveBeenCalledWith("john@example.com");
      });

      await waitFor(() => {
        expect(screen.getAllByText("Блокиран")).toHaveLength(2);
      });
    });

    it("unblocks a blocked user", async () => {
      unblockUser.mockResolvedValue({
        blocked: false,
      });

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      });

      const blockedUserRow = getUserRow("jane@example.com");
      const unblockButton = within(blockedUserRow).getByRole("button", {
        name: /Одблокирај/i,
      });

      fireEvent.click(unblockButton);

      await waitFor(() => {
        expect(unblockUser).toHaveBeenCalledWith("jane@example.com");
      });
    });

    it("changes a user's role", async () => {
      updateUserRole.mockResolvedValue({
        role: "REVIEWER",
      });

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });

      const userRow = getUserRow("john@example.com");
      const roleButton = within(userRow).getByRole("button", {
        name: /USER/i,
      });

      fireEvent.click(roleButton);

      const reviewerOption = screen.getAllByRole("button", {
        name: "REVIEWER",
      })[0];

      fireEvent.click(reviewerOption);

      await waitFor(() => {
        expect(updateUserRole).toHaveBeenCalledWith(
          "john@example.com",
          "REVIEWER",
        );
      });
    });

    it("searches users after the debounce delay", async () => {
      vi.useRealTimers();

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(getAllUsersPaginated).toHaveBeenCalledWith(0, "");
      });

      const searchInput = screen.getByPlaceholderText(
        /Пребарај по е-пошта/i,
      );

      fireEvent.change(searchInput, {
        target: {
          value: "john@example.com",
        },
      });

      await waitFor(
        () => {
          expect(getAllUsersPaginated).toHaveBeenLastCalledWith(
            0,
            "john@example.com",
          );
        },
        { timeout: 2000 },
      );
    });

    it("shows pagination when there are multiple pages", async () => {
      getAllUsersPaginated.mockResolvedValue({
        users,
        totalPages: 3,
        totalElements: 30,
      });

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByText("1–12 од 30")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: /Следна/i }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /Претходна/i }),
      ).toBeInTheDocument();
    });

    it("moves to the next page", async () => {
      getAllUsersPaginated.mockResolvedValue({
        users,
        totalPages: 3,
        totalElements: 30,
      });

      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      await waitFor(() => {
        expect(getAllUsersPaginated).toHaveBeenCalledWith(0, "");
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: /Следна/i,
        }),
      );

      await waitFor(() => {
        expect(getAllUsersPaginated).toHaveBeenCalledWith(1, "");
      });
    });

    it("returns from user management to the main page", async () => {
      renderPage();

      fireEvent.click(
        await screen.findByRole("button", {
          name: /Управување со корисници/i,
        }),
      );

      expect(
        screen.getByRole("heading", {
          name: "Управување со корисници",
        }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Назад" }));

      expect(
        screen.getByRole("heading", {
          name: "Преглед и проверка",
        }),
      ).toBeInTheDocument();
    });
  });

  it("sets the document title", async () => {
    renderPage();

    expect(document.title).toBe("Преглед на податоци");
  });
});
