/**
 * StandaloneTestData - Self-contained test data component
 * 
 * Combines TestDataProvider + TestDataDisplay into one easy-to-use component.
 * Works as a standalone element with no external dependencies.
 */

import React from "react";
import { TestDataProvider } from "./TestDataProvider";
import { TestDataDisplay } from "./TestDataDisplay";

/**
 * StandaloneTestData
 * 
 * Props:
 * - source: "entity" | "static" | "callback" | "mock" - Data source
 * - sourceType: string - For entity source (page/feature)
 * - sourceId: string - For entity source
 * - data: object - For static source
 * - fetchData: function - For callback source
 * - schemas: object - For mock source
 * - variant: "table" | "cards" | "minimal" - Display style
 * - showActions: boolean - Show edit actions
 * - showStatus: boolean - Show verification status
 * - className: string - Container classes
 * - onRecordClick: function - Record click callback
 * - onDataChange: function - Data change callback
 */
export function StandaloneTestData({
  // Data props
  source = "entity",
  sourceType = null,
  sourceId = null,
  data = {},
  fetchData = null,
  schemas = {},
  
  // Display props
  variant = "table",
  showActions = false,
  showStatus = true,
  className = "",
  
  // Callbacks
  onRecordClick = null,
  onDataChange = null
}) {
  return (
    <TestDataProvider
      source={source}
      sourceType={sourceType}
      sourceId={sourceId}
      data={data}
      fetchData={fetchData}
      schemas={schemas}
      onDataChange={onDataChange}
    >
      <TestDataDisplay
        variant={variant}
        showActions={showActions}
        showStatus={showStatus}
        className={className}
        onRecordClick={onRecordClick}
      />
    </TestDataProvider>
  );
}

/**
 * Pre-configured test data variants
 */

// For playground items - fetches by source type and ID
export function PlaygroundTestData({ 
  playgroundItem, 
  showActions = false,
  className = "" 
}) {
  if (!playgroundItem) return null;
  
  return (
    <StandaloneTestData
      source="entity"
      sourceType={playgroundItem.source_type}
      sourceId={playgroundItem.source_id}
      variant="table"
      showActions={showActions}
      showStatus={true}
      className={className}
    />
  );
}

// Mock data from schemas - for previews without saved data
export function MockTestData({ 
  schemas, 
  className = "" 
}) {
  return (
    <StandaloneTestData
      source="mock"
      schemas={schemas}
      variant="cards"
      showActions={false}
      showStatus={true}
      className={className}
    />
  );
}

// Static data - for hardcoded test scenarios
export function StaticTestData({ 
  data, 
  className = "" 
}) {
  return (
    <StandaloneTestData
      source="static"
      data={data}
      variant="table"
      showActions={false}
      showStatus={false}
      className={className}
    />
  );
}

// Minimal status display
export function TestDataStatus({ 
  sourceType, 
  sourceId,
  className = "" 
}) {
  return (
    <StandaloneTestData
      source="entity"
      sourceType={sourceType}
      sourceId={sourceId}
      variant="minimal"
      showActions={false}
      showStatus={true}
      className={className}
    />
  );
}

export default StandaloneTestData;