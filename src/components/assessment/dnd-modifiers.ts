import type { Modifier } from "@dnd-kit/core";

/** Keep ranking drags on the vertical axis (avoids pulling in @dnd-kit/modifiers). */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Keep the dragged row inside its list. */
export const restrictToParentElement: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;
  const minY = containerNodeRect.top - draggingNodeRect.top;
  const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;
  return { ...transform, y: Math.min(Math.max(transform.y, minY), maxY) };
};
