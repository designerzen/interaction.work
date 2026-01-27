import { MESH_ANNOTATIONS } from './face-landmark-constants.js'

export const FACE_CONTOURS = MESH_ANNOTATIONS

export const MOUTH_SHAPE_CLOSED = "-"
export const MOUTH_SHAPE_O = "o"
export const MOUTH_SHAPE_E = "e"
export const MOUTH_SHAPE_I = "i"
export const MOUTH_SHAPE_U = "u"

// Tweakable parameters - these use the dark art of fiddling
// a mouth covers about 1/3 of the face?
export const RATIO_OF_MOUTH_TO_FACE = 0.25
export const EYE_CLOSED_AT = 20.2 //.5
export const PITCH_SCALE = 8