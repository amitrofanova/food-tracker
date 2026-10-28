import { randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { parseCredentials } from "../lib/authValidation";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  isNativeClient,
  setAuthCookies,
} from "../lib/authCookies";
import {
  createSession,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "../lib/authTokens";
import { parseWithSchema, updateMeSchema } from "../lib/validation";

const SALT_ROUNDS = 12;

let dummyPasswordHash: Promise<string> | undefined;

function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= bcrypt.hash(randomBytes(32).toString("hex"), SALT_ROUNDS);
  return dummyPasswordHash;
}

export function prepareDummyPasswordHash(): Promise<string> {
  return getDummyPasswordHash();
}

type PublicUser = {
  id: number;
  email: string;
  calorieBudget: number | null;
};

function toPublicUser(user: PublicUser) {
  return {
    id: user.id,
    email: user.email,
    calorieBudget: user.calorieBudget,
  };
}

function readRefreshToken(request: FastifyRequest): string | undefined {
  const fromCookie = request.cookies[REFRESH_COOKIE];
  if (fromCookie) return fromCookie;
  const body = request.body;
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const refreshToken = (body as Record<string, unknown>).refreshToken;
  if (typeof refreshToken === "string" && refreshToken.length > 0) {
    return refreshToken;
  }
  return undefined;
}

type AuthResponseBody = {
  user: PublicUser;
  token?: string;
  refreshToken?: string;
};

async function issueAuthResponse(
  request: FastifyRequest,
  reply: FastifyReply,
  user: PublicUser,
  statusCode = 200,
) {
  const { token, refreshToken } = await createSession(user.id);
  setAuthCookies(reply, token, refreshToken);
  const payload: AuthResponseBody = {
    user: toPublicUser(user),
  };
  if (isNativeClient(request)) {
    payload.token = token;
    payload.refreshToken = refreshToken;
  }
  return reply.status(statusCode).send(payload);
}

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  const parsed = parseCredentials(request.body);
  if ("error" in parsed) {
    return reply.status(400).send({ error: parsed.error });
  }

  const { email, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        calorieBudget: 2000,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return reply.status(201).send({ ok: true });
    }
    console.error("Registration error:", error);
    return reply.status(500).send({ error: "Ошибка сервера" });
  }

  return reply.status(201).send({ ok: true });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const parsed = parseCredentials(request.body);
  if ("error" in parsed) {
    return reply.status(400).send({ error: parsed.error });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = user?.password ?? (await getDummyPasswordHash());
    const passwordMatches = await bcrypt.compare(password, passwordHash);
    if (!user || !passwordMatches) {
      return reply.status(401).send({ error: "Неверный email или пароль" });
    }

    return issueAuthResponse(request, reply, user);
  } catch (error) {
    console.error("Login error:", error);
    return reply.status(500).send({ error: "Ошибка сервера" });
  }
};

export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
  const currentToken = readRefreshToken(request);
  if (!currentToken) {
    return reply.status(401).send({ error: "Refresh-токен отсутствует" });
  }

  try {
    const rotated = await rotateRefreshToken(currentToken);
    if (!rotated) {
      clearAuthCookies(reply);
      return reply.status(401).send({ error: "Недействительный refresh-токен" });
    }

    const token = signAccessToken(rotated.userId);
    setAuthCookies(reply, token, rotated.refreshToken);
    if (isNativeClient(request)) {
      return reply.send({
        token,
        refreshToken: rotated.refreshToken,
      });
    }
    return reply.send({});
  } catch (error) {
    console.error("Refresh error:", error);
    return reply.status(500).send({ error: "Ошибка сервера" });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const currentToken = readRefreshToken(request);
  try {
    if (currentToken) {
      await revokeRefreshToken(currentToken);
    }
    clearAuthCookies(reply);
    return reply.status(204).send();
  } catch (error) {
    console.error("Logout error:", error);
    return reply.status(500).send({ error: "Ошибка сервера" });
  }
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, calorieBudget: true },
    });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
    return reply.send(user);
  } catch (error) {
    console.error("Get me error:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const parsed = parseWithSchema(updateMeSchema, request.body);
  if ("error" in parsed) {
    return reply.status(400).send({ error: parsed.error });
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { calorieBudget: parsed.data.calorieBudget },
      select: { id: true, email: true, calorieBudget: true },
    });
    return reply.send(user);
  } catch (error) {
    console.error("Update me error:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
};
