import React from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import PageLoader from "../components/ui/PageLoader";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow pt-28 px-4 pb-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet /> {/* Render the child route pages here */}
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;