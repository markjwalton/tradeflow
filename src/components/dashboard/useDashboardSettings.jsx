import { useState, useEffect } from "react";

const SETTINGS_KEY = "dashboard_user_settings";

/**
 * Custom hook for managing dashboard user settings with localStorage persistence
 */
export default function useDashboardSettings(widgets = []) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { enableDragDrop: false, compactMode: false };
  });
  
  const [visibleWidgetIds, setVisibleWidgetIds] = useState(null);
  const [widgetOrder, setWidgetOrder] = useState([]);

  // Initialize visible widgets when data loads - include any new widgets
  useEffect(() => {
    if (widgets.length === 0) return;
    
    const savedIds = localStorage.getItem(`${SETTINGS_KEY}_visible`);
    if (savedIds) {
      const parsed = JSON.parse(savedIds);
      const allWidgetIds = widgets.map(w => w.id);
      const newWidgetIds = allWidgetIds.filter(id => !parsed.includes(id));
      if (newWidgetIds.length > 0) {
        setVisibleWidgetIds([...parsed, ...newWidgetIds]);
      } else if (visibleWidgetIds === null) {
        setVisibleWidgetIds(parsed);
      }
    } else {
      setVisibleWidgetIds(widgets.map(w => w.id));
    }
  }, [widgets]);

  // Initialize order
  useEffect(() => {
    if (widgets.length === 0 || widgetOrder.length > 0) return;
    
    const savedOrder = localStorage.getItem(`${SETTINGS_KEY}_order`);
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    } else {
      setWidgetOrder(widgets.map(w => w.id));
    }
  }, [widgets, widgetOrder.length]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (visibleWidgetIds !== null) {
      localStorage.setItem(`${SETTINGS_KEY}_visible`, JSON.stringify(visibleWidgetIds));
    }
  }, [visibleWidgetIds]);

  useEffect(() => {
    if (widgetOrder.length > 0) {
      localStorage.setItem(`${SETTINGS_KEY}_order`, JSON.stringify(widgetOrder));
    }
  }, [widgetOrder]);

  // Get ordered and filtered widgets
  const getDisplayWidgets = () => {
    if (!visibleWidgetIds) return [];
    
    const visibleWidgets = widgets.filter(w => visibleWidgetIds.includes(w.id));
    
    if (widgetOrder.length > 0) {
      return visibleWidgets.sort((a, b) => {
        const aIdx = widgetOrder.indexOf(a.id);
        const bIdx = widgetOrder.indexOf(b.id);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }
    
    // Default sort by widget type
    const order = { stat_card: 0, chart: 1, quick_action: 2, info_card: 3, table: 4, ai_insight: 5 };
    return visibleWidgets.sort((a, b) => (order[a.widget_type] ?? 99) - (order[b.widget_type] ?? 99));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgetOrder.length > 0 ? widgetOrder : widgets.map(w => w.id));
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setWidgetOrder(items);
  };

  return {
    settings,
    setSettings,
    visibleWidgetIds,
    setVisibleWidgetIds,
    widgetOrder,
    displayWidgets: getDisplayWidgets(),
    handleDragEnd,
  };
}