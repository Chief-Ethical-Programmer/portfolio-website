const getEditableData = (key, defaultValue) => {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : defaultValue;
};

const setEditableData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export { getEditableData, setEditableData };
