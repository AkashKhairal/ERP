import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from './button';
import { RotateCcw, GripVertical } from 'lucide-react';

const DraggableGrid = ({ 
  children, 
  items, 
  onReorder, 
  defaultOrder = null,
  className = "",
  resetButton = true,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6
}) => {
  const [orderedItems, setOrderedItems] = useState([]);
  const [originalOrder, setOriginalOrder] = useState([]);

  useEffect(() => {
    if (defaultOrder) {
      setOrderedItems([...defaultOrder]);
      setOriginalOrder([...defaultOrder]);
    } else {
      const initialOrder = items.map((item, index) => ({ 
        ...item, 
        id: item.id || `item-${index}`,
        originalIndex: index 
      }));
      setOrderedItems(initialOrder);
      setOriginalOrder(initialOrder);
    }
  }, [items, defaultOrder]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(orderedItems);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setOrderedItems(reorderedItems);
    if (onReorder) {
      onReorder(reorderedItems);
    }
  };

  const resetLayout = () => {
    setOrderedItems([...originalOrder]);
    if (onReorder) {
      onReorder(originalOrder);
    }
  };

  const getGridCols = () => {
    const cols = [];
    if (columns.sm) cols.push(`grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(' ');
  };

  return (
    <div className={`relative ${className}`}>
      {resetButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetLayout}
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Layout
        </Button>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="draggable-grid" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid gap-${gap} ${getGridCols()}`}
            >
              {orderedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-all duration-300 ${
                        snapshot.isDragging ? 'scale-105 shadow-2xl rotate-1 z-50' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? provided.draggableProps.style?.transform 
                          : 'none'
                      }}
                    >
                      <div className="relative group">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
                        >
                          <div className="bg-background/80 backdrop-blur-sm rounded p-1 shadow-sm">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="relative">
                          {children(item, index)}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DraggableGrid; 