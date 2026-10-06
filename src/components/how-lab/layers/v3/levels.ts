import { LAYERS, type LayerDef } from "../shared/layers";

/** The layer that carries each zoom level: task = Design, chain = Coordinate, fleet = Monitor, computer = Run. */
export const LEVEL_LAYERS: LayerDef[] = [LAYERS[2], LAYERS[1], LAYERS[3], LAYERS[0]];
