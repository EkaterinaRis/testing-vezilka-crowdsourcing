import { useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  getPendingDocuments,
  getRejectedDocuments,
  getApprovedDocuments,
  getAllUsersPaginated,
  blockUser,
  unblockUser,
  updateUserRole,
} from "../api/userApi";
import { XCircle } from "lucide-react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Mic,
  Video,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Users,
  ShieldCheck,
  Ban,
  UnlockKeyhole,
  ChevronDown,
  Search,
} from "lucide-react";
import { formatRelativeTime } from "../utils/formatTime.js";
import { userIsAdmin } from "../utils/auth.js";

const ROLES = ["USER", "ADMIN", "REVIEWER"];

function SectionCard({ title, Icon, count, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-200 border bg-card border-border rounded-2xl card-elevated hover:scale-[1.01] hover:bg-muted/30"
    >
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`p-2.5 sm:p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {count} документи
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

function DocumentGroup({ title, Icon, documents }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 border sm:p-6 bg-card border-border rounded-2xl card-elevated">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      </div>

      <div className="pr-1 space-y-3 overflow-y-auto max-h-72">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Inbox className="w-5 h-5 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Нема документи</p>
          </div>
        ) : (
          documents.map((doc, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-3 transition-colors sm:p-4 rounded-xl bg-muted/40 hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h4 className="font-medium truncate">{doc.topic}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatRelativeTime(doc.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={
                    doc.status === "approved"
                      ? "default"
                      : doc.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {doc.status === "PENDING"
                    ? "Непрегледано"
                    : doc.status === "APPROVED"
                      ? "Прифатено"
                      : "Одбиено"}
                </Badge>

                <button
                  onClick={() =>
                    navigate("/admin/review", {
                      state: {
                        document: {
                          id: doc.id,
                          title: doc.originalFileName || doc.topic,
                          type: doc.type,
                          fileUrl: doc.fileUrl,
                          status: doc.status,
                          description: doc.description,
                          uploadedBy: doc.uploader.email,
                          createdAt: formatRelativeTime(doc.createdAt),
                        },
                      },
                    })
                  }
                  className="px-3 py-1 text-sm border rounded-lg bg-card hover:bg-muted whitespace-nowrap"
                >
                  Прегледај
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RoleDropdown({ currentRole, userId, onRoleChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAdmin = currentRole === "ADMIN";

  const handleSelect = async (role) => {
    if (role === currentRole) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    try {
      await onRoleChange(userId, role);
    } finally {
      setLoading(false);
    }
  };

  const roleStyles = {
    ADMIN: "bg-primary/10 text-primary",
    REVIEWER: "bg-warning/10 text-warning",
    USER: "bg-muted text-muted-foreground",
  };

  return (
    <div className="relative">
      <button
        onClick={() => !isAdmin && setOpen((v) => !v)}
        disabled={loading || disabled || isAdmin}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium border border-border transition-colors ${
          isAdmin ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/60"
        } ${roleStyles[currentRole] ?? "bg-muted text-muted-foreground"}`}
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-current rounded-full border-t-transparent animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{currentRole}</span>
            {!isAdmin && <ChevronDown className="w-3 h-3 opacity-60" />}
          </>
        )}
      </button>

      {open && !isAdmin && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 overflow-hidden border rounded-xl bg-card border-border shadow-lg min-w-[120px]">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted/60 transition-colors ${role === currentRole ? "font-semibold text-primary" : ""}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 opacity-60" />
                {role}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const PAGE_SIZE = 12;

function UserManagementSection({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers(page, debouncedSearch);
  }, [page, debouncedSearch]);

  const fetchUsers = async (pageNum, searchTerm) => {
    setLoading(true);
    try {
      const result = await getAllUsersPaginated(pageNum, searchTerm);
      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (user) => {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      const updated = user.blocked
        ? await unblockUser(user.email)
        : await blockUser(user.email);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, blocked: updated.blocked } : u,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const updated = await updateUserRole(user.email, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Управување со корисници
          </h2>
          <p className="text-sm text-muted-foreground">
            Блокирање, одблокирање и менување на улоги
          </p>
        </div>
        <button
          onClick={onBack}
          className="self-start px-4 py-2 text-sm transition-colors border sm:self-auto rounded-xl border-border bg-card hover:bg-muted"
        >
          Назад
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Пребарај по е-пошта или ime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2 pl-10 pr-4 text-sm border rounded-xl bg-card border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="p-4 border sm:p-6 bg-card border-border rounded-2xl card-elevated">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold sm:text-lg">
              Корисници ({totalElements})
            </h2>
          </div>
          {!loading && totalElements > 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {rangeStart}–{rangeEnd} од {totalElements}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-6 h-6 border-2 rounded-full border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">
              Се вчитуваат корисници...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Inbox className="w-5 h-5 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Нема пронајдени корисници
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors gap-2 ${
                    user.blocked
                      ? "bg-destructive/5 border border-destructive/20"
                      : "bg-muted/40 hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center min-w-0 gap-2.5 sm:gap-3">
                    <div className="flex items-center justify-center w-8 h-8 overflow-hidden text-sm font-semibold rounded-full sm:w-9 sm:h-9 bg-primary/10 text-primary shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        (
                          user.firstName?.[0] ??
                          user.email?.[0] ??
                          "?"
                        ).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "—"}
                      </h4>
                      <p className="text-xs truncate text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {user.blocked && (
                      <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                        <Ban className="w-3 h-3" />
                        Блокиран
                      </span>
                    )}

                    <RoleDropdown
                      currentRole={user.role}
                      userId={user.id}
                      onRoleChange={handleRoleChange}
                      disabled={!!actionLoading[user.id]}
                    />

                    <button
                      onClick={() => handleBlockToggle(user)}
                      disabled={!!actionLoading[user.id]}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.blocked
                          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
                    >
                      {actionLoading[user.id] ? (
                        <span className="w-3.5 h-3.5 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      ) : user.blocked ? (
                        <>
                          <UnlockKeyhole className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">Одблокирај</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">Блокирај</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm border rounded-lg border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Претходна</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(
                      (p) =>
                        totalPages <= 5 ||
                        Math.abs(p - page) <= 1 ||
                        p === 0 ||
                        p === totalPages - 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`e-${idx}`}
                          className="px-1 text-xs text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-lg transition-colors ${
                            p === page
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p + 1}
                        </button>
                      ),
                    )}
                </div>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page === totalPages - 1}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm border rounded-lg border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Следна</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function AdminPage() {
  useEffect(() => {
    document.title = "Преглед на податоци";
  }, []);

  const [activeSection, setActiveSection] = useState(null);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    loadData();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const result = await userIsAdmin();
    setShowUserManagement(result);
  };

  const loadData = async () => {
    try {
      const pen = await getPendingDocuments();
      const appr = await getApprovedDocuments();
      const rej = await getRejectedDocuments();
      setPending(pen);
      setApproved(appr);
      setRejected(rej);
    } catch (err) {
      console.error(err);
    }
  };

  const byType = (arr) => ({
    text: arr.filter((d) => d.type === "TEXT"),
    audio: arr.filter((d) => d.type === "AUDIO"),
    video: arr.filter((d) => d.type === "VIDEO"),
    image: arr.filter((d) => d.type === "IMAGE"),
  });

  const approvedDocuments = byType(approved);
  const rejectedDocuments = byType(rejected);
  const pendingDocuments = byType(pending);

  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b.length, 0);
  const totalPending = sum(pendingDocuments);
  const totalChecked = sum(approvedDocuments) + sum(rejectedDocuments);

  const activeTitle =
    activeSection === "pending"
      ? "Документи за проверка"
      : activeSection === "approved"
        ? "Одобрени документи"
        : "Одбиени документи";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeButtonIndex={2} />

      <main className="flex-1 pb-20 overflow-auto pt-14 lg:pt-0 lg:pb-0">
        <div className="max-w-6xl px-4 py-6 mx-auto sm:px-6 md:px-8 md:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
              Преглед и проверка
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Управување со документи
            </p>
          </div>

          {!activeSection && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4 sm:mb-8 lg:grid-cols-2">
                <StatCard
                  title="Проверени"
                  statValue={totalChecked}
                  Icon={CheckCircle2}
                  bgClass="bg-primary/10"
                  textClass="text-primary"
                  i={0}
                />
                <StatCard
                  title="Чекаат проверка"
                  statValue={totalPending}
                  Icon={Clock3}
                  bgClass="bg-warning/10"
                  textClass="text-warning"
                  i={1}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6 sm:gap-6 sm:mb-8 md:grid-cols-2">
                <SectionCard
                  title="Документи за проверка"
                  Icon={Clock3}
                  count={totalPending}
                  color="bg-warning/10 text-warning"
                  onClick={() => setActiveSection("pending")}
                />
                <SectionCard
                  title="Одобрени документи"
                  Icon={CheckCircle2}
                  count={sum(approvedDocuments)}
                  color="bg-primary/10 text-primary"
                  onClick={() => setActiveSection("approved")}
                />
                <SectionCard
                  title="Одбиени документи"
                  Icon={XCircle}
                  count={sum(rejectedDocuments)}
                  color="bg-destructive/10 text-destructive"
                  onClick={() => setActiveSection("rejected")}
                />
                {showUserManagement && (
                  <button
                    onClick={() => setActiveSection("users")}
                    className="w-full text-left transition-all duration-200 border bg-card border-border rounded-2xl card-elevated hover:scale-[1.01] hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 text-green-700 bg-green-100 rounded-xl">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold sm:text-lg">
                            Управување со корисници
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Блокирај, одблокирај, смени улога
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                )}
              </div>
            </>
          )}

          {activeSection && activeSection !== "users" && (
            <>
              <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    {activeTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Документите се организирани по тип
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection(null)}
                  className="self-start px-4 py-2 text-sm transition-colors border sm:self-auto rounded-xl border-border bg-card hover:bg-muted"
                >
                  Назад
                </button>
              </div>

              <div className="grid gap-4 sm:gap-6">
                {[
                  { title: "Текст документи", Icon: FileText, key: "text" },
                  { title: "Аудио документи", Icon: Mic, key: "audio" },
                  { title: "Видео документи", Icon: Video, key: "video" },
                  { title: "Слики", Icon: Video, key: "image" },
                ].map(({ title, Icon, key }) => (
                  <DocumentGroup
                    key={key}
                    title={title}
                    Icon={Icon}
                    documents={
                      activeSection === "pending"
                        ? pendingDocuments[key]
                        : activeSection === "approved"
                          ? approvedDocuments[key]
                          : rejectedDocuments[key]
                    }
                  />
                ))}
              </div>
            </>
          )}

          {activeSection === "users" && (
            <UserManagementSection onBack={() => setActiveSection(null)} />
          )}
        </div>
      </main>
    </div>
  );
}
