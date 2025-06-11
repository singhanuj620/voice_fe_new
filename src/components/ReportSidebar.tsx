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
    <aside className="w-[25vw] min-w-60 max-w-xl h-[calc(100vh-64px)] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-800 border-r border-neutral-800 shadow-lg p-6 flex flex-col pt-0" style={{ overflow: "hidden", top: 64, position: "fixed", left: 0 }}>
      <h2 className="text-base font-semibold mb-6 text-neutral-100 tracking-wide flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-600 rounded-full mr-2"></span>
        My Reports
      </h2>
      <div className="flex-1 pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900" style={{ overflowX: "hidden" }}>
        {loading ? (
          <div className="text-neutral-400 text-center py-8 animate-pulse">
            Loading...
          </div>
        ) : reports && reports.length === 0 ? (
          <div className="text-neutral-500 text-center py-8">
            No reports found.
          </div>
        ) : (
          <ul className="space-y-2 pb-2">
            {reports &&
              reports.map((reportId: string, index: number) => (
                <li
                  key={index}
                  className={`flex items-center group rounded-lg transition-colors px-2 py-1 ${
                    selectedReportId === reportId
                      ? "bg-blue-900 border border-blue-700 shadow-inner z-10 relative"
                      : "hover:bg-neutral-800/80 border border-transparent"
                  }`}
                  style={{
                    zIndex: selectedReportId === reportId ? 10 : undefined,
                  }}
                >
                  <button
                    className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors cursor-pointer break-words whitespace-normal overflow-hidden text-ellipsis font-medium text-sm tracking-tight focus:outline-none focus:ring-0 focus:border-0 ${
                      selectedReportId === reportId
                        ? "text-blue-200 font-bold shadow"
                        : "text-neutral-200 hover:bg-neutral-800/60"
                    }`}
                    style={{
                      minWidth: 0,
                      maxWidth: 200,
                      width: 200,
                      display: "inline-block",
                      border: "none",
                      boxShadow: "none",
                    }}
                    onClick={() => handleReportClick(reportId)}
                  >
                    {reportId}
                  </button>
                  <button
                    className={`ml-3 p-2 rounded-lg transition-colors flex items-center justify-center border border-blue-800 bg-blue-800/80 hover:bg-blue-700/90 shadow ${
                      selectedReportId === reportId
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-100"
                    }`}
                    style={{
                      width: 32,
                      height: 32,
                    }}
                    title="Download report"
                    onClick={() => handleDownload(reportId)}
                  >
                    <FiDownload size={16} color="#dbeafe" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
