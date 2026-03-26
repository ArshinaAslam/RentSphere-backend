import logger from "./logger";

interface GeocodeResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  pincode: string,
): Promise<GeocodeResult | null> {
  try {
    const query = encodeURIComponent(
      `${address}, ${city}, ${state}, ${pincode}, India`,
    );
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RentSphere/1.0 (rental platform)",
      },
    });

    if (!response.ok) {
      logger.warn("Geocoding request failed", { status: response.status });
      return null;
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;

    if (!data || data.length === 0 || !data[0]) {
      logger.warn("No geocoding results found", { address, city, state });
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    logger.error("Geocoding error", { error, address, city });
    return null;
  }
}
