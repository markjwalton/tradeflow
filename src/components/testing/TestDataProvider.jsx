/**
 * TestDataProvider - Standardized test data abstraction
 * 
 * Provides a consistent interface for test data regardless of source.
 * Works standalone - no multi-tenant requirements.
 * 
 * Data Sources:
 * - "entity" - TestData entity (default)
 * - "static" - Static data passed via props
 * - "callback" - Custom fetch function
 * - "mock" - Auto-generate mock data from schema
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Test Data Context
const TestDataContext = createContext(null);

export const useTestData = () => {
  const context = useContext(TestDataContext);
  if (!context) {
    throw new Error("useTestData must be used within TestDataProvider");
  }
  return context;
};

/**
 * TestDataProvider
 * 
 * Props:
 * - source: "entity" | "static" | "callback" | "mock" - Where to get data
 * - sourceType: string - For entity source, filter by source_type (page/feature)
 * - sourceId: string - For entity source, filter by source_id
 * - data: object - For static source, the entity_data object
 * - fetchData: function - For callback source, async function returning data
 * - schemas: object - Entity schemas for mock generation { EntityName: schema }
 * - onDataChange: function - Callback when data changes
 * - children: React node
 */
export function TestDataProvider({
  source = "entity",
  sourceType = null,
  sourceId = null,
  data: staticData = {},
  fetchData = null,
  schemas = {},
  onDataChange = null,
  children
}) {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState({});

  // Fetch from TestData entity
  const { data: entityData = [], isLoading: entityLoading, refetch } = useQuery({
    queryKey: ["testData", sourceType, sourceId],
    queryFn: async () => {
      const filters = {};
      if (sourceType) filters.source_type = sourceType;
      if (sourceId) filters.source_id = sourceId;
      return Object.keys(filters).length > 0
        ? base44.entities.TestData.filter(filters)
        : base44.entities.TestData.list("-created_date");
    },
    enabled: source === "entity",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch from custom callback
  const { data: callbackData = {}, isLoading: callbackLoading } = useQuery({
    queryKey: ["testData", "callback", sourceType, sourceId],
    queryFn: fetchData,
    enabled: source === "callback" && !!fetchData,
    staleTime: 5 * 60 * 1000,
  });

  // Generate mock data from schemas
  const mockData = useMemo(() => {
    if (source !== "mock" || Object.keys(schemas).length === 0) return {};
    
    const generated = {};
    Object.entries(schemas).forEach(([entityName, schema]) => {
      generated[entityName] = generateMockRecords(schema, 3);
    });
    return generated;
  }, [source, schemas]);

  // Normalize data from any source
  const testDataRecord = useMemo(() => {
    switch (source) {
      case "static":
        return { entity_data: staticData, test_status: "pending" };
      case "callback":
        return { entity_data: callbackData || {}, test_status: "pending" };
      case "mock":
        return { entity_data: mockData, test_status: "mock" };
      case "entity":
      default:
        // Find the default test data set
        const defaultSet = entityData.find(td => td.is_default) || entityData[0];
        return defaultSet || { entity_data: {}, test_status: "none" };
    }
  }, [source, staticData, callbackData, mockData, entityData]);

  // Merged data (entity data + local overrides)
  const entityDataMap = useMemo(() => ({
    ...testDataRecord.entity_data,
    ...localData
  }), [testDataRecord.entity_data, localData]);

  // Get records for a specific entity
  const getRecords = useCallback(
    (entityName) => entityDataMap[entityName] || [],
    [entityDataMap]
  );

  // Get all entity names with data
  const getEntityNames = useCallback(
    () => Object.keys(entityDataMap),
    [entityDataMap]
  );

  // Get total record count
  const getTotalRecords = useCallback(() => {
    return Object.values(entityDataMap).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  }, [entityDataMap]);

  // Check if data exists
  const hasData = useCallback(
    () => getTotalRecords() > 0,
    [getTotalRecords]
  );

  // Update local data (for preview without saving)
  const setRecords = useCallback((entityName, records) => {
    setLocalData(prev => ({
      ...prev,
      [entityName]: records
    }));
    if (onDataChange) {
      onDataChange({ ...entityDataMap, [entityName]: records });
    }
  }, [entityDataMap, onDataChange]);

  // Add a record to an entity
  const addRecord = useCallback((entityName, record) => {
    const current = getRecords(entityName);
    const newRecord = { 
      ...record, 
      id: record.id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
    setRecords(entityName, [...current, newRecord]);
    return newRecord;
  }, [getRecords, setRecords]);

  // Update a record
  const updateRecord = useCallback((entityName, recordId, updates) => {
    const current = getRecords(entityName);
    const updated = current.map(r => 
      r.id === recordId ? { ...r, ...updates } : r
    );
    setRecords(entityName, updated);
  }, [getRecords, setRecords]);

  // Delete a record
  const deleteRecord = useCallback((entityName, recordId) => {
    const current = getRecords(entityName);
    setRecords(entityName, current.filter(r => r.id !== recordId));
  }, [getRecords, setRecords]);

  // Clear local changes
  const clearLocalChanges = useCallback(() => {
    setLocalData({});
  }, []);

  // Save mutation for entity source
  const saveMutation = useMutation({
    mutationFn: async (dataToSave) => {
      if (source !== "entity") {
        throw new Error("Can only save to entity source");
      }
      
      const mergedData = { ...testDataRecord.entity_data, ...localData, ...dataToSave };
      
      if (testDataRecord.id) {
        return base44.entities.TestData.update(testDataRecord.id, {
          entity_data: mergedData,
          test_status: "pending"
        });
      } else {
        return base44.entities.TestData.create({
          source_type: sourceType,
          source_id: sourceId,
          source_name: sourceId, // Will be overwritten by caller if needed
          name: "Test Data",
          entity_data: mergedData,
          is_default: true,
          test_status: "pending"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testData"] });
      setLocalData({});
    }
  });

  // Save all changes
  const save = useCallback(async () => {
    return saveMutation.mutateAsync({});
  }, [saveMutation]);

  // Verify test data
  const verify = useCallback(async () => {
    if (source !== "entity" || !testDataRecord.id) {
      throw new Error("Can only verify entity source with existing record");
    }
    await base44.entities.TestData.update(testDataRecord.id, { test_status: "verified" });
    refetch();
  }, [source, testDataRecord.id, refetch]);

  // Loading state
  const isLoading = source === "entity" ? entityLoading : 
                    source === "callback" ? callbackLoading : 
                    false;

  // Has unsaved changes
  const hasChanges = Object.keys(localData).length > 0;

  const contextValue = {
    // Data
    entityData: entityDataMap,
    testStatus: testDataRecord.test_status,
    testDataId: testDataRecord.id,
    isLoading,
    hasChanges,
    
    // Queries
    getRecords,
    getEntityNames,
    getTotalRecords,
    hasData,
    
    // Mutations
    setRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    clearLocalChanges,
    save,
    verify,
    refetch,
    
    // Config
    source,
    sourceType,
    sourceId,
  };

  return (
    <TestDataContext.Provider value={contextValue}>
      {children}
    </TestDataContext.Provider>
  );
}

/**
 * Generate mock records from a JSON schema
 */
function generateMockRecords(schema, count = 3) {
  const records = [];
  const properties = schema?.properties || {};
  
  for (let i = 0; i < count; i++) {
    const record = { id: `mock_${i + 1}` };
    
    Object.entries(properties).forEach(([key, prop]) => {
      record[key] = generateMockValue(prop, key, i);
    });
    
    records.push(record);
  }
  
  return records;
}

function generateMockValue(prop, key, index) {
  const type = prop.type;
  const format = prop.format;
  const enumValues = prop.enum;
  
  if (enumValues?.length > 0) {
    return enumValues[index % enumValues.length];
  }
  
  switch (type) {
    case "string":
      if (format === "date") return new Date(Date.now() - index * 86400000).toISOString().split("T")[0];
      if (format === "date-time") return new Date(Date.now() - index * 86400000).toISOString();
      if (format === "email") return `user${index + 1}@example.com`;
      if (key.toLowerCase().includes("name")) return `Sample ${key} ${index + 1}`;
      if (key.toLowerCase().includes("email")) return `user${index + 1}@example.com`;
      if (key.toLowerCase().includes("phone")) return `+1-555-000-${String(index + 1).padStart(4, "0")}`;
      return `${key} ${index + 1}`;
    case "number":
    case "integer":
      return (index + 1) * 100;
    case "boolean":
      return index % 2 === 0;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return null;
  }
}

export default TestDataProvider;