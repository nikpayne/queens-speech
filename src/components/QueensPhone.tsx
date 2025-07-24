import React, { useState, useEffect } from "react";
import { Box, Text, Flex, VStack, HStack, Circle } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { queenNotifications } from "./queenNotifications";

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  emoji: string;
  id: number;
  isNew?: boolean;
}

const ANIMATION_DURATION = 1000;

interface QueensPhoneProps {
  baseSize?: number;
}

const scaleHeight = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 1000px;
  }
`;

const scaleContent = keyframes`
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  time,
  emoji,
  id,
  isNew,
}) => {
  return (
    <Box
      animation={
        isNew
          ? `${scaleHeight} ${ANIMATION_DURATION / 4}ms ease-out forwards`
          : undefined
      }
      height="auto"
      overflowY="hidden !important"
    >
      <Box
        bg="rgba(255, 255, 255, 0.25)"
        backdropFilter="blur(10px)"
        borderRadius="1em"
        p="0.75em"
        mb="0.5em"
        fontSize="1em"
        // transformOrigin="center"
        // animation={
        //   isNew ? `${scaleContent} ${ANIMATION_DURATION}ms ease-out` : undefined
        // }
      >
        <HStack gap="0.75em" align="flex-start">
          <Circle
            size="2.5em"
            bg="linear-gradient(135deg, #FFD700, #FFA500)"
            color="white"
            fontSize="1.2em"
            flexShrink={0}
          >
            {emoji}
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
    const initialNotifs = queenNotifications.slice(0, 3).map((notif, i) => ({
      ...notif,
      id: i,
      isNew: false,
    }));
    setVisibleNotifications(initialNotifs);
    setNotificationIndex(3);
  }, []);

  // Add new notification every 3 seconds
  useEffect(() => {
    if (notificationIndex === 0) return; // Wait for initialization

    const timer = setInterval(() => {
      const newNotification = {
        ...queenNotifications[notificationIndex % queenNotifications.length],
        id: Date.now(), // Unique ID
        isNew: true,
      };

      setVisibleNotifications((prev) => {
        // Add new notification to top, keep only 3 total
        const updated = [newNotification, ...prev.slice(0, 2)];
        // Mark all as not new after first render
        return updated.map((notif, index) => ({
          ...notif,
          isNew: index === 0 && notif.isNew,
        }));
      });

      // Clear the isNew flag after animation
      setTimeout(() => {
        setVisibleNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isNew: false }))
        );
      }, ANIMATION_DURATION); // Match the 2s animation duration

      setNotificationIndex((prev) => prev + 1);
    }, 3000);

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
            height="12em"
            overflow="hidden"
            _after={{
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4em",
              background:
                "linear-gradient(0deg, #FF6B9D 0%, rgba(0,0,0,0) 100%)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            {/* Simple Notification List */}
            <Box>
              {visibleNotifications.map((notification) => (
                <Notification
                  key={notification.id}
                  title={notification.title}
                  message={notification.message}
                  time={notification.time}
                  emoji={notification.emoji}
                  id={notification.id}
                  isNew={notification.isNew}
                />
              ))}
            </Box>
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
