import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css"; 

export default function MonthlyReport() {
  const navigate = useNavigate(); 
  const [selectedMonth, setSelectedMonth] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { user_id: 1 }; // default user id

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const fetchReport = async () => {
    if (!selectedMonth) {
      alert("Please select a month!");
      return;
    }

    const date = new Date(selectedMonth);
    const yearMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${user.user_id}/${yearMonth}`
      );
      if (!response.ok) throw new Error("Failed to fetch report");

      const data = await response.json();
      setReport(data);
    } catch (error) {
      alert(
        "⚠️ Unable to fetch report. Please make sure the backend is running on port 5000."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 📄 Download PDF Function
  // -----------------------------
  const downloadPDF = () => {
    const input = document.getElementById("report-content");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Financial_Report_${selectedMonth}.pdf`);
    });
  };

  return (
    <div className="report-container text-center mt-5">
      {/* ✅ Back Button */}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back
      </button>

      <h2 className="mb-4 text-gradient">📊 Monthly Financial Report</h2>

      <div className="controls mb-3">
        <input
          type="month"
          className="form-control month-input"
          onChange={handleMonthChange}
        />
        <button className="btn btn-primary mx-2" onClick={fetchReport}>
          View Report
        </button>
        {report && (
          <button className="btn btn-success" onClick={downloadPDF}>
            🖨️ Download PDF
          </button>
        )}
      </div>

      {loading && <p className="text-muted">Loading report...</p>}

      {report && (
        <div
          id="report-content"
          className="card report-card mt-4 p-4 shadow-lg"
        >
          <h4 className="text-primary mb-3">Report for {report.month}</h4>

          <div className="report-summary">
            <div className="summary-item income">
              💰 <b>Income:</b> Rs. {report.total_income}
            </div>
            <div className="summary-item expenses">
              🧾 <b>Expenses:</b> Rs. {report.total_expenses}
            </div>
            <div className="summary-item savings">
              🏦 <b>Savings:</b> Rs. {report.total_savings}
            </div>
            <div className="summary-item balance">
              📈 <b>Balance:</b> Rs. {report.balance}
            </div>
          </div>

          <hr />
          <p className="text-muted small">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
