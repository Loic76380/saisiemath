import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SnipPage from "./pages/SnipPage";
import DocumentsPage from "./pages/DocumentsPage";
import EditorPage from "./pages/EditorPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import { LanguageProvider } from "./i18n/LanguageContext";

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<SnipPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;