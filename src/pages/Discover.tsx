
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { DiscoverHeader, DiscoverTabs } from '@/components/discover';
import { FilterBar } from '@/components/filters';
import { useDiscoverFilters } from '@/hooks/discover/useDiscoverFilters';
import { useCountry } from '@/contexts/CountryContext';
import { useIpCountryDetection } from '@/hooks/useIpCountryDetection';
import SponsorsSection from '@/components/SponsorsSection';
import FooterSection from '@/components/FooterSection';
import HeaderSection from '@/components/HeaderSection';
import { useTranslation } from 'react-i18next';

const Discover = () => {
  const { t } = useTranslation();
  const {
    viewMode,
    setViewMode,
    isLoading,
    resultsType,
    setResultsType,
    filters,
    handleFilterChange,
    clearFilters,
    handleSearch,
    filteredCenters,
    compareCourses,
    removeFromComparison,
    clearComparison,
    courseComparisons,
    removeCourseFromComparison,
    clearCourseComparison,
  } = useDiscoverFilters();

  // Initialize the IP-based country detection
  useIpCountryDetection();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <DiscoverHeader
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleSearch={handleSearch}
            totalResults={
              resultsType === "centers" ? filteredCenters.length : 6
            }
            sort={filters.sort}
            onSortChange={(value) => {
              handleFilterChange({ ...filters, sort: value });
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultsType={resultsType}
            onResultsTypeChange={setResultsType}
          />

          <DiscoverTabs
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            handleSearch={handleSearch}
            filteredCenters={filteredCenters}
            isLoading={isLoading}
            viewMode={viewMode}
            setViewMode={setViewMode}
            compareCourses={compareCourses}
            removeFromComparison={removeFromComparison}
            clearComparison={clearComparison}
            courseComparisons={courseComparisons}
            removeCourseFromComparison={removeCourseFromComparison}
            clearCourseComparison={clearCourseComparison}
            resultsType={resultsType}
            setResultsType={setResultsType}
          />
        </div>
      </main>
      <SponsorsSection />
      <FooterSection />
    </div>
  );
};

export default Discover;
