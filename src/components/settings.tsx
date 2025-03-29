"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/db";
import {
  VStack,
  Heading,
  FormControl,
  Input,
  Button,
  Center,
} from "@yamada-ui/react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export function Settings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createNewUser = useCallback(async () => {
    const newId = nanoid();
    console.log("Creating new user with id:", newId);
    console.log("Current users:", await db.users.toArray());
    await db.users.add({
      id: newId,
      username: "User",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "online",
    });
    setUserId(newId);
    return newId;
  }, []);

  const checkUserId = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    console.log("userId", userId);
    if (!userId) {
      const newId = await createNewUser();
      localStorage.setItem("userId", newId);
      return newId;
    }
    const user = await db.users.where("id").equals(userId).first();
    if (!user) {
      const newId = await createNewUser();
      localStorage.setItem("userId", newId);
      return newId;
    }
    setUserId(userId);
    return userId;
  }, [createNewUser]);

  useEffect(() => {
    checkUserId();
  }, [userId, checkUserId]);

  const { data: currentUsername } = useQuery({
    queryKey: ["currentUsername", userId],
    queryFn: async () => {
      const user = await db.users.where("id").equals(userId).first();
      if (!user) {
        const user = await db.users.where("id").equals(userId).first();
        console.log(user);
        return user.username;
      }
      console.log(user);
      return user.username;
    },
    enabled: !!userId,
  });

  // Set initial username when currentUsername is fetched
  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !username.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Update username in local database
      await db.users
        .where("id")
        .equals(userId)
        .modify({
          username: username.trim(),
          updatedAt: new Date().toISOString(),
        })
        .then(() => {
          router.push("/");
        });
    } catch (error) {
      console.error("Failed to update username:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center p="md" maxW="2xl" w="full">
      <VStack gap="md">
        <Heading size="lg">Settings</Heading>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack gap="md">
            <FormControl label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                disabled={isLoading}
              />
            </FormControl>
            <Button
              type="submit"
              disabled={isLoading || !username.trim()}
              colorScheme="primary"
              loading={isLoading}
            >
              Save Changes
            </Button>
          </VStack>
        </form>
      </VStack>
    </Center>
  );
}
