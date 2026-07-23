import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#111827", minHeight: "100vh" }}>
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>

      </Box>
    </Box>
  );
}
