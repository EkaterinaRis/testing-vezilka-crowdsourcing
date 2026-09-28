import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getLatestReview,
  getQualityScore,
  getTranscription,
  reviewDocumentAccept,
  reviewDocumentReject,
} from "../api/userApi";

import {
  ArrowLeft,
  FileText,
  Mic,
  Video,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Star,
  ScrollText,
  Loader2,
} from "lucide-react";
import { normalizeUrls } from "../utils/normalizeUrls";

const typeIcons = {
  TEXT: FileText,
  AUDIO: Mic,
  VIDEO: Video,
};

const renderContent = () => {
  const location = useLocation();
  const document = location.state?.document;

  if (!document) return null;

  const type = (document.type || "").toUpperCase();
  const fileUrl = normalizeUrls(document.fileUrl || "");

  const fileExtension = fileUrl.split(".").pop().toLowerCase();

  switch (type) {
    case "IMAGE":
      return (
        <img
          src={fileUrl}
          alt={document.title}
          className="w-full border rounded-xl"
        />
      );

    case "AUDIO":
      return (
        <audio controls className="w-full">
          <source src={fileUrl} type="audio/mpeg" />
          Your browser does not support audio.
        </audio>
      );

    case "VIDEO":
      return (
        <video controls className="w-full rounded-xl">
          <source src={fileUrl} type="video/mp4" />
          Your browser does not support video.
        </video>
      );

    case "TEXT":
      if (fileExtension === "pdf") {
        return (
          <iframe
            src={fileUrl}
            title={document.title}
            className="w-full h-[600px] rounded-xl border"
          />
        );
      }

      const isLocalhost =
        fileUrl.includes("localhost") || fileUrl.includes("127.0.0.1");
      if (isLocalhost) {
        return (
          <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-muted/20 min-h-[300px] text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Онлајн прегледувачот на Office не може да отвори{" "}
              <strong>localhost</strong> датотеки ({fileExtension.toUpperCase()}
              ).
            </p>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-xl bg-primary hover:opacity-90"
            >
              Преземи ја презентацијата
            </a>
          </div>
        );
      }

      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          title={document.title}
          className="w-full h-[600px] rounded-xl border"
        />
      );

    default:
      return <p className="text-muted-foreground">Unsupported file type</p>;
  }
};

export default function AdminReviewPage() {
  useEffect(() => {
    document.title = "Преглед на податоци";
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const documentObj = location.state?.document;

  const [status, setStatus] = useState(
    documentObj?.status?.toLowerCase() || "pending",
  );
  const [comment, setComment] = useState("");
  const [qualityScore, setQualityScore] = useState(3);
  const [latestReviewer, setLatestReviewer] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(false);

  const isMediaType = ["AUDIO", "VIDEO"].includes(
    (documentObj?.type || "").toUpperCase(),
  );

  useEffect(() => {
    const fetchLatestReviewer = async () => {
      try {
        const result = await getLatestReview(documentObj.id);
        setLatestReviewer(result.reviewerFullName);
        setComment(result.comment);
      } catch (err) {
        setLatestReviewer("");
      }
    };

    const fetchTranscription = async () => {
      setTranscriptionLoading(true);
      setTranscriptionError(false);
      try {
        const result = await getTranscription(documentObj.id);
        setTranscription(result?.text ?? result ?? "");
      } catch (err) {
        console.error(err);
        setTranscriptionError(true);
      } finally {
        setTranscriptionLoading(false);
      }
    };

    const fetchQualityScore = async () => {
      try {
        const result = await getQualityScore(documentObj.id);
        setQualityScore(result);
      } catch (err) {
        setQualityScore(3);
      }
    };

    fetchTranscription();
    fetchLatestReviewer();
    fetchQualityScore();
  }, [documentObj?.id]);

  if (!documentObj) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No document selected
        <div className="mt-4">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 border rounded-xl"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[documentObj?.type] || FileText;

  const handleApprove = async () => {
    try {
      const toSend = {
        id: documentObj.id,
        comment,
        qualityScore,
        transcription,
      };
      await reviewDocumentAccept(toSend);
      setStatus("approved");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      const toSend = {
        id: documentObj.id,
        comment,
        qualityScore,
        ...(isMediaType && { transcription }),
      };
      await reviewDocumentReject(toSend);
      setStatus("rejected");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeButtonIndex={2} />

      <main className="flex-1 pb-20 overflow-auto lg:pb-0 pt-14 lg:pt-0">
        <div className="max-w-5xl p-6 mx-auto md:p-8">
          <div className="mb-8">
            <Button variant="outline" to="/admin" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Преглед на документ
              </h1>

              <p className="text-muted-foreground">
                Администраторска проверка на документ
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="p-6 border bg-card border-border rounded-2xl card-elevated">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold">
                        {documentObj.title}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {documentObj.type}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      status === "approved"
                        ? "default"
                        : status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {status}
                  </Badge>
                </div>

                <div className="grid gap-4 mt-8 md:grid-cols-2">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{documentObj.uploadedBy}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{documentObj.createdAt}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-2 font-semibold">Опис на документот</h3>

                  <div className="p-4 border rounded-xl bg-muted/30 border-border">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {documentObj.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media player card */}
              <div className="p-6 border bg-card border-border rounded-2xl card-elevated">
                <h3 className="mb-4 text-lg font-semibold">
                  Преглед на содржина
                </h3>

                {renderContent()}
              </div>

              {/* Transcription card — only for AUDIO / VIDEO */}
              {isMediaType && (
                <div className="p-6 border bg-card border-border rounded-2xl card-elevated">
                  <div className="flex items-center gap-2 mb-4">
                    <ScrollText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Транскрипција</h3>
                  </div>

                  {transcriptionLoading ? (
                    <div className="flex items-center justify-center gap-2 min-h-[160px] text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Се вчитува транскрипцијата...</span>
                    </div>
                  ) : transcriptionError ? (
                    <div className="flex flex-col items-center justify-center gap-3 min-h-[160px] text-center">
                      <p className="text-sm text-muted-foreground">
                        Транскрипцијата не можеше да се вчита. Можете да ја
                        внесете рачно.
                      </p>
                    </div>
                  ) : null}

                  {/* Always show the editable textarea once loading is done */}
                  {!transcriptionLoading && (
                    <textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="Транскрипцијата ќе се прикаже овде. Можете да ја уредувате..."
                      className="w-full min-h-[200px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary leading-relaxed resize-y"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-6 border bg-card border-border rounded-2xl card-elevated">
                <h3 className="mb-4 text-lg font-semibold">
                  Коментар од администратор
                </h3>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Остави коментар..."
                  className="w-full min-h-[160px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                />

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium">
                    Оценка за квалитет
                  </label>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setQualityScore(score)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`Оценка ${score}`}
                      >
                        <Star
                          className="transition-colors w-7 h-7"
                          fill={score <= qualityScore ? "currentColor" : "none"}
                          strokeWidth={1.5}
                          style={{
                            color:
                              score <= qualityScore
                                ? "var(--color-primary, #f59e0b)"
                                : "var(--color-muted-foreground, #9ca3af)",
                          }}
                        />
                      </button>
                    ))}

                    <span className="ml-2 text-sm font-semibold tabular-nums text-muted-foreground">
                      {qualityScore} / 5
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 mt-6">
                  <button
                    onClick={handleApprove}
                    className="flex items-center justify-center gap-2 px-4 py-3 font-medium text-white transition-colors rounded-xl bg-primary hover:opacity-90"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Прифати документ
                  </button>

                  <button
                    onClick={handleReject}
                    className="flex items-center justify-center gap-2 px-4 py-3 font-medium text-white transition-colors rounded-xl bg-destructive hover:opacity-90"
                  >
                    <XCircle className="w-5 h-5" />
                    Одбиј документ
                  </button>
                </div>
              </div>

              <div className="p-6 border bg-card border-border rounded-2xl card-elevated">
                <h3 className="mb-4 text-lg font-semibold">Информации</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Тип</span>

                    <span>
                      {documentObj.type == "IMAGE"
                        ? "Слика"
                        : documentObj.type == "TEXT"
                          ? "Текст"
                          : documentObj.type == "AUDIO"
                            ? "Аудио"
                            : "Видео"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Статус</span>

                    <span>
                      {status == "pending"
                        ? "Непрегледано"
                        : status == "approved"
                          ? "Прифатено"
                          : "Одбиено"}
                    </span>
                  </div>
                  {latestReviewer && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Прегледано од:
                      </span>

                      <span>{latestReviewer}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Оценка за квалитет
                    </span>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Star
                          key={score}
                          className="w-3.5 h-3.5"
                          fill={score <= qualityScore ? "currentColor" : "none"}
                          strokeWidth={1.5}
                          style={{
                            color:
                              score <= qualityScore
                                ? "var(--color-primary, #f59e0b)"
                                : "var(--color-muted-foreground, #9ca3af)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
