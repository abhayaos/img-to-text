import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) return alert("Upload image first");

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      const res = await axios.post(
        "https://ocr-image-backend.onrender.com/ocr",
        formData
      );
      setText(res.data.text);
    } catch (err) {
      console.error(err);
      alert("OCR failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("https://ocr-image-backend.onrender.com/health")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Health route not found");
        }
        return res.text();
      })
      .then((data) => {
        setMessage(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setMessage("");
        setError("❌ Cannot connect to backend /health route");
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Image → Text OCR 🔍
        </h1>

        {/* Health Message */}
        <div className="text-center mb-2 text-green-400 font-semibold">
          {message}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        {/* Upload */}
        <div className="border-2 border-dashed border-gray-600 p-6 rounded-xl text-center cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            className="hidden"
            id="fileInput"
            onChange={(e) => handleImage(e.target.files[0])}
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="mx-auto max-h-60 rounded-lg"
              />
            ) : (
              <p className="text-gray-400">Click to upload image 📸</p>
            )}
          </label>
        </div>

        {/* Button */}
        <button
          onClick={handleUpload}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl font-semibold"
        >
          {loading ? "Processing..." : "Extract Text"}
        </button>

        {/* Output */}
        <textarea
          className="w-full mt-4 p-3 rounded-xl bg-gray-700 text-white resize-none"
          rows="8"
          value={text}
          placeholder="Extracted text will appear here..."
          readOnly
        />
      </div>
    </div>
  );
}