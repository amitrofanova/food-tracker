import type { Component } from "vue";
import ArrowDown from "./icons/ArrowDown.vue";
import ArrowLeft from "./icons/ArrowLeft.vue";
import ArrowRight from "./icons/ArrowRight.vue";
import Barcode from "./icons/Barcode.vue";
import Book from "./icons/Book.vue";
import Checkmark from "./icons/Checkmark.vue";
import Close from "./icons/Close.vue";
import Mic from "./icons/Mic.vue";
import Pencil from "./icons/Pencil.vue";
import PlusSymbol from "./icons/PlusSymbol.vue";
import Trash from "./icons/Trash.vue";

export const icons = {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Barcode,
  Book,
  Checkmark,
  Close,
  Mic,
  Pencil,
  PlusSymbol,
  Trash,
} satisfies Record<string, Component>;

export type IconName = keyof typeof icons;

export type IconSize = "sm" | "md" | "lg";
