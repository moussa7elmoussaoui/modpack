function optionalParameter(parameter, fn) {
  if (parameter === undefined) return;
  fn(parameter);
}

function soundParameter(parameter, source, isGlobal = true) {
  if (parameter === undefined) return;

  const sound = parameter.sound;
  const options = {
    pitch: resolveRange(parameter.pitch ?? 1.0),
    volume: resolveRange(parameter.volume ?? 1.0)
  };

  if (isGlobal) {
    source.dimension.playSound(sound, source.location, options);
  } else {
    source.playSound(sound, options);
  }  
}

function resolveRange(value) {
  if (Array.isArray(value)) {
    const [ min, max ] = value;
    return min + (Math.random() * (max - min));
  }
  return value;
}

export const paramsUtil = {
  optional: optionalParameter,
  playSound: soundParameter
};
