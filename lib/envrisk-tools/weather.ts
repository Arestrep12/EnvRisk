type GeocodingResult = {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  admin1?: string;
  admin2?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  current_units?: Record<string, string>;
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
  };
  daily_units?: Record<string, string>;
};

type NasaPowerResponse = {
  properties?: {
    parameter?: {
      PRECTOTCORR?: Record<string, number>;
      T2M?: Record<string, number>;
      T2M_MAX?: Record<string, number>;
      T2M_MIN?: Record<string, number>;
      RH2M?: Record<string, number>;
      WS2M?: Record<string, number>;
    };
  };
  header?: {
    title?: string;
    fill_value?: number;
    start?: string;
    end?: string;
  };
  parameters?: Record<string, { units?: string; longname?: string }>;
};

type IdeamPrecipitationObservation = {
  codigoestacion?: string;
  fechaobservacion?: string;
  valorobservado?: string;
  nombreestacion?: string;
  departamento?: string;
  municipio?: string;
  latitud?: string;
  longitud?: string;
  descripcionsensor?: string;
  unidadmedida?: string;
};

type IdeamStation = {
  codigo?: string;
  nombre?: string;
  categoria?: string;
  tecnologia?: string;
  estado?: string;
  departamento?: string;
  municipio?: string;
  latitud?: string;
  longitud?: string;
  altitud?: string;
  entidad?: string;
};

type ClimateToolContext = {
  locationName: string;
  municipality: string;
  department: string;
  latitude: number;
  longitude: number;
  generatedAt: string;
  current?: ForecastResponse["current"];
  currentUnits?: ForecastResponse["current_units"];
  daily?: ForecastResponse["daily"];
  dailyUnits?: ForecastResponse["daily_units"];
  historical?: ForecastResponse["daily"];
  historicalUnits?: ForecastResponse["daily_units"];
  nasaPower?: NasaPowerResponse;
  ideamPrecipitation?: IdeamPrecipitationObservation[];
  ideamStations?: IdeamStation[];
};

export type ClimateToolResult = {
  context: string;
  directAnswer?: string;
};

const defaultLocation = "Medellin, Antioquia, Colombia";
const timezone = "America/Bogota";
const toolFetchTimeoutMs = 6000;
const monthByName: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  setiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

const climateIntentWords = [
  "clima",
  "lluvia",
  "llover",
  "precipitacion",
  "precipitaciones",
  "temperatura",
  "pronostico",
  "tiempo",
  "viento",
  "humedad",
  "meteorologico",
  "meteorologica",
  "historico",
  "historica",
  "pasado",
  "pasada",
  "ayer",
  "ideam",
  "nasa",
  "estacion",
  "estaciones",
];

const historicalIntentWords = [
  "historico",
  "historica",
  "historial",
  "pasado",
  "pasada",
  "ayer",
  "ultimos dias",
  "ultimas semanas",
];

const dateIntentPattern =
  /\b\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b|\b\d{4}-\d{2}-\d{2}\b/iu;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function hasClimateIntent(message: string) {
  const normalized = normalizeText(message);

  return climateIntentWords.some((word) => normalized.includes(word));
}

function hasHistoricalIntent(message: string) {
  const normalized = normalizeText(message);

  return (
    historicalIntentWords.some((word) => normalized.includes(word)) ||
    dateIntentPattern.test(message)
  );
}

function parseRequestedDate(message: string) {
  const isoMatch = message.match(/\b(\d{4})-(\d{2})-(\d{2})\b/u);

  if (isoMatch?.[0]) {
    return isoMatch[0];
  }

  const dateMatch = message.match(
    /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?\b/iu,
  );

  if (!dateMatch?.[1] || !dateMatch[2]) {
    return null;
  }

  const year = dateMatch[3] ?? String(new Date().getFullYear());
  const month = monthByName[normalizeText(dateMatch[2])];
  const day = dateMatch[1].padStart(2, "0");

  if (!month) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function extractLocation(message: string) {
  const locationMatch = message.match(
    /\b(?:en|para|sobre)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ][A-ZÁÉÍÓÚÑa-záéíóúñ\s.'-]{2,80})/u,
  );

  if (!locationMatch?.[1]) {
    return defaultLocation;
  }

  const location = locationMatch[1]
    .split(
      /\b(?:hoy|mañana|manana|ayer|esta semana|la proxima semana|próxima semana|en los ultimos dias|en los últimos días|ultimos dias|últimos días|ultimas semanas|últimas semanas|y en|durante)\b/iu,
    )[0]
    .replace(dateIntentPattern, "")
    .replace(/[?!.:,;]+$/u, "")
    .replace(/\s+(?:en|en los|en las|los|las|el|la|y)$/iu, "")
    .replace(
      /\s+(?:hoy|mañana|manana|ayer|esta semana|la proxima semana|próxima semana)$/iu,
      "",
    )
    .trim();

  if (!location) {
    return defaultLocation;
  }

  return /colombia|antioquia/iu.test(location)
    ? location
    : `${location}, Antioquia, Colombia`;
}

async function fetchJson<T>(url: URL) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "EnvRisk/0.1 weather context",
    },
    signal: AbortSignal.timeout(toolFetchTimeoutMs),
    next: {
      revalidate: 900,
    },
  });

  if (!response.ok) {
    throw new Error(`${url.hostname} respondio ${response.status}.`);
  }

  return (await response.json()) as T;
}

function getDateRange(daysBack: number) {
  const endDate = new Date();
  const startDate = new Date();

  endDate.setDate(endDate.getDate() - 1);
  startDate.setDate(startDate.getDate() - daysBack);

  return {
    startDate,
    endDate,
    startIso: startDate.toISOString().slice(0, 10),
    endIso: endDate.toISOString().slice(0, 10),
    startCompact: startDate.toISOString().slice(0, 10).replaceAll("-", ""),
    endCompact: endDate.toISOString().slice(0, 10).replaceAll("-", ""),
  };
}

async function geocodeLocation(location: string) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  const searchName = location.split(",")[0]?.trim() || location;

  url.searchParams.set("name", searchName);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const data = await fetchJson<GeocodingResponse>(url);
  const result =
    data.results?.find(
      (item) =>
        item.country === "Colombia" &&
        normalizeText(item.admin1 ?? "") === "antioquia",
    );

  if (
    !result ||
    typeof result.latitude !== "number" ||
    typeof result.longitude !== "number"
  ) {
    return null;
  }

  return {
    name: [result.name, result.admin2, result.admin1, result.country]
      .filter(Boolean)
      .join(", "),
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

async function getForecast(latitude: number, longitude: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
    ].join(","),
  );

  return fetchJson<ForecastResponse>(url);
}

async function getHistoricalWeather(
  latitude: number,
  longitude: number,
  requestedDate?: string | null,
) {
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  const { startIso, endIso } = getDateRange(7);

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("start_date", requestedDate ?? startIso);
  url.searchParams.set("end_date", requestedDate ?? endIso);
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_hours",
      "wind_speed_10m_max",
    ].join(","),
  );

  return fetchJson<ForecastResponse>(url);
}

async function getNasaPowerClimate(
  latitude: number,
  longitude: number,
  requestedDate?: string | null,
) {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  const { startCompact, endCompact } = getDateRange(14);
  const requestedCompact = requestedDate?.replaceAll("-", "");

  url.searchParams.set(
    "parameters",
    ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN", "RH2M", "WS2M"].join(","),
  );
  url.searchParams.set("community", "AG");
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("start", requestedCompact ?? startCompact);
  url.searchParams.set("end", requestedCompact ?? endCompact);
  url.searchParams.set("format", "JSON");

  return fetchJson<NasaPowerResponse>(url);
}

async function getIdeamPrecipitation(municipality: string, department: string) {
  const url = new URL("https://www.datos.gov.co/resource/s54a-sgyg.json");

  url.searchParams.set("departamento", department.toLocaleUpperCase("es-CO"));
  url.searchParams.set("municipio", municipality.toLocaleUpperCase("es-CO"));
  url.searchParams.set("$limit", "12");
  url.searchParams.set("$order", "fechaobservacion DESC");

  return fetchJson<IdeamPrecipitationObservation[]>(url);
}

async function getIdeamStations(municipality: string, department: string) {
  const url = new URL("https://www.datos.gov.co/resource/hp9r-jxuu.json");

  url.searchParams.set("departamento", department);
  url.searchParams.set("municipio", municipality);
  url.searchParams.set("$limit", "8");
  url.searchParams.set("$order", "estado, nombre");

  return fetchJson<IdeamStation[]>(url);
}

async function optionalToolResult<T>(toolCall: Promise<T>) {
  try {
    return await toolCall;
  } catch {
    return null;
  }
}

function formatNumber(value: number | undefined, unit = "") {
  if (typeof value !== "number") {
    return "sin dato";
  }

  return `${Number(value.toFixed(1))}${unit}`;
}

function formatDailyForecast(context: ClimateToolContext) {
  const daily = context.daily;

  if (!daily?.time?.length) {
    return "- Pronostico diario: sin datos disponibles.";
  }

  return daily.time
    .slice(0, 3)
    .map((date, index) => {
      const max = formatNumber(
        daily.temperature_2m_max?.[index],
        context.dailyUnits?.temperature_2m_max ?? "",
      );
      const min = formatNumber(
        daily.temperature_2m_min?.[index],
        context.dailyUnits?.temperature_2m_min ?? "",
      );
      const rain = formatNumber(
        daily.precipitation_sum?.[index],
        context.dailyUnits?.precipitation_sum ?? "",
      );
      const probability = formatNumber(
        daily.precipitation_probability_max?.[index],
        context.dailyUnits?.precipitation_probability_max ?? "",
      );

      return `- ${date}: temp. max ${max}, min ${min}, lluvia acumulada ${rain}, probabilidad maxima de precipitacion ${probability}.`;
    })
    .join("\n");
}

function formatHistoricalWeather(context: ClimateToolContext) {
  const historical = context.historical;

  if (!historical?.time?.length) {
    return "";
  }

  const summary = historical.time
    .map((date, index) => {
      const max = formatNumber(
        historical.temperature_2m_max?.[index],
        context.historicalUnits?.temperature_2m_max ?? "",
      );
      const min = formatNumber(
        historical.temperature_2m_min?.[index],
        context.historicalUnits?.temperature_2m_min ?? "",
      );
      const rain = formatNumber(
        historical.precipitation_sum?.[index],
        context.historicalUnits?.precipitation_sum ?? "",
      );

      return `- ${date}: temp. max ${max}, min ${min}, lluvia acumulada ${rain}.`;
    })
    .join("\n");

  return `
Historico meteorologico reciente consultado con Open-Meteo Archive API:
${summary}
`.trim();
}

function formatNasaPowerContext(context: ClimateToolContext) {
  const parameters = context.nasaPower?.properties?.parameter;
  const fillValue = context.nasaPower?.header?.fill_value ?? -999;

  if (!parameters?.PRECTOTCORR) {
    return "";
  }

  const dates = Object.keys(parameters.PRECTOTCORR).sort();
  const summary = dates
    .slice(-7)
    .map((date) => {
      const precipitation = parameters.PRECTOTCORR?.[date];
      const averageTemperature = parameters.T2M?.[date];
      const humidity = parameters.RH2M?.[date];
      const wind = parameters.WS2M?.[date];
      const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

      if (
        precipitation === fillValue ||
        averageTemperature === fillValue ||
        humidity === fillValue ||
        wind === fillValue
      ) {
        return `- ${formattedDate}: NASA POWER no tiene datos completos disponibles.`;
      }

      return `- ${formattedDate}: precipitacion ${formatNumber(precipitation, "mm/dia")}, temperatura media ${formatNumber(averageTemperature, "C")}, humedad ${formatNumber(humidity, "%")}, viento ${formatNumber(wind, "m/s")}.`;
    })
    .join("\n");

  return `
Contexto climatologico NASA POWER sin API key:
- Fuente: NASA POWER Daily API; periodo ${context.nasaPower?.header?.start ?? "sin inicio"} a ${context.nasaPower?.header?.end ?? "sin fin"}.
${summary}
`.trim();
}

function formatIdeamContext(context: ClimateToolContext) {
  const precipitationRows = context.ideamPrecipitation ?? [];
  const stationRows = context.ideamStations ?? [];

  if (precipitationRows.length === 0 && stationRows.length === 0) {
    return "";
  }

  const precipitationSummary =
    precipitationRows.length > 0
      ? precipitationRows
          .map((row) => {
            const station = row.nombreestacion ?? "estacion sin nombre";
            const value = row.valorobservado ?? "sin dato";
            const unit = row.unidadmedida ?? "";
            const date = row.fechaobservacion ?? "fecha no disponible";

            return `- ${date}: ${value}${unit} en ${station} (${row.descripcionsensor ?? "sensor no especificado"}).`;
          })
          .join("\n")
      : "- Sin observaciones recientes de precipitacion para el municipio consultado.";

  const stationSummary =
    stationRows.length > 0
      ? stationRows
          .map((row) => {
            return `- ${row.nombre ?? "estacion sin nombre"}: ${row.categoria ?? "categoria no disponible"}, estado ${row.estado ?? "sin estado"}, entidad ${row.entidad ?? "sin entidad"}.`;
          })
          .join("\n")
      : "- Sin estaciones encontradas para el municipio consultado.";

  return `
Contexto IDEAM/datos.gov.co sin API key:
- Dataset precipitacion: s54a-sgyg.
- Dataset catalogo de estaciones: hp9r-jxuu.
- Municipio consultado: ${context.municipality}, ${context.department}.
Observaciones recientes de precipitacion:
${precipitationSummary}
Estaciones registradas:
${stationSummary}
`.trim();
}

function formatSourceCoverage(context: ClimateToolContext) {
  const coverage = [
    context.current || context.daily?.time?.length
      ? "Open-Meteo Forecast: disponible"
      : "Open-Meteo Forecast: sin datos",
    context.historical?.time?.length
      ? "Open-Meteo Archive: disponible"
      : "Open-Meteo Archive: sin datos o no solicitado",
    context.nasaPower?.properties?.parameter?.PRECTOTCORR
      ? "NASA POWER: disponible"
      : "NASA POWER: sin datos",
    context.ideamPrecipitation?.length
      ? "IDEAM precipitacion: disponible"
      : "IDEAM precipitacion: sin observaciones recientes para el municipio",
    context.ideamStations?.length
      ? "IDEAM estaciones: disponible"
      : "IDEAM estaciones: sin estaciones encontradas",
  ];

  return `
Cobertura de herramientas ejecutadas:
${coverage.map((item) => `- ${item}.`).join("\n")}
`.trim();
}

function getOpenMeteoPrecipitationForDate(
  context: ClimateToolContext,
  requestedDate: string,
) {
  const index = context.historical?.time?.findIndex((date) => date === requestedDate);

  if (typeof index !== "number" || index < 0) {
    return undefined;
  }

  return context.historical?.precipitation_sum?.[index];
}

function getNasaPowerPrecipitationForDate(
  context: ClimateToolContext,
  requestedDate: string,
) {
  const compactDate = requestedDate.replaceAll("-", "");
  const precipitation =
    context.nasaPower?.properties?.parameter?.PRECTOTCORR?.[compactDate];
  const fillValue = context.nasaPower?.header?.fill_value ?? -999;

  if (typeof precipitation !== "number" || precipitation === fillValue) {
    return undefined;
  }

  return precipitation;
}

function getIdeamPrecipitationForDate(
  context: ClimateToolContext,
  requestedDate: string,
) {
  return (context.ideamPrecipitation ?? []).filter((row) =>
    row.fechaobservacion?.startsWith(requestedDate),
  );
}

function buildDirectPrecipitationAnswer(
  message: string,
  context: ClimateToolContext,
) {
  const normalized = normalizeText(message);
  const requestedDate = parseRequestedDate(message);

  if (
    !requestedDate ||
    (!normalized.includes("precipitacion") && !normalized.includes("lluvia"))
  ) {
    return undefined;
  }

  const openMeteo = getOpenMeteoPrecipitationForDate(context, requestedDate);
  const nasaPower = getNasaPowerPrecipitationForDate(context, requestedDate);
  const ideamRows = getIdeamPrecipitationForDate(context, requestedDate);
  const exactSources = [
    typeof openMeteo === "number" ? "Open-Meteo Archive" : null,
    typeof nasaPower === "number" ? "NASA POWER" : null,
    ideamRows.length > 0 ? "IDEAM/datos.gov.co" : null,
  ].filter(Boolean);

  if (exactSources.length === 0) {
    return undefined;
  }

  const lines = [
    `Para ${context.municipality}, Antioquia, el ${requestedDate}:`,
  ];

  if (typeof openMeteo === "number") {
    lines.push(`- Open-Meteo Archive reporta ${formatNumber(openMeteo, "mm")} de precipitacion acumulada.`);
  }

  if (typeof nasaPower === "number") {
    lines.push(`- NASA POWER reporta ${formatNumber(nasaPower, "mm/dia")} de precipitacion corregida.`);
  }

  if (ideamRows.length > 0) {
    const ideamSummary = ideamRows
      .slice(0, 3)
      .map((row) => {
        const value = row.valorobservado ?? "sin dato";
        const unit = row.unidadmedida ?? "";
        const station = row.nombreestacion ?? "estacion sin nombre";

        return `${value}${unit} en ${station}`;
      })
      .join("; ");

    lines.push(`- IDEAM/datos.gov.co tiene observaciones ese dia: ${ideamSummary}.`);
  }

  if (exactSources.length === 1) {
    lines.push(`Solo encontre este dato exacto en ${exactSources[0]}, asi que debe tomarse como dato de esa fuente y no como registro institucional confirmado.`);
  } else {
    lines.push(`Cruce disponible: ${exactSources.join(", ")}.`);
  }

  lines.push("Estos datos climaticos no son una alerta oficial de emergencia.");

  return lines.join("\n");
}

async function buildClimateData(message: string) {
  const requestedLocation = extractLocation(message);
  const requestedDate = parseRequestedDate(message);
  const location = await geocodeLocation(requestedLocation);

  if (!location) {
    return `
Contexto de herramientas externas:
- Se detecto una consulta climatica, pero no fue posible resolver la ubicacion "${requestedLocation}" con Open-Meteo Geocoding.
- Pide al usuario municipio, corregimiento o coordenadas mas concretas.
`.trim();
  }

  const municipality = location.name.split(",")[0]?.trim() || "Medellin";
  const department = location.name.split(",")[2]?.trim() || "Antioquia";
  const [forecast, historical, nasaPower, ideamPrecipitation, ideamStations] =
    await Promise.all([
    optionalToolResult(getForecast(location.latitude, location.longitude)),
    hasHistoricalIntent(message)
      ? optionalToolResult(
          getHistoricalWeather(
            location.latitude,
            location.longitude,
            requestedDate,
          ),
        )
      : Promise.resolve(null),
    optionalToolResult(
      getNasaPowerClimate(location.latitude, location.longitude, requestedDate),
    ),
    optionalToolResult(getIdeamPrecipitation(municipality, department)),
    optionalToolResult(getIdeamStations(municipality, department)),
  ]);

  return {
    locationName: location.name,
    municipality,
    department,
    latitude: location.latitude,
    longitude: location.longitude,
    generatedAt: new Date().toISOString(),
    current: forecast?.current,
    currentUnits: forecast?.current_units,
    daily: forecast?.daily,
    dailyUnits: forecast?.daily_units,
    historical: historical?.daily,
    historicalUnits: historical?.daily_units,
    nasaPower: nasaPower ?? undefined,
    ideamPrecipitation: ideamPrecipitation ?? [],
    ideamStations: ideamStations ?? [],
  };
}

function formatClimateToolContext(context: ClimateToolContext) {
  const current = context.current;

  return `
Contexto consultado con herramientas externas sin API key:
- Fuente: Open-Meteo Forecast API, Archive API cuando aplica, Geocoding API, NASA POWER API e IDEAM/datos.gov.co.
- Fecha de consulta del servidor: ${context.generatedAt}.
- Ubicacion resuelta: ${context.locationName} (${context.latitude}, ${context.longitude}).
- Condicion actual reportada para ${current?.time ?? "hora no disponible"}: temperatura ${formatNumber(current?.temperature_2m, context.currentUnits?.temperature_2m ?? "")}, humedad ${formatNumber(current?.relative_humidity_2m, context.currentUnits?.relative_humidity_2m ?? "")}, precipitacion ${formatNumber(current?.precipitation, context.currentUnits?.precipitation ?? "")}, lluvia ${formatNumber(current?.rain, context.currentUnits?.rain ?? "")}, viento ${formatNumber(current?.wind_speed_10m, context.currentUnits?.wind_speed_10m ?? "")}.
${formatDailyForecast(context)}
${formatHistoricalWeather(context)}
${formatNasaPowerContext(context)}
${formatIdeamContext(context)}
${formatSourceCoverage(context)}

Instrucciones para responder:
- Usa estos datos solo si son relevantes para la pregunta del usuario.
- Si esta seccion contiene datos numericos utiles para responder, responde con esos datos y no digas que no tienes acceso.
- Antes de responder una consulta climatica puntual o historica, revisa la cobertura de herramientas ejecutadas.
- Si hay mas de una fuente con datos relevantes, compara las fuentes y menciona diferencias importantes.
- Si solo una fuente tiene el dato exacto solicitado, dilo explicitamente: "solo encontre este dato exacto en [fuente]".
- Menciona las fuentes usadas de forma breve: Open-Meteo, NASA POWER e IDEAM/datos.gov.co, segun aplique.
- No presentes estos datos como alerta oficial de emergencia.
- No presentes el historico meteorologico como registro confirmado de danos, desastres o sucesos oficiales.
- Si el usuario pide alertas oficiales, recomienda verificar IDEAM, DAGRAN o autoridades locales segun la zona.
`.trim();
}

export async function getClimateContextForMessage(message: string) {
  if (!hasClimateIntent(message)) {
    return null;
  }

  try {
    const climateData = await buildClimateData(message);

    if (typeof climateData === "string") {
      return {
        context: climateData,
      };
    }

    return {
      context: formatClimateToolContext(climateData),
      directAnswer: buildDirectPrecipitationAnswer(message, climateData),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "error desconocido";

    return {
      context: `
Contexto de herramientas externas:
- Se detecto una consulta climatica, pero las herramientas climaticas no respondieron correctamente (${detail}).
- Responde con orientacion general y aclara que no hay datos climaticos verificados disponibles para esta respuesta.
`.trim(),
    };
  }
}
