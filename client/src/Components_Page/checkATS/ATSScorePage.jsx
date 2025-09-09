import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AtsResult from "./AtsResult";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ATSScorePage = () => {
  const [file, setFile] = useState(null); // for resume
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size should not exceed 5MB");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(selectedFile.type)
      ) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }
      setFile(selectedFile);
      setCurrentStep(2);
    }
  };

  const handleJobRoleChange = (e) => setJobRole(e.target.value);
  const handleJobDescriptionChange = (e) => setJobDescription(e.target.value);

  // Move step change to useEffect
  useEffect(() => {
    if (results) {
      setCurrentStep(4);
    }
  }, [results]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload a resume first.");
    if (!jobRole.trim()) return toast.error("Please enter the job role.");
    if (!jobDescription.trim())
      return toast.error("Please enter the job description.");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", jobRole);
    formData.append("job_desc", jobDescription);
    setIsLoading(true);

    try {
      const response = await axios.post(
        // "https://resumebuilderserver.onrender.com/api/upload/resume",
        "http://localhost:5001/api/upload/resume",
        
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("haaaaa", response); // working fine
      // console.log(response.data.score);
      setResults(response.data);
      console.log("Results before rendering AtsResult after req:", results);
      // setCurrentStep(4);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("There was an error analyzing your resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const goToPreviousStep = () =>
    currentStep > 1 && setCurrentStep(currentStep - 1);

  const steps = [
    { title: "Upload Resume", description: "Upload your PDF or DOCX resume" },
    { title: "Job Details", description: "Enter job role and description" },
    { title: "Review & Submit", description: "Review and submit for analysis" },
  ];
  // console.log("Results before rendering AtsResult:", results);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Progress Bar */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-semibold 
             rounded-lg shadow-md hover:bg-amber-600 hover:shadow-lg 
             transition-all duration-300 text-sm sm:text-base"
        >
          <LayoutDashboard size={18} />
          <span>Go to Dashboard</span>
        </button>

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${index + 1 <= currentStep
                      ? "bg-amber-500 text-gray-900"
                      : "bg-gray-700 text-gray-400"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 text-gray-300">
                    {step.title}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-20 mx-4 transition-all duration-300 ${index + 1 < currentStep ? "bg-amber-500" : "bg-gray-700"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[0].title}
                </h2>
                <p className="text-gray-400 text-sm">{steps[0].description}</p>
              </div>
              <label className="block">
                <span className="sr-only">Choose resume file</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-gray-900 hover:file:bg-amber-600 cursor-pointer"
                />
              </label>
              <button
                onClick={goToNextStep}
                disabled={!file}
                className="w-full py-2 px-4 bg-amber-500 text-gray-900 rounded-lg font-semibold disabled:bg-gray-700 disabled:text-gray-400 hover:bg-amber-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[1].title}
                </h2>
                <p className="text-gray-400 text-sm">{steps[1].description}</p>
              </div>
              <input
                type="text"
                value={jobRole}
                onChange={handleJobRoleChange}
                placeholder="Job Role (e.g., Software Engineer)"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
              <textarea
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste the job description here..."
                rows="6"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex space-x-4">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!jobRole || !jobDescription}
                  className="flex-1 py-2 px-4 bg-amber-500 text-gray-900 rounded-lg font-semibold disabled:bg-gray-700 disabled:text-gray-400 hover:bg-amber-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[2].title}
                </h2>
                <p className="text-gray-400 text-sm">{steps[2].description}</p>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>File:</strong> {file?.name}
                </p>
                <p>
                  <strong>Job Role:</strong> {jobRole}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {jobDescription.substring(0, 100)}...
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-amber-500 text-gray-900 rounded-lg font-semibold disabled:bg-gray-700 disabled:text-gray-400 hover:bg-amber-600 transition-colors"
                >
                  {isLoading ? "Processing..." : "Analyze Resume"}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex justify-center items-center min-h-[400px]">
              {isLoading && <p className="text-white">Processing...</p>}
              {!isLoading && results ? (
                <AtsResult data={results} />
              ) : (
                !isLoading && <p className="text-white">No results yet</p>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="dark"
        className="mt-4"
      />
    </div>
  );

};

export default ATSScorePage;
