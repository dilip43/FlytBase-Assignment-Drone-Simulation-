import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  MarkerF
} from "@react-google-maps/api";

let MapCenter = {
  lat: 48.8548,
  lng: 2.2945
};

export default function App() {
  const [originCordinate, setOriginCordinate] = useState({
    lat: null,
    lng: null
  });
  const [destinationlat, setDestinationlat] = useState("");
  const [destinationlng, setDestinationlng] = useState("");
  const [destinationTime, setDestinationTime] = useState("");
  const [directionResponse, setDirectionResponse] = useState(null);
  const [map, setMap] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [paused, setPaused] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyB1ljR8vJX0q4_gkxBPO_1yDx2Jnl9lh-Q"
  });

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  useEffect(() => {
    if (!paused && directionResponse) {
      getLiveLocation();
    }
  }, [paused]);

  const getLiveLocation = () => {
    const route = directionResponse.routes[0];
    const routePath = route.overview_path;
    let currentIndex = routePath.findIndex(
      (location) =>
        location.lat() === originCordinate.lat &&
        location.lng() === originCordinate.lng
    );

    clearInterval(intervalId); // Clear any existing interval

    const interval = setInterval(() => {
      if (!paused && currentIndex < routePath.length) {
        currentIndex++;
        const currentLocation = {
          lat: routePath[currentIndex].lat(),
          lng: routePath[currentIndex].lng()
        };
        setOriginCordinate(currentLocation);
      } else {
        clearInterval(interval);
      }
    }, destinationTime);

    setIntervalId(interval); // Update the intervalId state
  };

  const pause = () => {
    setPaused(true);
    clearInterval(intervalId);
  };

  const resume = () => {
    setPaused(false);
  };

  const CalculateRoute = async () => {
    if (destinationlat === "" || destinationlng === "") return;

    const directionService = new window.google.maps.DirectionsService();
    const result = await directionService.route({
      origin: originCordinate,
      destination: new window.google.maps.LatLng(
        destinationlat,
        destinationlng
      ),
      travelMode: "DRIVING"
    });
    console.log(result);
    setDirectionResponse(result);
  };

  const clearRoute = () => {
    setDestinationTime("");
    setDestinationlat("");
    setDestinationlng("");
    setDirectionResponse(null); // Reset the directionResponse
    setPaused(false); // Set paused to false
    clearInterval(intervalId); // Clear the interval
    setOriginCordinate(null); // Reset the marker position
  };

  if (!isLoaded) {
    return <SkeletonText />;
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      bgColor="blue.200"
      bgPos="bottom"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          center={MapCenter}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            streetViewControl: false,
            fullscreenControl: false
          }}
          onLoad={(map) => setMap(map)}
          onClick={(e) => {
            setOriginCordinate({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }}
        >
          <MarkerF position={originCordinate} />
          {directionResponse && (
            <DirectionsRenderer directions={directionResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        mt={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="modal"
      >
        <HStack spacing={4}>
          <Input
            type="text"
            id="lat"
            placeholder="Latitude"
            value={destinationlat}
            onChange={(e) => {
              setDestinationlat(e.target.value);
            }}
          />

          <Input
            type="text"
            id="lng"
            placeholder="Longitude"
            value={destinationlng}
            onChange={(e) => {
              setDestinationlng(e.target.value);
            }}
          />
          <Input
            type="number"
            id="time"
            placeholder="Time (in miliseconds)"
            value={destinationTime}
            onChange={(e) => {
              setDestinationTime(e.target.value);
            }}
          />
          <ButtonGroup>
            <Button colorScheme="pink" type="submit" onClick={CalculateRoute}>
              Calculate Route
            </Button>
            <Button
              colorScheme="pink"
              type="submit"
              onClick={() => getLiveLocation()}
            >
              Start
            </Button>
            <Button colorScheme="pink" type="submit" onClick={() => pause()}>
              Pause
            </Button>
            <Button colorScheme="pink" type="submit" onClick={() => resume()}>
              Resume
            </Button>

            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
      </Box>
    </Flex>
  );
}
