import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Sidebar from "../components/Sidebar";
import { Inbox } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Star,
  Upload,
  CheckSquare,
  Award,
  FileText,
  Mic,
  Video,
  Image,
} from "lucide-react";
import { getUser } from "../utils/auth.js";
import { getMonthInMacedonian } from "../utils/dateFormatter.js";
import { getUserUploads } from "../api/userApi.js";
import { useEffect, useState } from "react";

const typeIcons = {
  TEXT: FileText,
  AUDIO: Mic,
  VIDEO: Video,
  IMAGE: Image,
};

export default function ProfilePage() {
  const user = getUser();
  const badges = [
    { key: "firstUpload", icon: Upload, earned: true },
    { key: "reviewer", icon: CheckSquare, earned: true },
    { key: "hundredPoints", icon: Star, earned: true },
    { key: "topContributor", icon: Award, earned: false },
  ];
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    document.title = "Профил";
  }, []);

  useEffect(() => {
    getUserUploads()
      .then((data) => {
        const mapped = data.map((upload) => ({
          type: upload.type[0] + upload.type.slice(1).toLowerCase(),
          title:
            upload.topic?.trim() || upload.description?.trim() || "Без наслов",
          date: new Date(upload.createdAt).toLocaleDateString("mk-MK", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status: upload.status.toLowerCase(),
          icon: typeIcons[upload.type] || FileText,
        }));

        setContributions(mapped);
      })
      .catch(() =>
        toast.error("Не успеавме да ја вчитаме историјата на придонеси!"),
      );
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeButtonIndex={4} />
      <main className="flex-1 pb-20 overflow-auto lg:pb-0 pt-14 lg:pt-0">
        <div className="max-w-6xl p-6 mx-auto md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold md:text-3xl">Профил</h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="p-6 text-center border bg-card border-border rounded-2xl card-elevated">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
                  <Avatar className="w-24 h-24">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt="avatar" />
                    ) : null}
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {<User className="w-10 h-10" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Придонесувач
                </p>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Се придружи во {getMonthInMacedonian(user.createdAt)}{" "}
                      {user.createdAt.getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Star className="w-4 h-4 text-warning" />
                    <span>2,450 поени · Ранг #42</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-6"
                  to="/profile/edit"
                >
                  Уреди профил
                </Button>
              </div>

              <div className="p-6 mt-6 border bg-card border-border rounded-2xl card-elevated">
                <h3 className="mb-4 font-semibold">Значки и достигнувања</h3>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.key}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${badge.earned ? "bg-primary/5" : "bg-muted opacity-50"}`}
                    >
                      <badge.icon
                        className={`h-5 w-5 ${badge.earned ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="text-xs font-medium">{badge.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="p-6 border bg-card border-border rounded-2xl card-elevated max-h-[39.5rem] flex flex-col">
                <h3 className="mb-4 font-semibold">Историја на придонеси</h3>
                <div className="pr-2 space-y-3 overflow-y-auto">
                  {contributions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-3 mb-3 rounded-full bg-muted">
                        <Inbox className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Нема придонеси сè уште
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Кога ќе започнеш да прикачуваш податоци, тука ќе се
                        појави историјата на твоите придонеси.
                      </p>
                    </div>
                  ) : (
                    contributions.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 transition-colors rounded-lg hover:bg-muted/50"
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <c.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {c.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.type} · {c.date}
                          </p>
                        </div>
                        <Badge
                          variant={
                            c.status === "approved"
                              ? "default"
                              : c.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
