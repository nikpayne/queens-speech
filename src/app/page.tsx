import {
  Stack,
  HStack,
  Textarea,
  Container,
  Text,
  Button,
} from "@chakra-ui/react";

export default function Home() {
  return (
    <HStack p="4" bg="red" h="100vh" alignItems="flex-start" gap="4">
      <Stack flex="1">
        <Textarea placeholder="Enter your text here" minH="400px" />
        <Button>Make Queen's speech</Button>
      </Stack>
      <Stack flex="1">
        <Text>Queens speech goes here</Text>
      </Stack>
    </HStack>
  );
}
