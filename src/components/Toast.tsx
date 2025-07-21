import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <Box
      position="fixed"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      bg="green.500"
      color="white"
      px={4}
      py={3}
      borderRadius="md"
      boxShadow="lg"
      fontSize="sm"
      fontWeight="medium"
      maxW="400px"
      textAlign="center"
      animation="slideIn 0.3s ease-out"
    >
      <Text>{message}</Text>
    </Box>
  );
}
