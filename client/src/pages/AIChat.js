import { useState } from "react";
import API from "../services/api";

function AIChat() {

  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const handleSearch = async () => {
    try {
      const res = await API.post("/ai/recommend", {
        prompt: query
      });

      setResult(res.data.result);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>

      <h1>AI Movie Assistant 🤖</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask for movie suggestions..."
        style={{
          padding: "10px",
          width: "300px",
          marginRight: "10px"
        }}
      />

      <button onClick={handleSearch}>
        Ask AI
      </button>

      <div style={{ marginTop: "20px" }}>
        <pre>{result}</pre>
      </div>

    </div>
  );
}

export default AIChat;