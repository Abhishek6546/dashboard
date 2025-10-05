import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [likelihoodChartData, setLikelihoodChartData] = useState([]);
  const [relevanceChartData, setRelevanceChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    end_year: "",
    topic: "",
    sector: "",
    region: "",
    pest: "",
    source: "",
    swot: "",
    country: "",
    city: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${https://dashboard-hntf.onrender.com}/api/data`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        const fieldValue = item[key];
        const normalized = fieldValue && fieldValue !== "N/A" ? fieldValue : "Unknown";
        return value === "" || normalized === value;
      })
    );
    setFilteredData(filtered);

    const groupedIntensity = filtered.reduce((acc, curr) => {
      const region = curr.region && curr.region !== "N/A" ? curr.region : "Unknown";
      acc[region] = (acc[region] || 0) + (curr.intensity || 0);
      return acc;
    }, {});
    setChartData(Object.entries(groupedIntensity).map(([region, intensity]) => ({ region, intensity })));

    const groupedLikelihood = filtered.reduce((acc, curr) => {
      const country = curr.country && curr.country !== "N/A" ? curr.country : "Unknown";
      acc[country] = (acc[country] || 0) + (curr.likelihood || 0);
      return acc;
    }, {});
    setLikelihoodChartData(Object.entries(groupedLikelihood).map(([country, likelihood]) => ({ country, likelihood })));

    const groupedRelevance = filtered.reduce((acc, curr) => {
      const topic = curr.topic && curr.topic !== "N/A" ? curr.topic : "Unknown";
      acc[topic] = (acc[topic] || 0) + (curr.relevance || 0);
      return acc;
    }, {});
    setRelevanceChartData(Object.entries(groupedRelevance).map(([topic, relevance]) => ({ topic, relevance })));
  }, [filters, data]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        📊 Data Visualization Dashboard
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Object.keys(filters).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize text-gray-700 mb-1">
              {field.replace("_", " ")}
            </label>
            <select
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {[...new Set(data.map((d) => d[field] && d[field] !== "N/A" ? d[field] : "Unknown"))]
                .sort()
                .map((val, i) => (
                  <option key={i} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      {[{
        title: "Intensity by Region (Filtered)",
        data: chartData,
        dataKey: "region",
        barKey: "intensity",
        color: "#6366f1"
      }, {
        title: "Likelihood by Country (Filtered)",
        data: likelihoodChartData,
        dataKey: "country",
        barKey: "likelihood",
        color: "#34d399"
      }, {
        title: "Relevance by Topic (Filtered)",
        data: relevanceChartData,
        dataKey: "topic",
        barKey: "relevance",
        color: "#f59e0b"
      }].map((chart, idx) => (
        <div key={idx} className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{chart.title}</h2>
          {chart.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.dataKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={chart.barKey} fill={chart.color} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">📫 No data found for selected filters.</p>
          )}
        </div>
      ))}

      {/* Data List */}
      {loading ? (
        <p className="text-gray-700">Loading...</p>
      ) : (
        <div className="max-h-[400px] overflow-y-scroll border border-gray-300 rounded-md bg-white shadow p-4 space-y-4">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded hover:bg-blue-50 transition duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
              <p className="text-sm text-gray-600 mt-2">
                {["topic", "sector", "region", "country", "city", "end_year", "source", "pest", "swot", "intensity", "likelihood", "relevance"]
                  .map((key) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${item[key] || "N/A"}`)
                  .join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;