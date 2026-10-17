
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WeatherData = {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

function getWeatherInfo(code: number) {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", icon: "🌤️" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "Drizzle", icon: "🌦️" };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Rainy", icon: "🌧️" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Snowy", icon: "❄️" };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: "Thunderstorm", icon: "⛈️" };
  }
  return { label: "Unknown conditions", icon: "🌡️" };
}

function WeatherStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">
        {icon} {label}
      </p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchWeather(city: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch weather.");
      }

      setWeather(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchWeather("Colombo");
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const city = search.trim();

    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    void fetchWeather(city);
    setSearch("");
  }

  const current = weather?.current;
  const today = current ? getWeatherInfo(current.weather_code) : null;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-sky-400">
              WEATHER APP
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Weather, simplified.
            </h1>
            <p className="mt-2 text-slate-400">
              Discover the weather wherever you go.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex w-full gap-2 sm:max-w-sm"
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a city..."
              aria-label="City name"
              className="border-slate-700 bg-slate-900 text-white"
            />
            <Button type="submit" disabled={loading}>
              Search
            </Button>
          </form>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        {loading && !weather && (
          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardContent className="p-8 text-center text-slate-300">
              Loading weather data...
            </CardContent>
          </Card>
        )}

        {weather && current && today && (
          <>
            <Card className="overflow-hidden border-slate-700 bg-gradient-to-br from-sky-900 to-slate-900 text-white">
              <CardContent className="grid gap-8 p-6 sm:grid-cols-2 sm:p-10">
                <div className="space-y-5">
                  <div>
                    <p className="text-slate-300">
                      Current weather in
                    </p>
                    <h2 className="mt-1 text-3xl font-semibold">
                      {weather.location.name}
                    </h2>
                    <p className="mt-1 text-slate-300">
                      {weather.location.country}
                    </p>
                    <p className="mt-3 text-slate-300">
                      {today.label}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-7xl" aria-hidden="true">
                      {today.icon}
                    </span>
                    <div>
                      <p className="text-6xl font-bold tracking-tighter">
                        {Math.round(current.temperature_2m)}°
                      </p>
                      <p className="mt-2 text-slate-300">
                        Feels like{" "}
                        {Math.round(current.apparent_temperature)}°C
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 self-center">
                  <WeatherStat
                    label="Humidity"
                    value={`${current.relative_humidity_2m}%`}
                    icon="💧"
                  />
                  <WeatherStat
                    label="Wind speed"
                    value={`${current.wind_speed_10m} km/h`}
                    icon="💨"
                  />
                  <WeatherStat
                    label="Latitude"
                    value={weather.location.latitude.toFixed(2)}
                    icon="📍"
                  />
                  <WeatherStat
                    label="Longitude"
                    value={weather.location.longitude.toFixed(2)}
                    icon="🧭"
                  />
                </div>
              </CardContent>
            </Card>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  5-day forecast
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Daily high and low temperatures
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {weather.daily.time.map((date, index) => {
                  const info = getWeatherInfo(
                    weather.daily.weather_code[index]
                  );

                  const formattedDate = new Date(
                    `${date}T12:00:00`
                  ).toLocaleDateString("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <Card
                      key={date}
                      className="border-slate-800 bg-slate-900 text-white"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-slate-300">
                          {formattedDate}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl" aria-hidden="true">
                          {info.icon}
                        </p>
                        <p className="mt-3 text-xl font-semibold">
                          {Math.round(
                            weather.daily.temperature_2m_max[index]
                          )}°
                          <span className="ml-2 text-slate-400">
                            {Math.round(
                              weather.daily.temperature_2m_min[index]
                            )}°
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {info.label}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <footer className="border-t border-slate-800 pt-5 text-center text-sm text-slate-500">
          Weather App · Built with Next.js and shadcn/ui
        </footer>
      </div>
    </main>
  );
}
