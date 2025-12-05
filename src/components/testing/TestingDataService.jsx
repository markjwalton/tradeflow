/**
 * TestingDataService.js
 * 
 * Centralized service for managing Testing Hub data operations.
 * Handles relationships, sync, and rate-limited operations.
 * 
 * ENTITY RELATIONSHIPS:
 * 
 * Library Templates (Source of Truth)
 *   └── EntityTemplate, PageTemplate, FeatureTemplate
 *       └── source_id is the STABLE key
 * 
 * PlaygroundItem (Working Copy)
 *   └── References Library via source_id
 *   └── Can become orphaned if library item deleted
 *   └── sync_status tracks relationship health
 * 
 * TestData (Test Artifacts)
 *   └── References Library via source_id (NOT playground!)
 *   └── Persists independently of playground sync/clear
 *   └── playground_item_id is optional for current session
 * 
 * DATA PERSISTENCE STRATEGY:
 * 1. TestData is linked to LIBRARY source_id, not PlaygroundItem.id
 * 2. When playground is cleared/resynced, TestData survives
 * 3. TestData can be versioned for rollback
 * 4. Entity schemas are snapshotted to detect drift
 */

import { base44 } from "@/api/base44Client";

// Default rate limit config
const DEFAULT_RATE_LIMITS = {
  maxBatchSize: 5,
  delayBetweenBatchesMs: 2000,
  maxConcurrentOperations: 3,
  cooldownAfterErrorMs: 5000
};

class TestingDataService {
  constructor() {
    this.rateLimits = { ...DEFAULT_RATE_LIMITS };
    this.operationQueue = [];
    this.isProcessing = false;
    this.lastOperationTime = 0;
  }

  /**
   * Load rate limits from config
   */
  async loadConfig() {
    try {
      const configs = await base44.entities.TestingConfig.filter({ config_type: "global" });
      if (configs.length > 0 && configs[0].rate_limits) {
        this.rateLimits = {
          maxBatchSize: configs[0].rate_limits.max_batch_size || DEFAULT_RATE_LIMITS.maxBatchSize,
          delayBetweenBatchesMs: configs[0].rate_limits.delay_between_batches_ms || DEFAULT_RATE_LIMITS.delayBetweenBatchesMs,
          maxConcurrentOperations: configs[0].rate_limits.max_concurrent_operations || DEFAULT_RATE_LIMITS.maxConcurrentOperations,
          cooldownAfterErrorMs: configs[0].rate_limits.cooldown_after_error_ms || DEFAULT_RATE_LIMITS.cooldownAfterErrorMs
        };
      }
    } catch (e) {
      console.warn("Could not load TestingConfig, using defaults:", e.message);
    }
  }

  /**
   * Rate-limited delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ensure minimum time between operations
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLast = now - this.lastOperationTime;
    const minDelay = this.rateLimits.delayBetweenBatchesMs;
    
    if (timeSinceLast < minDelay) {
      await this.delay(minDelay - timeSinceLast);
    }
    this.lastOperationTime = Date.now();
  }

  /**
   * Process items in rate-limited batches
   * @param {Array} items - Items to process
   * @param {Function} processor - Async function to process each item
   * @param {Function} onProgress - Progress callback
   * @returns {Array} Results
   */
  async processBatched(items, processor, onProgress) {
    await this.loadConfig();
    const results = [];
    const { maxBatchSize, delayBetweenBatchesMs, cooldownAfterErrorMs } = this.rateLimits;
    
    for (let i = 0; i < items.length; i += maxBatchSize) {
      const batch = items.slice(i, i + maxBatchSize);
      
      for (const item of batch) {
        try {
          const result = await processor(item);
          results.push({ item, success: true, result });
        } catch (error) {
          results.push({ item, success: false, error: error.message });
          // Extra delay after error
          await this.delay(cooldownAfterErrorMs);
        }
        
        if (onProgress) {
          onProgress(results.length, items.length, results);
        }
      }
      
      // Delay between batches
      if (i + maxBatchSize < items.length) {
        await this.delay(delayBetweenBatchesMs);
      }
    }
    
    return results;
  }

  /**
   * Find TestData by library source (stable relationship)
   */
  async findTestDataBySource(sourceType, sourceId) {
    const results = await base44.entities.TestData.filter({
      source_type: sourceType,
      source_id: sourceId
    });
    return results[0] || null;
  }

  /**
   * Create or update TestData linked to library source
   */
  async upsertTestData(sourceType, sourceId, sourceName, entityData, options = {}) {
    const existing = await this.findTestDataBySource(sourceType, sourceId);
    
    const data = {
      source_type: sourceType,
      source_id: sourceId,
      source_name: sourceName,
      entity_data: entityData,
      name: options.name || "Default Test Data",
      is_default: options.isDefault !== false,
      test_status: options.testStatus || "pending",
      generation_method: options.generationMethod || "ai_generated"
    };
    
    if (options.playgroundItemId) {
      data.playground_item_id = options.playgroundItemId;
    }
    
    if (options.entitySchemas) {
      data.entity_schemas = options.entitySchemas;
    }
    
    if (existing) {
      // Version the old data before updating
      const previousVersions = existing.previous_versions || [];
      if (existing.entity_data && Object.keys(existing.entity_data).length > 0) {
        previousVersions.push({
          version: existing.version || 1,
          entity_data: existing.entity_data,
          saved_date: new Date().toISOString()
        });
        // Keep only last 5 versions
        while (previousVersions.length > 5) {
          previousVersions.shift();
        }
      }
      
      return await base44.entities.TestData.update(existing.id, {
        ...data,
        version: (existing.version || 1) + 1,
        previous_versions: previousVersions
      });
    } else {
      return await base44.entities.TestData.create({
        ...data,
        version: 1,
        previous_versions: []
      });
    }
  }

  /**
   * Verify TestData
   */
  async verifyTestData(testDataId) {
    await this.enforceRateLimit();
    return await base44.entities.TestData.update(testDataId, {
      test_status: "verified",
      last_verified_date: new Date().toISOString()
    });
  }

  /**
   * Bulk verify with rate limiting
   */
  async bulkVerify(testDataIds, onProgress) {
    return await this.processBatched(
      testDataIds,
      async (id) => {
        await base44.entities.TestData.update(id, {
          test_status: "verified",
          last_verified_date: new Date().toISOString()
        });
        return { id, verified: true };
      },
      onProgress
    );
  }

  /**
   * Sync playground items from library
   * Preserves TestData by using source_id relationships
   */
  async syncFromLibrary(sourceType, libraryItems, onProgress) {
    const results = [];
    
    for (let i = 0; i < libraryItems.length; i++) {
      const libItem = libraryItems[i];
      
      try {
        // Check if playground item exists for this source
        const existing = await base44.entities.PlaygroundItem.filter({
          source_type: sourceType,
          source_id: libItem.id
        });
        
        if (existing.length > 0) {
          // Update existing
          await base44.entities.PlaygroundItem.update(existing[0].id, {
            source_name: libItem.name,
            working_data: libItem,
            sync_status: "synced",
            last_sync_date: new Date().toISOString(),
            library_version: libItem.version || 1
          });
          results.push({ item: libItem, action: "updated", success: true });
        } else {
          // Create new
          await base44.entities.PlaygroundItem.create({
            source_type: sourceType,
            source_id: libItem.id,
            source_name: libItem.name,
            working_data: libItem,
            item_origin: "library",
            sync_status: "synced",
            last_sync_date: new Date().toISOString(),
            library_version: libItem.version || 1,
            status: "synced"
          });
          results.push({ item: libItem, action: "created", success: true });
        }
        
        // Link any existing TestData to this playground item
        const testData = await this.findTestDataBySource(sourceType, libItem.id);
        if (testData && existing.length > 0) {
          await base44.entities.TestData.update(testData.id, {
            playground_item_id: existing[0].id
          });
        }
        
      } catch (error) {
        results.push({ item: libItem, success: false, error: error.message });
      }
      
      if (onProgress) {
        onProgress(i + 1, libraryItems.length, results);
      }
      
      await this.delay(100); // Small delay to prevent rate limiting
    }
    
    return results;
  }

  /**
   * Clear playground items WITHOUT deleting TestData
   */
  async clearPlayground(sourceType = null, onProgress) {
    const filter = sourceType ? { source_type: sourceType } : {};
    const items = await base44.entities.PlaygroundItem.filter(filter);
    
    return await this.processBatched(
      items,
      async (item) => {
        // Clear playground_item_id reference in TestData but don't delete
        const testData = await this.findTestDataBySource(item.source_type, item.source_id);
        if (testData) {
          await base44.entities.TestData.update(testData.id, {
            playground_item_id: null
          });
        }
        
        // Delete playground item
        await base44.entities.PlaygroundItem.delete(item.id);
        return { id: item.id, cleared: true };
      },
      onProgress
    );
  }

  /**
   * Mark orphaned items (library source deleted)
   */
  async detectOrphans(sourceType, libraryIds) {
    const playgroundItems = await base44.entities.PlaygroundItem.filter({ source_type: sourceType });
    const libraryIdSet = new Set(libraryIds);
    
    const orphans = playgroundItems.filter(p => p.source_id && !libraryIdSet.has(p.source_id));
    
    for (const orphan of orphans) {
      await base44.entities.PlaygroundItem.update(orphan.id, {
        sync_status: "orphaned"
      });
    }
    
    return orphans;
  }

  /**
   * Rollback TestData to previous version
   */
  async rollbackTestData(testDataId, versionIndex) {
    const testData = await base44.entities.TestData.filter({ id: testDataId });
    if (testData.length === 0) return null;
    
    const td = testData[0];
    const versions = td.previous_versions || [];
    
    if (versionIndex < 0 || versionIndex >= versions.length) {
      throw new Error("Invalid version index");
    }
    
    const targetVersion = versions[versionIndex];
    
    // Save current as new version before rollback
    const newVersions = [...versions];
    newVersions.push({
      version: td.version,
      entity_data: td.entity_data,
      saved_date: new Date().toISOString()
    });
    
    // Remove the version we're rolling back to
    newVersions.splice(versionIndex, 1);
    
    return await base44.entities.TestData.update(testDataId, {
      entity_data: targetVersion.entity_data,
      version: (td.version || 1) + 1,
      previous_versions: newVersions.slice(-5), // Keep last 5
      test_status: "pending" // Re-verify after rollback
    });
  }
}

// Export singleton
export const testingDataService = new TestingDataService();
export default testingDataService;