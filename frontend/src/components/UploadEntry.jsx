import {
  FileText,
  Image,
  Mic,
  Video,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const FILE_ICONS = {
  text: FileText,
  image: Image,
  audio: Mic,
  video: Video,
};

const STATUS_CONFIG = {
  uploading: {
    icon: Clock,
    label: "Се прикачува...",
    className: "text-amber-500",
    bgClassName: "bg-amber-50 dark:bg-amber-950/30",
  },
  done: {
    icon: CheckCircle,
    label: "Прикачено",
    className: "text-emerald-500",
    bgClassName: "bg-emerald-100",
  },
  error: {
    icon: AlertCircle,
    label: "Грешка",
    className: "text-destructive",
    bgClassName: "bg-destructive/10",
  },
};

function getFileCategory(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "text";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadEntry({ entries, onRemove }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">Прикачени датотеки</h2>
      <div className="space-y-3">
        {entries.map((entry) => {
          const category = getFileCategory(entry.file);
          const Icon = FILE_ICONS[category];
          const status = STATUS_CONFIG[entry.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={entry.id}
              className={`flex items-start gap-4 p-4 rounded-xl border border-border transition-all ${status.bgClassName}`}
            >
              <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-background border-border shrink-0">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBytes(entry.file.size)}
                      {entry.dialect && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                          {entry.dialect}
                        </span>
                      )}
                      {entry.topic && (
                        <span className="ml-1 text-muted-foreground">
                          · {entry.topic}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemove(entry.id)}
                    className="p-1 transition-colors rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    aria-label="Отстрани"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${status.className}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{status.label}</span>
                  {entry.status === "error" && entry.errorMessage && (
                    <span className="font-normal">: {entry.errorMessage}</span>
                  )}
                </div>

                {entry.status === "uploading" && (
                  <div className="h-1 mt-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full transition-all duration-300 rounded-full bg-amber-400"
                      style={{ width: `${entry.progress ?? 0}%` }}
                    />
                  </div>
                )}

                {entry.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
