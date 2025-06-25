// Shared JSON schemas for API endpoints

export const enhanceSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" }
  },
  required: ["title", "summary"],
  additionalProperties: false
}

export const metadataSchemas = {
  task: {
    type: "object",
    properties: {
      due_date: { type: "string" },
      cleaned_content: { type: "string" }
    },
    additionalProperties: false
  },
  idea: {
    type: "object", 
    properties: {
      title: { type: "string" },
      summary: { type: "string" }
    },
    required: ["title", "summary"],
    additionalProperties: false
  },
  meeting: {
    type: "object",
    properties: {
      title: { type: "string" },
      date: { type: "string" },
      time: { type: "string" }
    },
    additionalProperties: false
  },
  reading: {
    type: "object",
    properties: {
      link: { type: "string" },
      title: { type: "string" },
      summary: { type: "string" }
    },
    additionalProperties: false
  }
}

export const classificationSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["task", "idea", "journal", "meeting", "reading", "misc"]
    },
    metadata: {
      type: "object",
      properties: {
        due_date: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        date: { type: "string" },
        time: { type: "string" },
        link: { type: "string" },
        cleaned_content: { type: "string" }
      },
      additionalProperties: false
    },
    cleaned_content: { type: "string" }
  },
  required: ["category", "metadata"],
  additionalProperties: false
}