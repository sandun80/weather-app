import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim();

    if (!city) {
      return NextResponse.json(
        { error: "Please provide a city name." },
        { status: 400 }
      );
    }

    // Step 1: Find the city's coordinates
    const geoUrl = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );

    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      return NextResponse.json(
        { error: "Could not look up the city." },
        { status: 502 }
      );
    }

    const geoData = await geoResponse.json();
    const location = geoData.results?.[0];

    if (!location) {
      return NextResponse.json(
        { error: "City not found. Please try another city." },
        { status: 404 }
      );
    }

    // Step 2: Fetch the weather
    const weatherUrl = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

    weatherUrl.searchParams.set("latitude", String(location.latitude));
    weatherUrl.searchParams.set("longitude", String(location.longitude));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
    );
    weatherUrl.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min"
    );
    weatherUrl.searchParams.set("timezone", "auto");
    weatherUrl.searchParams.set("forecast_days", "5");

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { error: "Could not retrieve weather data." },
        { status: 502 }
      );
    }

    const weatherData = await weatherResponse.json();

    // Step 3: Return data to our frontend
    return NextResponse.json({
      location: {
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      current: weatherData.current,
      daily: weatherData.daily,
    });
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching weather." },
      { status: 500 }
    );
  }
}
