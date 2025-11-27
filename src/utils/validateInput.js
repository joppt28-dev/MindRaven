const isBlank = (value) => !value || !String(value).trim();

const validateIdeaRequest = (topic) => {
  if (isBlank(topic)) {
    return 'El campo "areaInteres" es obligatorio.';
  }

  if (String(topic).length < 5) {
    return 'La descripción del tema debe tener al menos 5 caracteres.';
  }

  return null;
};

module.exports = {
  validateIdeaRequest,
};
