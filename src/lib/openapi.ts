import path from 'path'
import { writeFileSync } from 'fs'

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, unknown>
  components: {
    schemas: Record<string, unknown>
    securitySchemes: Record<string, unknown>
  }
}

export function generateOpenAPISpec(): OpenAPISpec {
  return {
    openapi: '3.0.0',
    info: {
      title: 'StockAlert API',
      version: '2.0.0',
      description: `Comprehensive inventory management API with multi-user support, 
                   sales tracking, batch management, and audit trails.`
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.stockalert.com/api',
        description: 'Production server'
      }
    ],
    paths: {
      '/auth/signup': {
        post: {
          summary: 'Register new user',
          description: 'Create a new user account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserSignup' }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '400': {
              description: 'Invalid input'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user and create session',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserLogin' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '401': {
              description: 'Invalid credentials'
            }
          }
        }
      },
      '/products': {
        get: {
          summary: 'List products',
          description: 'Get all products with optional filters',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              description: 'Search by name or SKU',
              schema: { type: 'string' }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create product',
          description: 'Add a new product to inventory',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductCreate' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Product created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        }
      },
      '/products/{id}': {
        get: {
          summary: 'Get product',
          description: 'Get details of a specific product',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Product details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            },
            '404': {
              description: 'Product not found'
            }
          }
        },
        put: {
          summary: 'Update product',
          description: 'Update product details',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductUpdate' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete product',
          description: 'Delete a product',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '204': {
              description: 'Product deleted'
            },
            '404': {
              description: 'Product not found'
            }
          }
        }
      },
      '/products/{id}/stock': {
        post: {
          summary: 'Update product stock',
          description: 'Adjust stock quantity (add/remove/restock)',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StockUpdate' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Stock updated'
            }
          }
        }
      },
      '/products/{id}/variants': {
        get: {
          summary: 'List product variants',
          description: 'Get all variants for a product',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'List of variants',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ProductVariant' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create variant',
          description: 'Add a new variant to product',
          tags: ['Products'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductVariantCreate' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Variant created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProductVariant' }
                }
              }
            }
          }
        }
      },
      '/sales': {
        get: {
          summary: 'List sales',
          description: 'Get all sales with filters',
          tags: ['Sales'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'start_date',
              in: 'query',
              schema: { type: 'string', format: 'date' }
            },
            {
              name: 'end_date',
              in: 'query',
              schema: { type: 'string', format: 'date' }
            }
          ],
          responses: {
            '200': {
              description: 'List of sales',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Sale' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create sale',
          description: 'Create a new sale with items',
          tags: ['Sales'],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SaleCreate' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Sale created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Sale' }
                }
              }
            }
          }
        }
      },
      '/team': {
        get: {
          summary: 'List team members',
          description: 'Get all team members in organization',
          tags: ['Team'],
          security: [{ cookieAuth: [] }],
          responses: {
            '200': {
              description: 'Team members list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      team: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      },
                      pendingInvitations: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Invitation' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Invite team member',
          description: 'Send invitation to join organization',
          tags: ['Team'],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InviteCreate' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Invitation created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Invitation' }
                }
              }
            }
          }
        }
      },
      '/backup': {
        get: {
          summary: 'Export backup',
          description: 'Export all data as JSON or SQL',
          tags: ['Backup'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'format',
              in: 'query',
              schema: { type: 'string', enum: ['json', 'sql'], default: 'json' }
            }
          ],
          responses: {
            '200': {
              description: 'Backup file',
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Restore backup',
          description: 'Restore data from backup file',
          tags: ['Backup'],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Backup restored'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        UserSignup: {
          type: 'object',
          required: ['email', 'password', 'full_name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            full_name: { type: 'string', minLength: 2 }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role: { type: 'string', enum: ['owner', 'admin', 'editor', 'viewer'] },
            organization_id: { type: 'integer' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            category: { type: 'string' },
            current_quantity: { type: 'integer' },
            reorder_point: { type: 'integer' },
            unit_cost: { type: 'number' },
            selling_price: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ProductCreate: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            category: { type: 'string' },
            current_quantity: { type: 'integer', default: 0 },
            reorder_point: { type: 'integer', default: 0 },
            unit_cost: { type: 'number', default: 0 },
            selling_price: { type: 'number', default: 0 },
            supplier_id: { type: 'integer' }
          }
        },
        ProductVariant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            variant_name: { type: 'string' },
            sku: { type: 'string' },
            current_quantity: { type: 'integer' },
            unit_cost: { type: 'number' },
            selling_price: { type: 'number' }
          }
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sale_number: { type: 'string' },
            sale_date: { type: 'string', format: 'date-time' },
            total: { type: 'number' },
            payment_status: { type: 'string', enum: ['paid', 'pending', 'refunded'] }
          }
        },
        Invitation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time' }
          }
        }
      },
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'user_id',
          description: 'Cookie-based authentication'
        }
      }
    }
  }
}

export function writeOpenAPISpec() {
  const spec = generateOpenAPISpec()
  const outputPath = path.join(process.cwd(), 'public', 'openapi.json')
  
  writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8')
  console.log(`OpenAPI spec written to ${outputPath}`)

  return spec
}

if (require.main === module) {
  writeOpenAPISpec()
}
