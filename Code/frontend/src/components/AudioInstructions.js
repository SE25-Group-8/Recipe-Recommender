import { Box, Button, Divider, Flex, HStack, Switch, Text } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { IoPlay, IoPause, IoPlayBack, IoPlayForward } from "react-icons/io5";

function AudioInstructions({ isVisible, instructions }) {
  const [autoPlay, setAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const _steps = instructions
      .split(".")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    setSteps(_steps);
  }, [instructions]);

  // If currentIndex changes while playing, speak that step
  useEffect(() => {
    if (steps.length === 0) return;
    if (isPlaying) {
      synthRef.current.cancel();
      speakStep(currentIndex);
    }
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
    };
  }, []);

  const speakStep = (index) => {
    if (index >= steps.length || index < 0) return;

    const utterance = new SpeechSynthesisUtterance(steps[index]);
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (autoPlay && index + 1 < steps.length) {
        setCurrentIndex(index + 1); 
      } else {
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  

  const handlePlayPause = () => {
    const synth = synthRef.current;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        speakStep(currentIndex);
      }
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(steps.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
  };

  return (
    <Box 
      display={isVisible ? "block" : "none"} 
      bg="green.100" 
      borderRadius="md" 
      p={4}
      width="30%"
      minW="300px"
      mt={2}
      mb={2}
    >
      <Flex align="center" justify="center" mb={3}>
        <Text fontWeight="medium" color="green.500" mr={4}>AutoPlay next step</Text>
        <Switch 
          size="md" 
          isChecked={autoPlay} 
          colorScheme='green' 
          onChange={(e) => setAutoPlay(e.target.checked)} 
        />
      </Flex>

      <Divider mb={3} mt={3} borderColor="gray.400" />
      
      <Flex spacing={4} justify="center" align='flex-start'>
        <Button colorScheme="green" variant="solid" onClick={handlePrev}>
          <IoPlayBack size="20px" />
        </Button>
        <Flex direction='column' align='center' ml={3} mr={3}>
          <Button colorScheme="green" variant="solid" onClick={handlePlayPause}>
            {isPlaying ? <IoPause size="20px" /> : <IoPlay size="20px" />}
          </Button>
          <Text color="green.500">Step {currentIndex+1}/{steps.length}</Text>
        </Flex>
        <Button colorScheme="green" variant="solid" onClick={handleNext}>
          <IoPlayForward size="20px" />
        </Button>
      </Flex>
    </Box>
  );
}

export default AudioInstructions;
