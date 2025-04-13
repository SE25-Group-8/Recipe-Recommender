/* MIT License

Copyright (c) 2025 Ayush Gala, Ayush Pathak, Keyur Gondhalekar */
'use client';

import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';

const NavLink = (props) => {
  const { children } = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={'#'}>
      {children}
    </Box>
  );
};

export default function Nav(props) {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { logout, user } = useAuth0();

  const handleBookMarks = () => {
    props.handleBookMarks();
  };

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,  // Redirects to home after logging out
    });
  };

  return (
    <>
      <Box color={"black"} mb={5} bg={"green.300"} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box pl={10}>
            <Heading size={"md"}>Saveurs Sélection</Heading>
          </Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={user?.picture || 'https://api.dicebear.com/7.x/adventurer/svg?seed=username'}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'xl'}
                      src={user?.picture || 'https://api.dicebear.com/7.x/adventurer/svg?seed=username'}
                    />
                  </Center>
                  <br />
                  <Center>
                    <Text fontSize="md" fontWeight="bold">
                      {user?.name || "Guest"}
                    </Text>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem onClick={handleBookMarks}>Bookmarks</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
