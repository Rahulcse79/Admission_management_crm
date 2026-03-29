export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SeatAllocated: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Admitted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}

export function getQuotaColor(quota: string) {
  const colors: Record<string, string> = {
    KCET: "#3b82f6",
    COMEDK: "#10b981",
    Management: "#f59e0b",
  };
  return colors[quota] || "#6b7280";
}
