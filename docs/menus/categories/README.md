# Menu Categories API Documentation

This directory contains the OpenAPI 3.0 documentation for the Menu Categories API endpoints.

## 📁 File Structure

```
categories/
├── README.md                    # This file
├── get.yaml                     # GET endpoints documentation
├── post.yaml                    # POST endpoint documentation
├── patch.yaml                   # PATCH endpoint documentation
├── delete.yaml                  # DELETE endpoint documentation
├── search.yaml                  # Search endpoint documentation
├── bulk-delete.yaml             # Bulk delete endpoint documentation
└── schemas/
    ├── components.yaml          # Request/Response schemas
    └── menu-category.yaml       # MenuCategory entity schema
```

## 🚀 Available Endpoints

### **GET Endpoints**
- `GET /menus/categories` - Get all categories with pagination
- `GET /menus/categories/search` - Search categories with filtering
- `GET /menus/categories/{id}` - Get specific category by ID

### **POST Endpoints**
- `POST /menus/categories` - Create new category

### **PATCH Endpoints**
- `PATCH /menus/categories/{id}` - Update existing category

### **DELETE Endpoints**
- `DELETE /menus/categories/{id}` - Soft delete single category
- `DELETE /menus/categories/bulk` - Bulk soft delete multiple categories

## 📋 API Features

### **Pagination**
All list endpoints support pagination with the following parameters:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page

### **Search & Filtering**
The search endpoint supports:
- `search` (string) - Name-based search (case-insensitive)
- `active` (boolean) - Filter by active status

### **Validation Rules**
- **Name**: 3-100 characters, required, unique
- **Description**: 1-500 characters, optional
- **Order**: 0-999, integer, required
- **ID**: Positive integer, required for path parameters

### **Soft Delete**
- Categories are soft-deleted (marked as deleted, not physically removed)
- Deleted categories are excluded from list/search results
- Soft-deleted categories can be retrieved by ID

## 🔧 Response Format

All endpoints return consistent JSON responses:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {
    // Response data
  }
}
```

### **Error Response Format**
```json
{
  "status": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## 📊 HTTP Status Codes

- **200** - Success (GET, DELETE)
- **201** - Created (POST)
- **202** - Accepted (PATCH)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict (duplicate names)

## 🛡️ Security

- All endpoints require authentication
- Role-based access control may be implemented
- Input validation at multiple layers
- SQL injection protection through Prisma ORM

## 📝 Usage Examples

### **Create a Category**
```bash
curl -X POST /menus/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desserts",
    "description": "Sweet treats and desserts",
    "order": 4
  }'
```

### **Search Categories**
```bash
curl -X GET "/menus/categories/search?search=main&active=true&page=1&limit=20"
```

### **Bulk Delete Categories**
```bash
curl -X DELETE /menus/categories/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2, 3, 4, 5]
  }'
```

## 🔄 Business Logic

### **Duplicate Name Prevention**
- System prevents creation of categories with duplicate names
- Updates check for name conflicts (excluding the current category)
- Case-insensitive name comparison

### **Order Management**
- Order field determines display sequence
- Valid range: 0-999
- Duplicate orders are allowed

### **Soft Delete Implementation**
- Categories marked as deleted remain in database
- Deleted categories excluded from normal queries
- Recovery possible through database operations

## 📈 Performance Considerations

- **Pagination**: Limits data transfer and improves response times
- **Indexing**: Database indexes on name, order, and deleted fields
- **Parallel Queries**: Data and count queries executed concurrently
- **Bulk Operations**: Efficient batch processing for multiple records

## 🧪 Testing

Each endpoint includes comprehensive examples in the documentation:
- Request examples with realistic data
- Response examples showing expected format
- Error examples for common failure scenarios

## 📚 Related Documentation

- [Menu Items API](../items/) - For menu items within categories
- [Authentication API](../../auth/) - For authentication requirements
- [User Management API](../../users/) - For user-related operations

## 🔗 Integration

This API integrates with:
- **Menu Items**: Categories contain menu items
- **User Management**: User permissions and roles
- **Ordering System**: Category order affects menu display
- **Search System**: Full-text search capabilities

---

*Last updated: January 2024*
*API Version: v1* 