// This component will be used in the Modal of the RecipeList Component

import { Box, Button, Divider, Flex, HStack, Switch, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { IoPlay, IoPause, IoPlayBack, IoPlayForward } from "react-icons/io5";

function AudioInstructions({isVisible}) {

  const [autoPlay, setAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false)

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
      <Flex align="center" justify="center" alignItems="center" mb={3} >
        <Text fontWeight="medium" color="green.500" mr={4}>AutoPlay next step</Text>
        <Switch size="md" isChecked={autoPlay} colorScheme='green' onChange={(e) => setAutoPlay(e.target.checked)} />
        
      </Flex>

      <Divider mb={3} mt={3} borderColor="gray.400" />
      
      <HStack spacing={4} justify="center">
        <Button 
          colorScheme="green" 
          variant="solid" 
          onClick={()=>{}}>
            <IoPlayBack size="20px" />
        </Button>
        <Button 
          colorScheme="green" 
          variant="solid" 
          onClick={()=>{ setIsPlaying(!isPlaying)}}>
            {isPlaying ? <IoPause size="20px" /> : <IoPlay size="20px" />}
        </Button>
        <Button 
          colorScheme="green" 
          variant="solid" 
          onClick={()=>{}}>
            <IoPlayForward size="20px" />
        </Button>
      </HStack>
    </Box>
  )
}

export default AudioInstructions