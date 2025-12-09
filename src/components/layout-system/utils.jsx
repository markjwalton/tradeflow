/**
 * Extracts a value from data object using a binding string
 * e.g., getValueByBinding(data, "project.name") => data.project.name
 */
export function getValueByBinding(data, binding) {
  if (!binding || !data) return null;
  
  const parts = binding.split(".");
  let value = data;
  
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = value[part];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Sets a value in data object using a binding string
 * e.g., setValueByBinding(data, "project.name", "New Name")
 */
export function setValueByBinding(data, binding, value) {
  if (!binding || !data) return data;
  
  const parts = binding.split(".");
  const newData = { ...data };
  let current = newData;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    } else {
      current[part] = { ...current[part] };
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
  return newData;
}

/**
 * Formats a value based on format type
 */
export function formatValue(value, format) {
  if (value === null || value === undefined) return "—";
  
  switch (format) {
    case "currency":
      return `£${Number(value).toLocaleString()}`;
    
    case "hours":
      return `${value} hrs`;
    
    case "percent":
      return `${value}%`;
    
    case "text":
    default:
      return String(value);
  }
}

/**
 * Gets intent-based color classes
 */
export function getIntentClasses(intent) {
  switch (intent) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-destructive";
    case "default":
    default:
      return "text-foreground";
  }
}