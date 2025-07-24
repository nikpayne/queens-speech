import React, { useState, useEffect } from "react";
import { Box, Text, Flex, VStack, HStack, Circle } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { queenNotifications } from "./queenNotifications";

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  isNew?: boolean;
}

interface QueensPhoneProps {
  baseSize?: number;
}

const expandNotification = keyframes`
  from {
    height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  to {
    height: auto;
    opacity: 1;
    padding-top: 0.75em;
    padding-bottom: 0.75em;
    margin-bottom: 0.5em;
  }
`;

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  time,
  isNew,
}) => {
  // Generate a random icon emoji/character for variety
  const icons = [
    "👑",
    "🐕",
    "🏰",
    "📱",
    "🍪",
    "💎",
    "🎭",
    "🌟",
    "📊",
    "🔒",
    "👨‍🍳",
    "💂",
  ];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];

  return (
    <Box
      bg="rgba(255, 255, 255, 0.85)"
      backdropFilter="blur(10px)"
      borderRadius="1em"
      p={isNew ? "0" : "0.75em"}
      mb={isNew ? "0" : "0.5em"}
      fontSize="1em"
      overflow="hidden"
      animation={
        isNew ? `${expandNotification} 0.8s ease-out forwards` : undefined
      }
    >
      <HStack gap="0.75em" align="flex-start" p={isNew ? "0.75em" : "0"}>
        <Circle
          size="2.5em"
          bg="linear-gradient(135deg, #FFD700, #FFA500)"
          color="white"
          fontSize="1.2em"
          flexShrink={0}
        >
          {randomIcon}
        </Circle>
        <VStack align="flex-start" gap="0.1em" flex={1} minW={0}>
          <HStack justify="space-between" w="100%">
            <Text fontSize="0.9em" fontWeight="600" color="black">
              {title}
            </Text>
            <Text fontSize="0.75em" color="gray.600" flexShrink={0}>
              {time}
            </Text>
          </HStack>
          <Text fontSize="0.8em" color="gray.800" lineHeight="1.2">
            {message}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

const QueensPhone: React.FC<QueensPhoneProps> = ({ baseSize = 16 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleNotifications, setVisibleNotifications] = useState<
    NotificationProps[]
  >([]);
  const [notificationIndex, setNotificationIndex] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize with first 3 notifications
  useEffect(() => {
    setVisibleNotifications(queenNotifications.slice(0, 3));
    setNotificationIndex(3);
  }, []);

  // Add new notification every 30 seconds
  useEffect(() => {
    if (notificationIndex >= queenNotifications.length) return;

    const timer = setInterval(() => {
      const newNotification = {
        ...queenNotifications[notificationIndex % queenNotifications.length],
        isNew: true,
      };

      setVisibleNotifications((prev) => {
        const updated = [newNotification, ...prev.slice(0, 2)];
        return updated.map((notif, index) => ({
          ...notif,
          isNew: index === 0,
        }));
      });

      setNotificationIndex((prev) => prev + 1);
    }, 1000); // 30 seconds

    return () => clearInterval(timer);
  }, [notificationIndex]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box
      w={`${baseSize}em`}
      h={`${baseSize * 2.1}em`}
      fontSize={`${baseSize}px`}
      position="relative"
    >
      {/* iPhone Frame */}
      <Box
        w="100%"
        h="100%"
        bg="linear-gradient(145deg, #FFD700, #FFA500, #FF8C00)"
        borderRadius="2.5em"
        p="0.3em"
        boxShadow="0 1em 3em rgba(0,0,0,0.3)"
      >
        {/* Screen */}
        <Box
          w="100%"
          h="100%"
          bg="linear-gradient(180deg, #FF6B6B 0%, #FF8E53 50%, #FF6B9D 100%)"
          borderRadius="2.2em"
          position="relative"
          overflow="hidden"
        >
          {/* Notch */}
          <Box
            position="absolute"
            top="0.3em"
            left="50%"
            transform="translateX(-50%)"
            w="8em"
            h="1.5em"
            bg="black"
            borderRadius="0 0 1em 1em"
            zIndex={10}
          />

          {/* Status Bar */}
          <HStack
            justify="space-between"
            px="1em"
            pt="2.2em"
            pb="0.5em"
            color="white"
            fontSize="0.7em"
            fontWeight="600"
          >
            <Box>🔒</Box>
            <HStack gap="0.3em">
              <Box>📶</Box>
              <Box>📶</Box>
              <Box>🔋</Box>
            </HStack>
          </HStack>

          {/* Time and Date */}
          <VStack gap="0.2em" color="white" textAlign="center" mt="2em">
            <Text fontSize="4em" fontWeight="200" lineHeight="0.9">
              {formatTime(currentTime)}
            </Text>
            <Text fontSize="1.1em" fontWeight="400" opacity={0.9}>
              {formatDate(currentTime)}
            </Text>
          </VStack>

          {/* Notifications Area */}
          <Box
            position="absolute"
            bottom="6em"
            left="1em"
            right="1em"
            maxH="12em"
            overflowY="hidden"
          >
            {visibleNotifications.map((notification, index) => (
              <Notification
                key={`${notification.title}-${index}`}
                title={notification.title}
                message={notification.message}
                time={notification.time}
                isNew={notification.isNew}
              />
            ))}
          </Box>

          {/* Bottom Indicators */}
          <HStack
            position="absolute"
            bottom="2em"
            left="50%"
            transform="translateX(-50%)"
            gap="2em"
          >
            <Circle
              size="3em"
              bg="rgba(255,255,255,0.3)"
              color="white"
              fontSize="1.2em"
            >
              🔦
            </Circle>
            <Circle
              size="3em"
              bg="rgba(255,255,255,0.3)"
              color="white"
              fontSize="1.2em"
            >
              📷
            </Circle>
          </HStack>

          {/* Home Indicator */}
          <Box
            position="absolute"
            bottom="0.5em"
            left="50%"
            transform="translateX(-50%)"
            w="8em"
            h="0.3em"
            bg="rgba(255,255,255,0.6)"
            borderRadius="0.15em"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default QueensPhone;
