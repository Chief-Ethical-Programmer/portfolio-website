import { useState } from 'react';
import { useEditMode } from '../context/EditModeContext';
import { setEditableData } from '../utils/editableData';
import EditableText from './EditableText';

const EditableDataItem = ({ item, index, storageKey, items, onUpdate }) => {
  const { isEditMode } = useEditMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setEditableData(storageKey, updatedItems);
    if (onUpdate) onUpdate(updatedItems);
  };

  if (!isEditMode) {
    return null;
  }

  return (
    <div className="editable-data-item">
      <button 
        className="edit-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '✖' : '✏️'}
      </button>
      {isExpanded && (
        <div className="edit-fields">
          {Object.entries(item).map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={key} className="edit-field">
                  <label>{key}:</label>
                  {value.map((item, i) => (
                    <EditableText
                      key={i}
                      value={item}
                      onChange={(newValue) => {
                        const newArray = [...value];
                        newArray[i] = newValue;
                        handleUpdate(key, newArray);
                      }}
                      storageKey={`${storageKey}-${index}-${key}-${i}`}
                    />
                  ))}
                </div>
              );
            }
            return (
              <div key={key} className="edit-field">
                <label>{key}:</label>
                <EditableText
                  value={value}
                  onChange={(newValue) => handleUpdate(key, newValue)}
                  storageKey={`${storageKey}-${index}-${key}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EditableDataItem;