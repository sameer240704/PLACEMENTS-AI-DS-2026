import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "react-modal";

const semesterCredits = [21, 21, 21, 20];
const semesterMarks = [210, 210, 210, 200];

Modal.setAppElement("#root");

const SemesterForm = ({ id, sem, handleChange, handleDelete }) => {
  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">Semester {id}</h3>
        <button
          onClick={() => handleDelete(id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {sem.type === "marks" ? "Credits * Grades (C*G)" : "GPA"}
          </label>
          <input
            type="number"
            value={sem.value}
            onChange={(e) => handleChange(id, "value", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${
              sem.type === "marks" ? "Credits * Grades (C*G)" : "GPA"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Credits
          </label>
          <input
            type="number"
            value={sem.credits}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Total Credits * Grades (C*G)
          </label>
          <input
            type="number"
            value={semesterMarks[id - 1]}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [semesters, setSemesters] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [selectedType, setSelectedType] = useState("marks");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addSemester = () => {
    if (semesters.length < 6) {
      const newSemester = {
        id: semesters.length + 1,
        value: "",
        type: selectedType,
        credits: semesterCredits[semesters.length],
      };
      setSemesters([...semesters, newSemester]);
    }
  };

  const handleChange = (id, field, value) => {
    setSemesters(
      semesters.map((sem) => (sem.id === id ? { ...sem, [field]: value } : sem))
    );
  };

  const handleDelete = (id) => {
    const updatedSemesters = semesters.filter((sem) => sem.id !== id);
    const reindexedSemesters = updatedSemesters.map((sem, index) => ({
      ...sem,
      id: index + 1,
      credits: semesterCredits[index],
    }));
    setSemesters(reindexedSemesters);
  };

  const calculateCGPA = () => {
    if (semesters.length === 0) {
      toast.error("Please add at least one semester before calculating CGPA.");
      return;
    }

    let totalCredits = 0;
    let weightedSum = 0;
    let hasError = false;

    semesters.forEach((sem) => {
      if (!sem.value || isNaN(sem.value)) {
        toast.error(
          `Please enter valid ${
            sem.type === "marks" ? "C*G" : "GPA"
          } for Semester ${sem.id}.`
        );
        hasError = true;
        return;
      }

      const value = parseFloat(sem.value);
      if (
        sem.type === "marks" &&
        (value < 0 || value > semesterMarks[sem.id - 1])
      ) {
        toast.error(
          `Marks for Semester ${sem.id} should be between 0 and ${
            semesterMarks[sem.id - 1]
          }.`
        );
        hasError = true;
        return;
      }

      if (sem.type === "gpa" && (value < 0 || value > 10)) {
        toast.error(`GPA for Semester ${sem.id} should be between 0 and 10.`);
        hasError = true;
        return;
      }

      const gpa =
        sem.type === "marks" ? (value / semesterMarks[sem.id - 1]) * 10 : value;
      totalCredits += parseFloat(sem.credits);
      weightedSum += gpa * sem.credits;
    });

    if (!hasError) {
      const calculatedCGPA = weightedSum / totalCredits;
      setCgpa(calculatedCGPA);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-400 mb-12">
          AI & DS 2026 CGPA Calculator
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Settings
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Calculation Type
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="marks">Credits * Grades (C*G)</option>
                  <option value="gpa">GPA</option>
                </select>
              </div>
              <button
                className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${
                  semesters.length >= 6 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={addSemester}
                disabled={semesters.length >= 6}
              >
                Add Semester
              </button>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {semesters.map((sem) => (
                <SemesterForm
                  key={sem.id}
                  id={sem.id}
                  sem={sem}
                  handleChange={handleChange}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
            {semesters.length > 0 && (
              <div className="mt-8">
                <button
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 active:scale-95 transition-all text-lg font-semibold"
                  onClick={calculateCGPA}
                >
                  Calculate CGPA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-gray-800 rounded-lg p-8 w-11/12 max-w-md mx-auto mt-20 border border-gray-700"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <h2 className="text-3xl font-bold mb-6 text-white">Your CGPA</h2>
        <p className="text-xl text-gray-300 mb-8">
          Your calculated CGPA is:{" "}
          <strong className="text-blue-400 text-2xl">{cgpa.toFixed(2)}</strong>
        </p>
        <button
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold"
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </Modal>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
