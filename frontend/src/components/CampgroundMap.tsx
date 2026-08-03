import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
type CampgroundMapProps = {
  title: string;
  location: string;
  coordinates: [number, number];
};

const CampgroundMap = ({
  title,
  location,
  coordinates,
}: CampgroundMapProps) => {
  const [longitude, latitude] = coordinates;
  //tutaj zamieniamy miejscami x,y na y,x
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>
          <div>
            <p className="font-semibold">{title}</p>
            <p>{location}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default CampgroundMap;
