/**
 * CardSchemaService
 * Define e valida schemas por typeKey de card
 */

export interface CardSchema {
  typeKey: string;
  fields: {
    [key: string]: {
      type: 'string' | 'array' | 'object' | 'number' | 'boolean';
      required?: boolean;
      default?: any;
    };
  };
}

const CARD_SCHEMAS: Record<string, CardSchema> = {
  'idea.base': {
    typeKey: 'idea.base',
    fields: {
      name: { type: 'string', required: true, default: '' },
      pitch: { type: 'string', default: '' },
      problem: { type: 'string', default: '' },
      solution: { type: 'string', default: '' },
      targetAudience: { type: 'string', default: '' },
      valueProposition: { type: 'string', default: '' },
    },
  },
  'scope.features': {
    typeKey: 'scope.features',
    fields: {
      features: { 
        type: 'array', 
        required: true, 
        default: [] 
      },
      moscow: { 
        type: 'object', 
        default: { must: [], should: [], could: [], wont: [] } 
      },
      effort: { 
        type: 'object', 
        default: { low: [], medium: [], high: [] } 
      },
    },
  },
  'tech.stack': {
    typeKey: 'tech.stack',
    fields: {
      frontend: { type: 'array', default: [] },
      backend: { type: 'array', default: [] },
      database: { type: 'array', default: [] },
      infrastructure: { type: 'array', default: [] },
      integrations: { type: 'array', default: [] },
      risks: { type: 'array', default: [] },
      pros: { type: 'array', default: [] },
      cons: { type: 'array', default: [] },
    },
  },
};

export class CardSchemaService {
  static getSchema(typeKey: string): CardSchema | null {
    return CARD_SCHEMAS[typeKey] || null;
  }

  static getDefaultFields(typeKey: string): Record<string, any> {
    const schema = this.getSchema(typeKey);
    if (!schema) return {};

    const defaults: Record<string, any> = {};
    for (const [key, field] of Object.entries(schema.fields)) {
      defaults[key] = field.default;
    }
    return defaults;
  }

  static validateFields(typeKey: string, fields: Record<string, any>): { valid: boolean; errors: string[] } {
    const schema = this.getSchema(typeKey);
    if (!schema) {
      return { valid: false, errors: [`Unknown card type: ${typeKey}`] };
    }

    const errors: string[] = [];

    for (const [key, fieldDef] of Object.entries(schema.fields)) {
      const value = fields[key];

      // Check required
      if (fieldDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field "${key}" is required`);
        continue;
      }

      // Check type
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== fieldDef.type) {
          errors.push(`Field "${key}" should be ${fieldDef.type}, got ${actualType}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static mergeWithDefaults(typeKey: string, fields: Record<string, any>): Record<string, any> {
    const defaults = this.getDefaultFields(typeKey);
    return { ...defaults, ...fields };
  }
}

