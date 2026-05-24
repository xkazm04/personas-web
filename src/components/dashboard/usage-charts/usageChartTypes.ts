export interface BarDatum {
  name: string;
  invocations: number;
}

export interface PieDatum {
  name: string;
  value: number;
  color?: string;
}

export interface AreaDatum {
  [key: string]: string | number;
}

export interface PersonaBarDatum {
  [key: string]: string | number;
}
