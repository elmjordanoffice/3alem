"use client";
import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "./dnd-modifiers";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

export interface RankItem {
  id: string;
  label: string;
  detail?: string;
}

interface RankingListProps {
  items: RankItem[];
  onChange: (items: RankItem[]) => void;
  label: string;
  disabled?: boolean;
}

/**
 * Drag to rank, with full keyboard support: focus the handle, press Space,
 * move with the arrow keys, press Space again. Up/down buttons give a second,
 * simpler path for screen-reader and switch users.
 */
export function RankingList({ items, onChange, label, disabled }: RankingListProps) {
  const t = useTranslations("components.ranking");
  const n = useNumbers();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [announcement, setAnnouncement] = React.useState("");

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = arrayMove(items, from, to);
    onChange(next);
    setAnnouncement(t("moved", { item: items[from]!.label, position: n.number(to + 1), total: n.number(items.length) }));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    move(
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    );
  };

  const dndId = React.useId();
  const position = (id: string | number) => n.number(items.findIndex((i) => i.id === id) + 1);
  const name = (id: string | number) => items.find((i) => i.id === id)?.label ?? "";

  return (
    <div>
      <DndContext
        // A stable id keeps the drag library's aria ids the same on the server and the client.
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onDragEnd}
        accessibility={{
          screenReaderInstructions: { draggable: t("instructions") },
          announcements: {
            onDragStart: ({ active }) => t("picked", { item: name(active.id), position: position(active.id) }),
            onDragOver: ({ active, over }) => (over ? t("over", { item: name(active.id), position: position(over.id) }) : ""),
            onDragEnd: ({ active, over }) =>
              over ? t("dropped", { item: name(active.id), position: position(over.id) }) : t("cancelled"),
            onDragCancel: () => t("cancelled"),
          },
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ol aria-label={label} className="flex flex-col gap-2">
            {items.map((item, index) => (
              <SortableRow
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                disabled={disabled}
                onMove={move}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

function SortableRow({
  item,
  index,
  total,
  disabled,
  onMove,
}: {
  item: RankItem;
  index: number;
  total: number;
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
}) {
  const t = useTranslations("components.ranking");
  const n = useNumbers();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-2 rounded-control border border-border bg-surface py-2 pe-2 ps-1.5 transition-shadow duration-150",
        isDragging && "relative z-10 border-accent shadow-popover",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={t("handle", { item: item.label })}
        className="inline-flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-[6px] text-mark-muted hover:bg-surface-subtle hover:text-secondary focus-visible:outline-2 focus-visible:outline-focus active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-secondary tabular">
        {n.number(index + 1)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-text">{item.label}</span>
        {item.detail ? <span className="text-xs text-secondary">{item.detail}</span> : null}
      </span>
      <span className="flex shrink-0 gap-0.5">
        <button
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={disabled || index === 0}
          aria-label={t("moveUp", { item: item.label })}
          className="inline-flex size-8 items-center justify-center rounded-[6px] text-tertiary hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-30"
        >
          <ChevronUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={disabled || index === total - 1}
          aria-label={t("moveDown", { item: item.label })}
          className="inline-flex size-8 items-center justify-center rounded-[6px] text-tertiary hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-30"
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>
      </span>
    </li>
  );
}
