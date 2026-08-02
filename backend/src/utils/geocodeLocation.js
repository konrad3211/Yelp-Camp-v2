export const geocodeLocation = async ({ city, street, houseNumber }) => {
  const streetQuery = `${houseNumber} ${street}`.trim();

  const searchParams = new URLSearchParams({
    street: streetQuery,
    city,
    country: "Poland",
    countrycodes: "pl",
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
    {
      headers: {
        "User-Agent": process.env.NOMINATIM_USER_AGENT,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new AppError("Geocoding service failed", 502);
  }

  const results = await response.json();

  if (results.length === 0) {
    return null;
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
    displayName: results[0].display_name,
  };
};
