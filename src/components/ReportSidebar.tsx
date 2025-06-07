/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiDownload } from "react-icons/fi";

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_BASE_URL;

// Add prop type for onReportChange
interface ReportSidebarProps {
  onReportChange?: (reportId: string) => void;
}

export default function ReportSidebar({ onReportChange }: ReportSidebarProps) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndReports = async () => {
      try {
        const res = await fetch("/api/session");
        const session = await res.json();
        const uid = session?.user?.id;
        setUserId(uid);
        if (uid) {
          const reportsRes = await fetch(
            `${BE_BASE_URL}/get-user-reports?userId=${uid}`
          );
          const data = await reportsRes.json();
          setReports(data.report_ids || []);
          // Only set the first report as selected if none is currently selected
          if (
            data.report_ids &&
            data.report_ids.length > 0 &&
            !selectedReportId
          ) {
            setSelectedReportId(data.report_ids[0]);
            if (onReportChange) onReportChange(data.report_ids[0]);
          }
        }
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReportChange]);

  const handleReportClick = (id: string) => {
    setSelectedReportId(id);
    router.push(`/user/chat?report_id=${id}`);
    if (onReportChange) onReportChange(id);
  };

  const handleDownload = (id: string) => {
    window.open(`${BE_BASE_URL}/download-report?report_id=${id}`, "_blank");
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">My Reports</h2>
      {loading ? (
        <div>Loading...</div>
      ) : reports && reports.length === 0 ? (
        <div className="text-neutral-500">No reports found.</div>
      ) : (
        <ul className="space-y-2">
          {reports &&
            reports.map((report, index) => (
              <li
                key={index}
                className="flex items-center justify-between group cursor-pointer text-sm px-2 py-1"
              >
                <button
                  className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors cursor-pointer break-words whitespace-normal overflow-hidden text-ellipsis ${
                    selectedReportId === report
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                  style={{
                    minWidth: "0",
                    maxWidth: "160px",
                    width: "160px",
                    display: "inline-block",
                  }}
                  onClick={() => handleReportClick(report)}
                >
                  {report}
                </button>
                {selectedReportId === report && (
                  <button
                    className={
                      "ml-2 text-xs rounded transition-colors flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-white font-bold"
                    }
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Download report"
                    onClick={() => handleDownload(report)}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <FiDownload size={20} color="#fff" />
                    </span>
                  </button>
                )}
              </li>
            ))}
        </ul>
      )}
    </aside>
  );
}
