import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import EditProfilePage from "../pages/EditProfilePage";

const mockGetUser = vi.fn();
const mockGetUserDetails = vi.fn();
const mockEditUser = vi.fn();
const mockEditAvatarPicture = vi.fn();
const mockRemoveAvatarPicture = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("../utils/auth", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("../api/userApi", () => ({
  editAvatarPicture: (...args) => mockEditAvatarPicture(...args),
  editUser: (...args) => mockEditUser(...args),
  getUserDetails: (...args) => mockGetUserDetails(...args),
  removeAvatarPicture: (...args) => mockRemoveAvatarPicture(...args),
}));

vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
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

vi.mock("../components/Button", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../components/input", () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock("../components/label", () => ({
  Label: ({ children, ...props }) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("../components/textarea", () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock("../components/switch", () => ({
  Switch: ({ checked, onCheckedChange, ...props }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    />
  ),
}));

vi.mock("../components/tabs", () => {
  const Tabs = ({ children }) => {
    return <div>{children}</div>;
  };

  const TabsList = ({ children, ...props }) => (
    <div {...props}>{children}</div>
  );

  const TabsTrigger = ({ value, children, ...props }) => (
    <button type="button" data-value={value} {...props}>
      {children}
    </button>
  );

  const TabsContent = ({ value, children, ...props }) => (
    <div data-tab={value} {...props}>
      {children}
    </div>
  );

  return {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}));

const defaultUser = {
  firstName: "Екатерина",
  lastName: "Петрова",
  avatarUrl: null,
};

const defaultUserDetails = {
  firstName: "Екатерина",
  lastName: "Петрова",
  biography: "Оригинална биографија",
  location: "Скопје, Македонија",
  phoneNumber: "+38970123456",
};

const renderPage = () => {
  return render(
    <MemoryRouter>
      <EditProfilePage />
    </MemoryRouter>
  );
};

describe("EditProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockReturnValue({ ...defaultUser });

    mockGetUserDetails.mockResolvedValue({
      ...defaultUserDetails,
    });

    mockEditUser.mockResolvedValue({
      ...defaultUserDetails,
      firstName: "НовоИме",
      lastName: "НовоПрезиме",
      biography: "Нова биографија",
      location: "Нова локација",
      phoneNumber: "+38970999999",
    });

    mockEditAvatarPicture.mockResolvedValue({});
    mockRemoveAvatarPicture.mockResolvedValue({});
  });

  describe("initial rendering", () => {
    it("renders the page after loading", async () => {
      renderPage();

      expect(screen.queryByText("Уреди профил")).not.toBeInTheDocument();

      expect(
        await screen.findByRole("heading", {
          name: "Уреди профил",
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText("Ажурирај ги информациите за твојот профил")
      ).toBeInTheDocument();

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();

      expect(document.title).toBe("Уреди профил");
    });

    it("loads user details into the form", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      expect(screen.getByLabelText("Име")).toHaveValue("Екатерина");
      expect(screen.getByLabelText("Презиме")).toHaveValue("Петрова");
      expect(screen.getByLabelText("Телефон")).toHaveValue(
        "+38970123456"
      );
      expect(screen.getByLabelText("Локација")).toHaveValue(
        "Скопје, Македонија"
      );
      expect(screen.getByLabelText("Биографија")).toHaveValue(
        "Оригинална биографија"
      );

      expect(mockGetUserDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe("personal information", () => {
    it("renders all personal information fields", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      expect(screen.getByLabelText("Име")).toBeInTheDocument();
      expect(screen.getByLabelText("Презиме")).toBeInTheDocument();
      expect(screen.getByLabelText("Телефон")).toBeInTheDocument();
      expect(screen.getByLabelText("Локација")).toBeInTheDocument();
      expect(screen.getByLabelText("Биографија")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Зачувај промени" })
      ).toBeInTheDocument();
    });

    it("allows changing personal information", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const firstNameInput = screen.getByLabelText("Име");
      const lastNameInput = screen.getByLabelText("Презиме");
      const phoneInput = screen.getByLabelText("Телефон");
      const locationInput = screen.getByLabelText("Локација");
      const bioInput = screen.getByLabelText("Биографија");

      fireEvent.change(firstNameInput, {
        target: { value: "Ана" },
      });

      fireEvent.change(lastNameInput, {
        target: { value: "Ановска" },
      });

      fireEvent.change(phoneInput, {
        target: { value: "+38970111222" },
      });

      fireEvent.change(locationInput, {
        target: { value: "Охрид, Македонија" },
      });

      fireEvent.change(bioInput, {
        target: { value: "Нова биографија" },
      });

      expect(firstNameInput).toHaveValue("Ана");
      expect(lastNameInput).toHaveValue("Ановска");
      expect(phoneInput).toHaveValue("+38970111222");
      expect(locationInput).toHaveValue("Охрид, Македонија");
      expect(bioInput).toHaveValue("Нова биографија");
    });

    it("saves personal information successfully", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      fireEvent.change(screen.getByLabelText("Име"), {
        target: { value: "Ана" },
      });

      fireEvent.change(screen.getByLabelText("Презиме"), {
        target: { value: "Ановска" },
      });

      fireEvent.change(screen.getByLabelText("Телефон"), {
        target: { value: "+38970111222" },
      });

      fireEvent.change(screen.getByLabelText("Локација"), {
        target: { value: "Охрид, Македонија" },
      });

      fireEvent.change(screen.getByLabelText("Биографија"), {
        target: { value: "Нова биографија" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "Зачувај промени",
        })
      );

      await waitFor(() => {
        expect(mockEditUser).toHaveBeenCalledWith({
          firstName: "Ана",
          lastName: "Ановска",
          phoneNumber: "+38970111222",
          location: "Охрид, Македонија",
          biography: "Нова биографија",
        });
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Профилот е ажуриран"
      );
    });

    it("shows an error when saving personal information fails", async () => {
      mockEditUser.mockRejectedValueOnce(new Error("Save failed"));

      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "Зачувај промени",
        })
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Не успеавме да ги зачуваме промените!"
        );
      });
    });
  });

  describe("profile picture", () => {
    it("renders profile picture controls", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      // There are two "Профилна слика" texts:
      // the tab and the section heading.
      expect(
        screen.getByRole("heading", {
          name: "Профилна слика",
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Прикачи нова слика",
        })
      ).toBeInTheDocument();

      expect(screen.getByTestId("avatar")).toBeInTheDocument();

      expect(
        screen.getByTestId("avatar-fallback")
      ).toBeInTheDocument();
    });

    it("renders the remove picture button when an avatar exists", async () => {
      mockGetUser.mockReturnValue({
        ...defaultUser,
        avatarUrl: "https://example.com/avatar.jpg",
      });

      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      expect(
        screen.getByRole("button", {
          name: "Отстрани слика",
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("img", {
          name: "ЕП",
        })
      ).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg"
      );
    });

    it("does not render remove picture button without an avatar", async () => {
      mockGetUser.mockReturnValue({
        ...defaultUser,
        avatarUrl: null,
      });

      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      expect(
        screen.queryByRole("button", {
          name: "Отстрани слика",
        })
      ).not.toBeInTheDocument();
    });

    it("opens the file picker when upload button is clicked", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      );

      const clickSpy = vi.spyOn(fileInput, "click");

      fireEvent.click(
        screen.getByRole("button", {
          name: "Прикачи нова слика",
        })
      );

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("rejects an image larger than 2MB", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      );

      const largeFile = new File(
        ["x"],
        "large-image.jpg",
        {
          type: "image/jpeg",
        }
      );

      Object.defineProperty(largeFile, "size", {
        value: 3 * 1024 * 1024,
      });

      fireEvent.change(fileInput, {
        target: {
          files: [largeFile],
        },
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Максимум 2MB слика!"
        );
      });

      expect(
        mockEditAvatarPicture
      ).not.toHaveBeenCalled();
    });

    it("uploads a valid image successfully", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      );

      const file = new File(
        ["image-data"],
        "avatar.jpg",
        {
          type: "image/jpeg",
        }
      );

      fireEvent.change(fileInput, {
        target: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockEditAvatarPicture).toHaveBeenCalledWith(
          file
        );
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Профилот е ажуриран"
      );
    });

    it("shows an error when avatar upload fails", async () => {
      mockEditAvatarPicture.mockRejectedValueOnce(
        new Error("Upload failed")
      );

      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      );

      const file = new File(
        ["image-data"],
        "avatar.jpg",
        {
          type: "image/jpeg",
        }
      );

      fireEvent.change(fileInput, {
        target: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Не успеавме да ја ажурираме сликата!"
        );
      });
    });

    it("removes the avatar successfully", async () => {
      mockGetUser.mockReturnValue({
        ...defaultUser,
        avatarUrl: "https://example.com/avatar.jpg",
      });

      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "Отстрани слика",
        })
      );

      await waitFor(() => {
        expect(
          mockRemoveAvatarPicture
        ).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("preferences", () => {
    it("renders email notification settings", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      expect(
        screen.getByText("Известувања по е-пошта")
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Добивај ажурирања за твоите придонеси"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole("switch")
      ).toHaveAttribute("aria-checked", "false");
    });

    it("toggles email notifications", async () => {
      renderPage();

      await screen.findByRole("heading", {
        name: "Уреди профил",
      });

      const switchElement = screen.getByRole("switch");

      expect(switchElement).toHaveAttribute(
        "aria-checked",
        "false"
      );

      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(switchElement).toHaveAttribute(
          "aria-checked",
          "true"
        );
      });

      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(switchElement).toHaveAttribute(
          "aria-checked",
          "false"
        );
      });
    });
  });

  describe("error handling", () => {
    it("shows an error when user details cannot be loaded", async () => {
      mockGetUserDetails.mockRejectedValueOnce(
        new Error("Failed to load user")
      );

      renderPage();

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Не успеавме да го вчитаме корисникот!"
        );
      });
    });
  });
});
