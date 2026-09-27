import type { FastifyReply, FastifyRequest } from "fastify";
import { formatUtcCalendarDate, parseCalendarDate } from "../lib/calendarDate";
import { prisma } from "../lib/prisma";
import {
  createEntrySchema,
  parseWithSchema,
  updateEntrySchema,
} from "../lib/validation";

type DiaryEntryRow = {
  id: number;
  date: Date;
  weight: number;
  mealType: string;
  userId: number;
  productId: string | null;
  productName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt: Date;
};

function serializeEntry(entry: DiaryEntryRow) {
  return {
    id: String(entry.id),
    date: formatUtcCalendarDate(entry.date),
    productId: entry.productId,
    productName: entry.productName,
    mealType: entry.mealType.toLowerCase(),
    weight: entry.weight,
    // КБЖУ в API — снимок на 100 г, записанный на DiaryEntry. Порцию считает клиент.
    calories: Math.round(entry.calories),
    protein: Math.round(entry.protein),
    fat: Math.round(entry.fat),
    carbs: Math.round(entry.carbs),
  };
}

function parseEntryId(id: string): number | null {
  const entryId = Number(id);
  if (!Number.isInteger(entryId) || entryId <= 0) {
    return null;
  }
  return entryId;
}

export const createEntry = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const parsed = parseWithSchema(createEntrySchema, request.body);
  if ("error" in parsed) {
    return reply.status(400).send({ error: parsed.error });
  }

  const {
    date,
    productId,
    productName,
    mealType,
    weight,
    calories,
    protein,
    fat,
    carbs,
  } = parsed.data;
  const userId = request.user!.id;
  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) {
    return reply.status(400).send({ error: "Invalid date" });
  }

  try {
    const entry = await prisma.diaryEntry.create({
      data: {
        date: calendarDate,
        weight,
        mealType,
        userId,
        productId: productId ?? null,
        productName,
        calories,
        protein,
        fat,
        carbs,
      },
    });

    return reply.send(serializeEntry(entry));
  } catch (error) {
    console.error("Create entry error:", error);
    return reply.status(500).send({ error: "Failed to create entry" });
  }
};

export const getEntriesByDate = async (
  request: FastifyRequest<{ Querystring: { date?: string } }>,
  reply: FastifyReply,
) => {
  const { date } = request.query;
  const userId = request.user!.id;

  if (!date) {
    return reply.status(400).send({ error: "date is required" });
  }

  const calendarDate = parseCalendarDate(date);
  if (!calendarDate) {
    return reply.status(400).send({ error: "Invalid date" });
  }

  try {
    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId,
        date: calendarDate,
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(entries.map(serializeEntry));
  } catch (error) {
    console.error("Get entries error:", error);
    return reply.status(500).send({ error: "Failed to fetch entries" });
  }
};

export const updateEntry = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const entryId = parseEntryId(request.params.id);
  const parsed = parseWithSchema(updateEntrySchema, request.body);
  if ("error" in parsed) {
    return reply.status(400).send({ error: parsed.error });
  }
  const { weight, mealType } = parsed.data;
  const userId = request.user!.id;

  if (entryId == null) {
    return reply.status(404).send({ error: "Entry not found" });
  }

  try {
    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== userId) {
      return reply.status(404).send({ error: "Entry not found" });
    }

    const updated = await prisma.diaryEntry.update({
      where: { id: entryId },
      data: {
        ...(weight !== undefined ? { weight } : {}),
        ...(mealType ? { mealType } : {}),
      },
    });

    return reply.send(serializeEntry(updated));
  } catch (error) {
    console.error("Update entry error:", error);
    return reply.status(500).send({ error: "Failed to update entry" });
  }
};

export const deleteEntry = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const entryId = parseEntryId(request.params.id);
  const userId = request.user!.id;

  if (entryId == null) {
    return reply.status(404).send({ error: "Entry not found" });
  }

  try {
    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== userId) {
      return reply.status(404).send({ error: "Entry not found" });
    }

    await prisma.diaryEntry.delete({ where: { id: entryId } });
    return reply.status(204).send();
  } catch (error) {
    console.error("Delete entry error:", error);
    return reply.status(500).send({ error: "Failed to delete entry" });
  }
};
