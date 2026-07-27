import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  CircularProgress,
  Button
} from "@mui/material";

import SidebarPanel from "../components/SidebarPanel";
import { globalSearch } from "../services/searchService";

export default function SearchPage() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ BACKEND SEARCH
  const handleSearch = async (value) => {
    try {
      setLoading(true);

      // ✅ Empty input
      if (!value || value.trim() === "") {
        setResults([]);
        return;
      }

      // ✅ API call
      const res = await globalSearch(value);
      const tasks = Array.isArray(res?.tasks) ? res.tasks : [];
      const projects = Array.isArray(res?.projects) ? res.projects : [];
      setResults([...tasks, ...projects]);

    } catch (err) {
      console.error(err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ debounce input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>

        {/* ✅ Search Input */}
        <TextField
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* ✅ Loading */}
        {loading && (
          <Box mt={2}>
            <CircularProgress />
          </Box>
        )}

        {/* ✅ Results */}
        <List>
          {results.map((item, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  item.title ||
                  item.name ||
                  item.taskNo ||
                  item.projectName ||
                  item.issueActionItem ||
                  "No title"
                }
                secondary={
                  item.description ||
                  item.type ||
                  ""
                }
              />
            </ListItem>
          ))}

          {!loading && results.length === 0 && query && (
            <Typography mt={2}>
              No results found
            </Typography>
        )}
        </List>

        {/* ✅ Error */}
        <Snackbar
          open={!!error}
          message={error}
          autoHideDuration={3000}
          onClose={() => setError("")}
        />

      </Box>

      {/* SIDEBAR */}
      <SidebarPanel title="Search Options">
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Advanced Search
        </Button>
        <Button variant="outlined" fullWidth sx={{ mb: 1.5, color: "#fff", borderColor: "#fff" }}>
          Save Search
        </Button>
        <Button variant="outlined" fullWidth sx={{ color: "#fff", borderColor: "#fff" }}>
          Search History
        </Button>
      </SidebarPanel>
  );
}

